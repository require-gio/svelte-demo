<!--
  InteractiveExplorer – Column-level visual analytics
  
  Numeric columns → BarChart histogram with adjustable bin width
  String/Bool columns → PieChart with distinct value counts
-->

<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { scaleBand } from 'd3-scale';
  import type { ColumnInfo } from '$lib/types';
  import type { HistogramBucket, DistinctValueCount } from '$lib/server/databricks';
  import * as Select from '$lib/components/ui/select';
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import * as Chart from "$lib/components/ui/chart/index.js";
  import { BarChart, PieChart, Pie, Group, Text, Arc } from 'layerchart';

  let {
    tableName,
    shortName = '',
    schema = [],
  }: {
    tableName: string;
    shortName?: string;
    schema: ColumnInfo[];
  } = $props();

  // ============================================================
  // Column type classification
  // ============================================================
  const NUMERIC_TYPES = new Set([
    'INT', 'INTEGER', 'BIGINT', 'LONG', 'SMALLINT', 'TINYINT',
    'FLOAT', 'DOUBLE', 'DECIMAL', 'NUMERIC', 'SHORT', 'BYTE'
  ]);
  const CATEGORICAL_TYPES = new Set(['STRING', 'VARCHAR', 'CHAR', 'BOOLEAN', 'BOOL']);

  function getColumnCategory(type: string): 'numeric' | 'categorical' | 'other' {
    const upper = type.toUpperCase().replace(/\(.*\)/, '').trim();
    if (NUMERIC_TYPES.has(upper)) return 'numeric';
    if (CATEGORICAL_TYPES.has(upper)) return 'categorical';
    return 'other';
  }

  // Filter columns to only supported types
  let selectableColumns = $derived(
    schema.filter((col) => getColumnCategory(col.type) !== 'other')
  );

  let selectedColumn = $derived.by(() => {
    const param = page.url.searchParams.get('column');
    if (param && selectableColumns.some((c) => c.name === param)) return param;
    return selectableColumns.length > 0 ? selectableColumns[0].name : '';
  });

  let binWidth = $derived.by(() => {
    const param = page.url.searchParams.get('binWidth');
    if (param) {
      const n = Number(param);
      if (BIN_WIDTH_OPTIONS.includes(n)) return n;
    }
    return 1;
  });

  const BIN_WIDTH_OPTIONS = [0.1, 1, 5, 10, 100, 1000, 10000];

  function updateUrlParam(key: string, value: string) {
    const url = new URL(page.url);
    url.searchParams.set(key, value);
    goto(url.toString(), { replaceState: true, noScroll: true, keepFocus: true });
  }

  let selectedColumnInfo = $derived(schema.find((c) => c.name === selectedColumn));
  let columnCategory = $derived(
    selectedColumnInfo ? getColumnCategory(selectedColumnInfo.type) : 'other'
  );

  // ============================================================
  // Histogram query (numeric columns)
  // ============================================================
  const histogramQuery = createQuery<HistogramBucket[]>(() => ({
    queryKey: ['histogram', tableName, selectedColumn, binWidth],
    queryFn: async () => {
      const params = new URLSearchParams({
        column: selectedColumn,
        binWidth: String(binWidth)
      });
      const res = await fetch(`/api/stats/${encodeURIComponent(tableName)}/histogram?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Histogram konnte nicht geladen werden.');
      }
      return res.json();
    },
    enabled: columnCategory === 'numeric' && !!selectedColumn
  }));

  // ============================================================
  // Distinct values query (categorical columns)
  // ============================================================
  const distinctQuery = createQuery<DistinctValueCount[]>(() => ({
    queryKey: ['distinct', tableName, selectedColumn],
    queryFn: async () => {
      const params = new URLSearchParams({ column: selectedColumn });
      const res = await fetch(`/api/stats/${encodeURIComponent(tableName)}/distinct?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? 'Distinct-Werte konnten nicht geladen werden.');
      }
      return res.json();
    },
    enabled: columnCategory === 'categorical' && !!selectedColumn
  }));

  // ============================================================
  // Chart data transforms
  // ============================================================
  const CHART_COLORS = [
    '#c4b5fd', '#a78bfa', '#818cf8', '#93c5fd', '#7dd3fc',
    '#d8b4fe', '#f0abfc', '#86efac', '#fca5a5', '#fde68a'
  ];

  let barChartData = $derived(
    (histogramQuery.data ?? []).map((b) => ({
      label: binWidth >= 1
        ? `${b.bucketStart.toLocaleString('de-DE')}–${b.bucketEnd.toLocaleString('de-DE')}`
        : `${b.bucketStart}–${b.bucketEnd}`,
      count: b.count
    }))
  );

  let pieChartData = $derived(
    (distinctQuery.data ?? []).map((d, i) => ({
      category: d.value,
      count: d.count,
      color: CHART_COLORS[i % CHART_COLORS.length]
    }))
  );

  let chartConfig = $derived(
    Object.fromEntries(
      pieChartData.map((d) => [
        d.category,
        { label: `${d.category} (${d.count.toLocaleString('de-DE')})`, color: d.color }
      ])
    ) satisfies Chart.ChartConfig
  );

  let isLoading = $derived(
    (columnCategory === 'numeric' && histogramQuery.isLoading) ||
    (columnCategory === 'categorical' && distinctQuery.isLoading)
  );

  let isFetching = $derived(
    (columnCategory === 'numeric' && histogramQuery.isFetching) ||
    (columnCategory === 'categorical' && distinctQuery.isFetching)
  );

  let queryError = $derived(
    (columnCategory === 'numeric' && histogramQuery.isError ? histogramQuery.error : null) ||
    (columnCategory === 'categorical' && distinctQuery.isError ? distinctQuery.error : null)
  );

  let totalCount = $derived(
    columnCategory === 'numeric'
      ? barChartData.reduce((s, b) => s + b.count, 0)
      : pieChartData.reduce((s, d) => s + d.count, 0)
  );
</script>

<div class="h-full flex flex-col">
  <!-- Controls -->
  <div class="px-6 py-4 shrink-0">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-3">
          <h2 class="text-lg font-medium">{shortName || tableName}</h2>
          <Badge variant="secondary">Interaktiv</Badge>
          {#if isFetching}
            <Badge variant="outline" class="animate-pulse">Laden…</Badge>
          {/if}
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <!-- Column selector -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Spalte:</span>
            <Select.Root
              type="single"
              value={selectedColumn}
              onValueChange={(v) => { if (v) updateUrlParam('column', v); }}
            >
              <Select.Trigger class="w-56">
                {selectedColumnInfo?.name ?? 'Spalte wählen…'}
              </Select.Trigger>
              <Select.Content>
                {#each selectableColumns as col}
                  <Select.Item value={col.name}>
                    <span class="font-medium">{col.name}</span>
                    <span class="text-xs text-muted-foreground ml-2">
                      ({col.type})
                    </span>
                  </Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>

          <!-- Bin width selector (numeric only) -->
          {#if columnCategory === 'numeric'}
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">Breite:</span>
              <Select.Root
                type="single"
                value={String(binWidth)}
                onValueChange={(v) => { if (v) updateUrlParam('binWidth', v); }}
              >
                <Select.Trigger class="w-24">{binWidth}</Select.Trigger>
                <Select.Content>
                  {#each BIN_WIDTH_OPTIONS as bw}
                    <Select.Item value={String(bw)}>{bw}</Select.Item>
                  {/each}
                </Select.Content>
              </Select.Root>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Chart area -->
  <div class="flex-1 overflow-auto px-6 pb-6">
    <div class="max-w-7xl mx-auto">
      {#if !selectedColumn}
        <div class="flex items-center justify-center h-48">
          <p class="text-muted-foreground">Bitte wähle eine Spalte aus.</p>
        </div>
      {:else if isLoading}
        <div class="flex items-center justify-center h-48">
          <p class="text-muted-foreground">Daten werden geladen…</p>
        </div>
      {:else if queryError}
        <div class="flex items-center justify-center h-48">
          <p class="text-destructive">{queryError?.message ?? 'Fehler beim Laden'}</p>
        </div>
      {:else if columnCategory === 'numeric' && barChartData.length > 0}
        <!-- BarChart: Numeric distribution -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Verteilung: {selectedColumn}</Card.Title>
            <Card.Description>
              Histogramm mit Breite {binWidth} — {barChartData.length} Bereiche
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Chart.Container config={{ count: { label: 'Anzahl', color: 'var(--chart-1)' } }}>
              <div class="h-[400px] w-full">
                <BarChart
                  data={barChartData}
                  xScale={scaleBand().padding(0.25)}
                  x="label"
                  series={[{ key: 'count', label: 'Anzahl', color: 'var(--chart-1)' }]}
                  props={{
                    bars: {
                      stroke: 'none',
                      rounded: 'all',
                      radius: 6,
                    },
                    highlight: { area: { fill: 'none' } },
                    tooltip: {
                      root: {
                        variant: 'none',
                        classes: {
                          container: 'bg-popover text-popover-foreground border border-border rounded-lg px-3 py-1.5 shadow-xl text-sm',
                        },
                      },
                    },
                  }}
                />
              </div>
            </Chart.Container>
          </Card.Content>
          <Card.Footer class="text-sm text-muted-foreground">
            Gesamt: {totalCount.toLocaleString('de-DE')} Werte
          </Card.Footer>
        </Card.Root>
      {:else if columnCategory === 'categorical' && pieChartData.length > 0}
        <!-- PieChart: Categorical distribution -->
        <Card.Root>
          <Card.Header class="items-center">
            <Card.Title>Verteilung: {selectedColumn}</Card.Title>
            <Card.Description>
              {pieChartData.length} unterschiedliche Werte
            </Card.Description>
          </Card.Header>
          <Card.Content class="flex justify-center">
          <Chart.Container config={chartConfig} class="aspect-square max-h-[400px] w-full max-w-[400px]">
            <PieChart
              data={pieChartData}
              key="category"
              value="count"
              c="category"
              cRange={pieChartData.map((d) => d.color)}
              props={{
                pie: {
                  motion: "tween",
                },
                legend: {
                  classes: { swatch: 'shrink-0' },
                },
              }}
              legend
            >
              {#snippet marks({ visibleData, cScale, c })}
                <Group>
                  <Pie data={visibleData} let:arcs>
                    {#each arcs as arc}
                      <Arc
                        startAngle={arc.startAngle}
                        endAngle={arc.endAngle}
                        fill={cScale?.(c(arc.data))}
                      >
                        {#snippet children({ centroid })}
                          <Text
                            value={arc.data.category}
                            x={centroid[0]}
                            y={centroid[1]}
                            textAnchor="middle"
                            verticalAnchor="middle"
                            font-size="12"
                            class="fill-background capitalize"
                          />
                        {/snippet}
                      </Arc>
                    {/each}
                  </Pie>
                </Group>
              {/snippet}
            </PieChart>
          </Chart.Container>
          </Card.Content>
          <Card.Footer class="flex-col gap-2 text-sm items-center">
            <div class="text-muted-foreground leading-none">
              Gesamt: {totalCount.toLocaleString('de-DE')} Werte
            </div>
          </Card.Footer>
        </Card.Root>
      {:else}
        <div class="flex items-center justify-center h-48">
          <p class="text-muted-foreground">Keine Daten für diese Spalte verfügbar.</p>
        </div>
      {/if}
    </div>
  </div>
</div>
