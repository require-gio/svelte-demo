<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CardRoot from './card.svelte';
	import CardHeader from './card-header.svelte';
	import CardTitle from './card-title.svelte';
	import CardDescription from './card-description.svelte';
	import CardContent from './card-content.svelte';
	import CardFooter from './card-footer.svelte';
	import CardAction from './card-action.svelte';

	const { Story } = defineMeta({
		title: 'UI/Card',
		component: CardRoot,
		tags: ['autodocs'],
	});
</script>

<Story name="Default">
	{#snippet template(args)}
		<CardRoot class="w-80">
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
				<CardDescription>Card description with helpful details.</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Card content goes here. This is the main body of the card component.</p>
			</CardContent>
			<CardFooter>
				<p class="text-sm text-muted-foreground">Card footer</p>
			</CardFooter>
		</CardRoot>
	{/snippet}
</Story>

<Story name="Small">
	{#snippet template(args)}
		<CardRoot class="w-72" size="sm">
			<CardHeader>
				<CardTitle>Small Card</CardTitle>
				<CardDescription>A compact card variant.</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Compact content area.</p>
			</CardContent>
		</CardRoot>
	{/snippet}
</Story>

<Story name="With Action">
	{#snippet template(args)}
		<CardRoot class="w-80">
			<CardHeader>
				<CardTitle>Card with Action</CardTitle>
				<CardDescription>This card has a header action.</CardDescription>
				<CardAction>
				<button class="text-sm text-primary underline">Edit</button>
			</CardAction>
		</CardHeader>
		<CardContent>
			<p>Content with an action button in the header.</p>
		</CardContent>
	</CardRoot>
	{/snippet}
</Story>

<Story name="Content Only">
	{#snippet template(args)}
		<CardRoot class="w-80">
			<CardContent class="p-6">
				<p>A simple card with only content, no header or footer.</p>
			</CardContent>
		</CardRoot>
	{/snippet}
</Story>
