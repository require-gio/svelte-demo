<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';

	let {
		pageIndex = 0,
		pageCount = 1,
		pageSize = 20,
		totalRows = 0,
		onPageChange,
		onPageSizeChange
	}: {
		pageIndex: number;
		pageCount: number;
		pageSize: number;
		totalRows: number;
		onPageChange: (page: number) => void;
		onPageSizeChange: (size: number) => void;
	} = $props();

	const pageSizeOptions = [10, 20, 50, 100];

	let canPrev = $derived(pageIndex > 0);
	let canNext = $derived(pageIndex < pageCount - 1);
	let startRow = $derived(totalRows === 0 ? 0 : pageIndex * pageSize + 1);
	let endRow = $derived(Math.min((pageIndex + 1) * pageSize, totalRows));
</script>

<div class="flex items-center justify-between px-4 py-3 border-t">
	<div class="flex items-center gap-2 text-sm text-muted-foreground">
		<span>Zeilen pro Seite:</span>
		<Select.Root
			type="single"
			value={String(pageSize)}
			onValueChange={(v) => { if (v) onPageSizeChange(Number(v)); }}
		>
			<Select.Trigger class="h-8 w-18 text-xs">{pageSize}</Select.Trigger>
			<Select.Content>
				{#each pageSizeOptions as size}
					<Select.Item value={String(size)}>{size}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	<div class="flex items-center gap-4">
		<span class="text-sm text-muted-foreground">
			{startRow}–{endRow} von {totalRows.toLocaleString('de-DE')}
		</span>

		<div class="flex items-center gap-1">
			<Button
				variant="outline"
				size="icon-sm"
				disabled={!canPrev}
				onclick={() => onPageChange(0)}
				aria-label="Erste Seite"
			>⟪</Button>
			<Button
				variant="outline"
				size="icon-sm"
				disabled={!canPrev}
				onclick={() => onPageChange(pageIndex - 1)}
				aria-label="Vorherige Seite"
			>‹</Button>

			<span class="text-sm px-2 min-w-16 text-center">
				{pageIndex + 1} / {pageCount}
			</span>

			<Button
				variant="outline"
				size="icon-sm"
				disabled={!canNext}
				onclick={() => onPageChange(pageIndex + 1)}
				aria-label="Nächste Seite"
			>›</Button>
			<Button
				variant="outline"
				size="icon-sm"
				disabled={!canNext}
				onclick={() => onPageChange(pageCount - 1)}
				aria-label="Letzte Seite"
			>⟫</Button>
		</div>
	</div>
</div>
