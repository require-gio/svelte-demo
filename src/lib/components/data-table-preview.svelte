<!--
  DataTablePreview – Concrete-typed wrapper around DataTable for Storybook.
  
  The generic `TData` parameter on DataTable causes the Svelte CSF addon
  to silently fail during component analysis. This wrapper uses a concrete
  Record type so Storybook can render it properly.
-->
<script lang="ts">
  import DataTable from './data-table.svelte';
  import type { ColumnDef } from '@tanstack/svelte-table';

  type Row = Record<string, unknown>;

  let {
    data = [],
    columns = [],
    enableSorting = false,
    globalFilter = '',
  }: {
    data: Row[];
    columns: ColumnDef<Row, unknown>[];
    enableSorting?: boolean;
    globalFilter?: string;
  } = $props();
</script>

<DataTable {data} {columns} {enableSorting} {globalFilter} />
