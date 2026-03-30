<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Separator from './separator.svelte';

	const { Story } = defineMeta({
		title: 'UI/Separator',
		component: Separator,
		tags: ['autodocs'],
	});
</script>

<Story name="Horizontal">
	{#snippet template(args)}
		<div class="w-80">
			<div class="space-y-1">
				<h4 class="text-sm font-medium leading-none">Content Above</h4>
				<p class="text-sm text-muted-foreground">Description text above the separator.</p>
			</div>
			<Separator class="my-4" />
			<div class="space-y-1">
				<h4 class="text-sm font-medium leading-none">Content Below</h4>
				<p class="text-sm text-muted-foreground">Description text below the separator.</p>
			</div>
		</div>
	{/snippet}
</Story>

<Story name="Vertical">
	{#snippet template(args)}
		<div class="flex h-5 items-center gap-4 text-sm">
			<span>Blog</span>
			<Separator orientation="vertical" />
			<span>Docs</span>
			<Separator orientation="vertical" />
			<span>Source</span>
		</div>
	{/snippet}
</Story>