<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DataTablePreview from './data-table-preview.svelte';
	import type { ColumnDef } from '@tanstack/svelte-table';

	type Row = Record<string, unknown>;

	const { Story } = defineMeta({
		title: 'Components/DataTable',
		component: DataTablePreview,
		tags: ['autodocs'],
	});

	const schemaColumns: ColumnDef<Row, unknown>[] = [
		{ accessorKey: 'position', header: '#' },
		{ accessorKey: 'name', header: 'Column Name' },
		{ accessorKey: 'type', header: 'Data Type' },
		{
			id: 'nullable',
			accessorFn: (row) => (row.nullable ? 'Yes' : 'No'),
			header: 'Nullable',
		},
		{ accessorKey: 'comment', header: 'Description' },
	];

	const schemaData: Row[] = [
		{ position: 1, name: 'customer_id', type: 'LONG', nullable: false, comment: 'Primary key' },
		{ position: 2, name: 'first_name', type: 'STRING', nullable: false, comment: 'Customer first name' },
		{ position: 3, name: 'last_name', type: 'STRING', nullable: false, comment: 'Customer last name' },
		{ position: 4, name: 'email', type: 'STRING', nullable: true, comment: 'Email address' },
		{ position: 5, name: 'created_at', type: 'TIMESTAMP', nullable: true, comment: 'Account creation date' },
		{ position: 6, name: 'city', type: 'STRING', nullable: true, comment: 'City of residence' },
		{ position: 7, name: 'policy_count', type: 'INT', nullable: true, comment: 'Number of active policies' },
	];

	const simpleColumns: ColumnDef<Row, unknown>[] = [
		{ accessorKey: 'id', header: 'ID' },
		{ accessorKey: 'name', header: 'Name' },
		{ accessorKey: 'value', header: 'Value' },
	];

	const simpleData: Row[] = [
		{ id: 1, name: 'Alpha', value: 100 },
		{ id: 2, name: 'Beta', value: 250 },
		{ id: 3, name: 'Gamma', value: 75 },
	];
</script>

<Story name="Schema Table (Sortable)" args={{ data: schemaData, columns: schemaColumns, enableSorting: true }}>
	{#snippet template(args)}
		<div class="max-w-3xl w-[48rem]">
			<DataTablePreview {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Schema Table (Filtered)" args={{ data: schemaData, columns: schemaColumns, enableSorting: true, globalFilter: 'name' }}>
	{#snippet template(args)}
		<div class="max-w-3xl w-[48rem]">
			<DataTablePreview {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Simple Table" args={{ data: simpleData, columns: simpleColumns }}>
	{#snippet template(args)}
		<div class="w-96">
			<DataTablePreview {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Empty State" args={{ data: [], columns: simpleColumns }}>
	{#snippet template(args)}
		<div class="w-96">
			<DataTablePreview {...args} />
		</div>
	{/snippet}
</Story>
