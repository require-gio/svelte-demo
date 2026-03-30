<!--
  DataTable – Reusable TanStack Table Wrapper
  
  Nutzt @tanstack/svelte-table v9 für reaktive Tabellendarstellung
  mit optionaler Sortierung und globalem Filter.
-->

<script lang="ts" generics="TData">
  import {
    createTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    FlexRender,
    type ColumnDef,
    type SortingState,
  } from '@tanstack/svelte-table';
  import * as Table from '$lib/components/ui/table';

  let {
    data = [],
    columns,
    enableSorting = false,
    globalFilter = '',
  }: {
    data: TData[];
    columns: ColumnDef<TData, unknown>[];
    enableSorting?: boolean;
    globalFilter?: string;
  } = $props();

  let sorting: SortingState = $state([]);

  const table = createTable({
    get data() { return data; },
    get columns() { return columns; },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    get enableSorting() { return enableSorting; },
    state: {
      get sorting() { return sorting; },
      get globalFilter() { return globalFilter; },
    },
    onSortingChange(updater) {
      if (typeof updater === 'function') {
        sorting = updater(sorting);
      } else {
        sorting = updater;
      }
    },
  });
</script>

<div class="overflow-auto rounded-lg border flex-1 min-h-0">
  <Table.Root>
    <Table.Header class="sticky top-0 z-10 bg-card">
      {#each table.getHeaderGroups() as headerGroup}
        <Table.Row>
          {#each headerGroup.headers as header}
            <Table.Head
              class="whitespace-nowrap font-medium {enableSorting && header.column.getCanSort() ? 'cursor-pointer select-none' : ''}"
              onclick={enableSorting ? header.column.getToggleSortingHandler() : undefined}
            >
              {#if !header.isPlaceholder}
                <span class="inline-flex items-center gap-1">
                  <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
                  {#if enableSorting && header.column.getIsSorted() === 'asc'}
                    <span class="text-xs">↑</span>
                  {:else if enableSorting && header.column.getIsSorted() === 'desc'}
                    <span class="text-xs">↓</span>
                  {/if}
                </span>
              {/if}
            </Table.Head>
          {/each}
        </Table.Row>
      {/each}
    </Table.Header>
    <Table.Body>
      {#each table.getRowModel().rows as row}
        <Table.Row>
          {#each row.getVisibleCells() as cell}
            <Table.Cell class="whitespace-nowrap max-w-80 truncate">
              <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
            </Table.Cell>
          {/each}
        </Table.Row>
      {:else}
        <Table.Row>
          <Table.Cell colspan={columns.length} class="h-24 text-center text-muted-foreground">
            Keine Daten verfügbar.
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
