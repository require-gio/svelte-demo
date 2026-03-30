<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Input from './input.svelte';

	const { Story } = defineMeta({
		title: 'UI/Input',
		component: Input,
		tags: ['autodocs'],
		argTypes: {
			type: {
				control: 'select',
				options: ['text', 'password', 'email', 'number', 'search', 'tel', 'url'],
			},
			placeholder: { control: 'text' },
			disabled: { control: 'boolean' },
		},
	});
</script>

<Story name="Default" args={{ type: 'text', placeholder: 'Type something...' }}>
	{#snippet template(args)}
		<div class="w-80">
			<Input {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Search" args={{ type: 'search', placeholder: 'Search...' }}>
	{#snippet template(args)}
		<div class="w-80">
			<Input {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Password" args={{ type: 'password', placeholder: 'Enter password...' }}>
	{#snippet template(args)}
		<div class="w-80">
			<Input {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Email" args={{ type: 'email', placeholder: 'name@example.com' }}>
	{#snippet template(args)}
		<div class="w-80">
			<Input {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Disabled" args={{ type: 'text', placeholder: 'Disabled input', disabled: true }}>
	{#snippet template(args)}
		<div class="w-80">
			<Input {...args} />
		</div>
	{/snippet}
</Story>

<Story name="With Value" args={{ type: 'text', value: 'Pre-filled value' }}>
	{#snippet template(args)}
		<div class="w-80">
			<Input {...args} />
		</div>
	{/snippet}
</Story>
