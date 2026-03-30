<!--
  AI Table – Schema-Explorer, Daten-Explorer & Chat
  
  Der Schema-Explorer nutzt die Unity Catalog Tables API (kein Warehouse).
  Der Daten-Explorer nutzt die SQL Statement Execution API (Warehouse).
  Der Chat nutzt die Databricks Genie Conversation API.
  Daten werden via TanStack Query geladen, Tabellen via TanStack Table gerendert.
-->

<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import type { ColumnDef } from '@tanstack/svelte-table';
  import type { TableInfo, ColumnInfo } from '$lib/types';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import DataTable from '$lib/components/data-table.svelte';
  import DataExplorer from '$lib/components/data-explorer.svelte';
  import ChatWindow from '$lib/components/chat-window.svelte';
  import InteractiveExplorer from '$lib/components/interactive-explorer.svelte';
  import * as Tabs from '$lib/components/ui/tabs';
  import * as Card from '$lib/components/ui/card';
  import * as Select from '$lib/components/ui/select';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';

  // ============================================================
  // URL-SYNCED TAB STATE
  // ============================================================
  const VALID_TABS = ['explorer', 'data', 'interactive', 'chat'] as const;
  type TabKey = typeof VALID_TABS[number];

  let activeTab: TabKey = $derived.by(() => {
    const param = page.url.searchParams.get('tab');
    if (param && VALID_TABS.includes(param as TabKey)) return param as TabKey;
    return 'explorer';
  });

  function onTabChange(value: string) {
    const url = new URL(page.url);
    url.searchParams.set('tab', value);
    goto(url.toString(), { replaceState: true, noScroll: true, keepFocus: true });
  }

  // ============================================================
  // TABLE DATA FETCHING (TanStack Query)
  // ============================================================
  const tablesQuery = createQuery<TableInfo[]>(() => ({
    queryKey: ['tables'],
    queryFn: async () => {
      const res = await fetch('/api/tables');
      if (!res.ok) throw new Error('Tabellen konnten nicht geladen werden.');
      return res.json();
    }
  }));

  // ============================================================
  // SHARED STATE (URL-synced)
  // ============================================================
  let selectedTable = $derived.by(() => {
    const param = page.url.searchParams.get('table');
    if (param && tablesQuery.data?.some((t) => t.name === param)) return param;
    return tablesQuery.data?.[0]?.name ?? '';
  });

  let schemaFilter: string = $state('');

  // Auto-set table URL param when tables first load and no param exists
  $effect(() => {
    if (tablesQuery.data?.length && !page.url.searchParams.get('table')) {
      const url = new URL(page.url);
      url.searchParams.set('table', tablesQuery.data[0].name);
      goto(url.toString(), { replaceState: true, noScroll: true, keepFocus: true });
    }
  });

  function setSelectedTable(v: string) {
    const url = new URL(page.url);
    url.searchParams.set('table', v);
    // Clear interactive-tab params when switching tables
    url.searchParams.delete('column');
    url.searchParams.delete('binWidth');
    goto(url.toString(), { replaceState: true, noScroll: true, keepFocus: true });
  }

  let currentTableInfo = $derived(
    tablesQuery.data?.find((t) => t.name === selectedTable)
  );

  // ============================================================
  // SCHEMA TABLE COLUMNS (TanStack Table)
  // ============================================================
  const schemaColumns: ColumnDef<ColumnInfo, unknown>[] = [
    { accessorKey: 'position', header: '#' },
    { accessorKey: 'name', header: 'Spaltenname' },
    { accessorKey: 'type', header: 'Datentyp' },
    {
      id: 'nullable',
      accessorFn: (row) => (row.nullable ? 'Ja' : 'Nein'),
      header: 'Nullable'
    },
    {
      accessorKey: 'comment',
      header: 'Beschreibung'
    }
  ];
</script>

<!-- ============================================================ -->
<!-- LAYOUT                                                        -->
<!-- ============================================================ -->

<div class="flex flex-col h-full min-h-0">
  <!-- Header -->
  <div class="px-6 py-5 shrink-0">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">Conversational BI</h1>
        <p class="text-sm text-muted-foreground mt-0.5">
          Versicherungsdaten – Erkunden & Fragen
        </p>
      </div>

      <!-- Tabellen-Auswahl -->
      {#if tablesQuery.data && tablesQuery.data.length > 0}
        <div class="flex items-center gap-3">
          <span class="text-sm text-muted-foreground">Tabelle:</span>
          <Select.Root type="single" value={selectedTable} onValueChange={(v) => { if (v) setSelectedTable(v); }}>
            <Select.Trigger class="w-70">
              {currentTableInfo?.shortName ?? 'Tabelle wählen...'}
            </Select.Trigger>
            <Select.Content>
              {#each tablesQuery.data as table}
                <Select.Item value={table.name}>
                  <span class="font-medium">{table.shortName}</span>
                  <span class="text-xs text-muted-foreground ml-2">({table.schema.length} Spalten)</span>
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
      {/if}
    </div>
  </div>

  <!-- Tabs: Schema-Explorer, Data, Interactive & Chat -->
  <Tabs.Root value={activeTab} onValueChange={onTabChange} class="flex-1 flex flex-col min-h-0">
    <div class="px-6 shrink-0">
      <div class="max-w-7xl mx-auto">
        <Tabs.List class="w-auto">
          <Tabs.Trigger value="explorer">Schema</Tabs.Trigger>
          <Tabs.Trigger value="data">Tabelle</Tabs.Trigger>
          <Tabs.Trigger value="interactive">Explorer</Tabs.Trigger>
          <Tabs.Trigger value="chat">Chat</Tabs.Trigger>
        </Tabs.List>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- TAB 1: SCHEMA-EXPLORER                                       -->
    <!-- ============================================================ -->
    <Tabs.Content value="explorer" class="flex-1 overflow-hidden m-0 p-0">
      <div class="h-full flex flex-col">
        {#if tablesQuery.isLoading}
          <div class="flex-1 flex items-center justify-center">
            <p class="text-muted-foreground">Tabellen werden geladen...</p>
          </div>
        {:else if tablesQuery.isError}
          <div class="flex-1 flex items-center justify-center">
            <p class="text-destructive">{tablesQuery.error?.message ?? 'Fehler beim Laden'}</p>
          </div>
        {:else if !tablesQuery.data?.length}
          <div class="flex-1 flex items-center justify-center">
            <p class="text-muted-foreground">Keine Tabellen konfiguriert.</p>
          </div>
        {:else}
          <!-- Schema-Info & Filter -->
          <div class="px-6 py-4 shrink-0">
            <div class="max-w-7xl mx-auto">
              <div class="flex items-center justify-between gap-4 mb-3">
                <div class="flex items-center gap-3">
                  <h2 class="text-lg font-medium">{currentTableInfo?.shortName}</h2>
                  {#if currentTableInfo}
                    <Badge variant="secondary">{currentTableInfo.schema.length} Spalten</Badge>
                    {#if currentTableInfo.tableType}
                      <Badge variant="outline">{currentTableInfo.tableType}</Badge>
                    {/if}
                  {/if}
                </div>
                <Input
                  type="search"
                  placeholder="Spalten filtern..."
                  class="max-w-xs"
                  bind:value={schemaFilter}
                />
              </div>

              <!-- Tabellen-Beschreibung -->
              {#if currentTableInfo?.comment}
                <p class="text-sm text-muted-foreground mb-3">{currentTableInfo.comment}</p>
              {/if}
            </div>
          </div>

          <!-- Schema-Tabelle (TanStack Table) -->
          <div class="flex-1 overflow-auto px-6">
            <div class="max-w-7xl mx-auto">
              {#if currentTableInfo}
                <Card.Root>
                  <DataTable
                    data={currentTableInfo.schema}
                    columns={schemaColumns}
                    enableSorting={true}
                    globalFilter={schemaFilter}
                  />
                </Card.Root>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </Tabs.Content>

    <!-- ============================================================ -->
    <!-- TAB 2: DATEN-EXPLORER (SQL Warehouse)                        -->
    <!-- ============================================================ -->
    <Tabs.Content value="data" class="flex-1 overflow-hidden m-0 p-0">
      {#if selectedTable}
        <DataExplorer tableName={selectedTable} shortName={currentTableInfo?.shortName ?? ''} />
      {:else}
        <div class="flex-1 flex items-center justify-center h-full">
          <p class="text-muted-foreground">Bitte wähle eine Tabelle aus.</p>
        </div>
      {/if}
    </Tabs.Content>

    <!-- ============================================================ -->
    <!-- TAB 3: INTERACTIVE (Column-level Charts)                      -->
    <!-- ============================================================ -->
    <Tabs.Content value="interactive" class="flex-1 overflow-hidden m-0 p-0">
      {#if selectedTable && currentTableInfo}
        <InteractiveExplorer
          tableName={selectedTable}
          shortName={currentTableInfo.shortName}
          schema={currentTableInfo.schema}
        />
      {:else}
        <div class="flex-1 flex items-center justify-center h-full">
          <p class="text-muted-foreground">Bitte wähle eine Tabelle aus.</p>
        </div>
      {/if}
    </Tabs.Content>

    <!-- ============================================================ -->
    <!-- TAB 4: CHAT (Genie Conversation API)                         -->
    <!-- ============================================================ -->
    <Tabs.Content value="chat" class="flex-1 overflow-hidden m-0 p-0">
      <ChatWindow tableName={selectedTable || undefined} />
    </Tabs.Content>
  </Tabs.Root>
</div>
