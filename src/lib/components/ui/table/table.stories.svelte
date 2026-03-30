<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TableRoot from './table.svelte';
	import TableHeader from './table-header.svelte';
	import TableBody from './table-body.svelte';
	import TableRow from './table-row.svelte';
	import TableHead from './table-head.svelte';
	import TableCell from './table-cell.svelte';
	import TableCaption from './table-caption.svelte';
	import TableFooter from './table-footer.svelte';

	const { Story } = defineMeta({
		title: 'UI/Table',
		component: TableRoot,
		tags: ['autodocs'],
	});
</script>

<Story name="Default">
	{#snippet template(args)}
		<div class="w-full max-w-xl">
			<TableRoot>
				<TableHeader>
					<TableRow>
						<TableHead>#</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Type</TableHead>
						<TableHead>Nullable</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell>1</TableCell>
						<TableCell>customer_id</TableCell>
						<TableCell>LONG</TableCell>
						<TableCell>No</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>2</TableCell>
						<TableCell>name</TableCell>
						<TableCell>STRING</TableCell>
						<TableCell>Yes</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>3</TableCell>
						<TableCell>email</TableCell>
						<TableCell>STRING</TableCell>
						<TableCell>Yes</TableCell>
					</TableRow>
				</TableBody>
			</TableRoot>
		</div>
	{/snippet}
</Story>

<Story name="With Caption">
	{#snippet template(args)}
		<div class="w-full max-w-xl">
			<TableRoot>
				<TableCaption>A list of recent invoices</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead>Invoice</TableHead>
						<TableHead>Status</TableHead>
						<TableHead class="text-right">Amount</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell class="font-medium">INV001</TableCell>
						<TableCell>Paid</TableCell>
						<TableCell class="text-right">$250.00</TableCell>
					</TableRow>
					<TableRow>
						<TableCell class="font-medium">INV002</TableCell>
						<TableCell>Pending</TableCell>
						<TableCell class="text-right">$150.00</TableCell>
					</TableRow>
				</TableBody>
				<TableFooter>
					<TableRow>
						<TableCell colspan={2}>Total</TableCell>
						<TableCell class="text-right">$400.00</TableCell>
					</TableRow>
				</TableFooter>
			</TableRoot>
		</div>
	{/snippet}
</Story>

<Story name="Empty">
	{#snippet template(args)}
		<div class="w-full max-w-xl">
			<TableRoot>
				<TableHeader>
					<TableRow>
						<TableHead>Column A</TableHead>
						<TableHead>Column B</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<TableRow>
						<TableCell colspan={2} class="h-24 text-center text-muted-foreground">
							No data available.
						</TableCell>
					</TableRow>
				</TableBody>
			</TableRoot>
		</div>
	{/snippet}
</Story>
