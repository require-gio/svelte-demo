<!--
  DataExplorer – Server-seitig paginierte, sortierbare Datentabelle
  
  Nutzt TanStack Table für State-Management (Sortierung, Pagination)
  und TanStack Query für serverseitige Datenabfragen via SQL Warehouse.
-->

<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import {
		createTable,
		getCoreRowModel,
		type ColumnDef,
		type SortingState,
		type PaginationState,
		FlexRender
	} from '@tanstack/svelte-table';
	import type { SqlQueryResult } from '$lib/server/databricks';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import Pagination from '$lib/components/pagination.svelte';

	let {
		tableName,
		shortName = ''
	}: {
		tableName: string;
		shortName?: string;
	} = $props();

	// ============================================================
	// STATE
	// ============================================================
	let sorting: SortingState = $state([]);
	let pagination: PaginationState = $state({ pageIndex: 0, pageSize: 20 });
	let filterInput: string = $state('');
	let filterValue: string = $state('');

	// Debounce filter input
	let filterTimeout: ReturnType<typeof setTimeout> | undefined;
	function onFilterInput(value: string) {
		filterInput = value;
		clearTimeout(filterTimeout);
		filterTimeout = setTimeout(() => {
			filterValue = value;
			pagination = { ...pagination, pageIndex: 0 };
		}, 400);
	}

	// ============================================================
	// QUERY – Server-seitige Daten via /api/data/[table]
	// ============================================================
	const dataQuery = createQuery<SqlQueryResult>(() => ({
		queryKey: [
			'table-data',
			tableName,
			pagination.pageIndex,
			pagination.pageSize,
			sorting[0]?.id,
			sorting[0]?.desc,
			filterValue
		],
		queryFn: async () => {
			const params = new URLSearchParams({
				limit: String(pagination.pageSize),
				offset: String(pagination.pageIndex * pagination.pageSize)
			});
			if (sorting.length > 0) {
				params.set('sort', sorting[0].id);
				params.set('dir', sorting[0].desc ? 'desc' : 'asc');
			}
			if (filterValue) {
				params.set('filter', filterValue);
			}
			const res = await fetch(`/api/data/${encodeURIComponent(tableName)}?${params}`);
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.error ?? 'Daten konnten nicht geladen werden.');
			}
			return res.json();
		},
		placeholderData: (prev) => prev
	}));

	// ============================================================
	// TANSTACK TABLE
	// ============================================================
	let columns: ColumnDef<Record<string, unknown>, unknown>[] = $derived(
		(dataQuery.data?.columns ?? []).map((col) => ({
			accessorKey: col,
			header: col,
			enableSorting: true
		}))
	);

	let pageCount = $derived(
		Math.max(1, Math.ceil((dataQuery.data?.totalRows ?? 0) / pagination.pageSize))
	);

	const table = createTable({
		get data() { return dataQuery.data?.rows ?? []; },
		get columns() { return columns; },
		get pageCount() { return pageCount; },
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		manualSorting: true,
		manualFiltering: true,
		state: {
			get sorting() { return sorting; },
			get pagination() { return pagination; }
		},
		onSortingChange(updater) {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
			// Reset to first page on sort change
			pagination = { ...pagination, pageIndex: 0 };
		},
		onPaginationChange(updater) {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		}
	});
</script>

<div class="h-full flex flex-col">
	<!-- Header: Filter + Info -->
	<div class="px-6 py-4 shrink-0">
		<div class="max-w-7xl mx-auto">
			<div class="flex items-center justify-between gap-4 mb-2">
				<div class="flex items-center gap-3">
					<h2 class="text-lg font-medium">{shortName || tableName}</h2>
					{#if dataQuery.data}
						<Badge variant="secondary">
							{dataQuery.data.totalRows.toLocaleString('de-DE')} Zeilen
						</Badge>
					{/if}
					{#if dataQuery.isFetching}
						<Badge variant="outline" class="animate-pulse">Laden…</Badge>
					{/if}
				</div>
				<Input
					type="search"
					placeholder="Daten durchsuchen…"
					class="max-w-xs"
					value={filterInput}
					oninput={(e) => onFilterInput(e.currentTarget.value)}
				/>
			</div>
		</div>
	</div>

	<!-- Table -->
	<div class="flex-1 overflow-hidden px-6 pb-0">
		<div class="max-w-7xl mx-auto h-full flex flex-col">
			{#if dataQuery.isLoading}
				<div class="flex items-center justify-center h-48">
					<p class="text-muted-foreground">Daten werden geladen…</p>
				</div>
			{:else if dataQuery.isError}
				<div class="flex items-center justify-center h-48">
					<p class="text-destructive">{dataQuery.error?.message ?? 'Fehler beim Laden'}</p>
				</div>
			{:else}
				<Card.Root class="flex-1 flex flex-col min-h-0 overflow-hidden">
					<div class="flex-1 overflow-auto min-h-0">
						<Table.Root>
							<Table.Header class="sticky top-0 z-10 bg-card">
								{#each table.getHeaderGroups() as headerGroup}
									<Table.Row>
										{#each headerGroup.headers as header}
											<Table.Head
												class="whitespace-nowrap font-medium cursor-pointer select-none"
												onclick={header.column.getToggleSortingHandler()}
											>
												{#if !header.isPlaceholder}
													<span class="inline-flex items-center gap-1">
														<FlexRender
															content={header.column.columnDef.header}
															context={header.getContext()}
														/>
														{#if header.column.getIsSorted() === 'asc'}
															<span class="text-xs">↑</span>
														{:else if header.column.getIsSorted() === 'desc'}
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
												<FlexRender
													content={cell.column.columnDef.cell}
													context={cell.getContext()}
												/>
											</Table.Cell>
										{/each}
									</Table.Row>
								{:else}
									<Table.Row>
										<Table.Cell
											colspan={columns.length || 1}
											class="h-24 text-center text-muted-foreground"
										>
											Keine Daten gefunden.
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>

					<!-- Pagination -->
					<Pagination
						pageIndex={pagination.pageIndex}
						{pageCount}
						pageSize={pagination.pageSize}
						totalRows={dataQuery.data?.totalRows ?? 0}
						onPageChange={(p) => { pagination = { ...pagination, pageIndex: p }; }}
						onPageSizeChange={(s) => { pagination = { pageIndex: 0, pageSize: s }; }}
					/>
				</Card.Root>
			{/if}
		</div>
	</div>
</div>
