<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from './button.svelte';

	const { Story } = defineMeta({
		title: 'UI/Button',
		component: Button,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: 'select',
				options: ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'],
			},
			size: {
				control: 'select',
				options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
			},
			disabled: { control: 'boolean' },
		},
	});
</script>

<Story name="Default" args={{ variant: 'default', size: 'default', disabled: false }}>
	{#snippet template(args)}
		<Button {...args}>Button</Button>
	{/snippet}
</Story>

<Story name="Outline" args={{ variant: 'outline' }}>
	{#snippet template(args)}
		<Button {...args}>Button</Button>
	{/snippet}
</Story>

<Story name="Secondary" args={{ variant: 'secondary' }}>
	{#snippet template(args)}
		<Button {...args}>Secondary</Button>
	{/snippet}
</Story>

<Story name="Ghost" args={{ variant: 'ghost' }}>
	{#snippet template(args)}
		<Button {...args}>Ghost</Button>
	{/snippet}
</Story>

<Story name="Destructive" args={{ variant: 'destructive' }}>
	{#snippet template(args)}
		<Button {...args}>Destructive</Button>
	{/snippet}
</Story>

<Story name="Link" args={{ variant: 'link' }}>
	{#snippet template(args)}
		<Button {...args}>Link Button</Button>
	{/snippet}
</Story>

<Story name="Small" args={{ variant: 'default', size: 'sm' }}>
	{#snippet template(args)}
		<Button {...args}>Small</Button>
	{/snippet}
</Story>

<Story name="Large" args={{ variant: 'default', size: 'lg' }}>
	{#snippet template(args)}
		<Button {...args}>Large</Button>
	{/snippet}
</Story>

<Story name="Disabled" args={{ variant: 'default', disabled: true }}>
	{#snippet template(args)}
		<Button {...args}>Disabled</Button>
	{/snippet}
</Story>

<Story name="As Link" args={{ variant: 'default', href: 'https://example.com' }}>
	{#snippet template(args)}
		<Button {...args}>Link (anchor)</Button>
	{/snippet}
</Story>

<Story name="All Variants" asChild>
	<div class="flex flex-wrap items-center gap-3">
		<Button variant="default">Default</Button>
		<Button variant="outline">Outline</Button>
		<Button variant="secondary">Secondary</Button>
		<Button variant="ghost">Ghost</Button>
		<Button variant="destructive">Destructive</Button>
		<Button variant="link">Link</Button>
	</div>
</Story>

<Story name="All Sizes" asChild>
	<div class="flex flex-wrap items-center gap-3">
		<Button size="xs">Extra Small</Button>
		<Button size="sm">Small</Button>
		<Button size="default">Default</Button>
		<Button size="lg">Large</Button>
	</div>
</Story>
