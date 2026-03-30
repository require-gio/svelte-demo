<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SelectRoot from './select.svelte';
	import SelectTrigger from './select-trigger.svelte';
	import SelectContent from './select-content.svelte';
	import SelectItem from './select-item.svelte';
	import SelectGroup from './select-group.svelte';
	import SelectGroupHeading from './select-group-heading.svelte';
	import SelectSeparator from './select-separator.svelte';

	const { Story } = defineMeta({
		title: 'UI/Select',
		component: SelectRoot,
		tags: ['autodocs'],
	});
</script>

<Story name="Default">
{#snippet template(args)}
	<div class="w-64">
		<SelectRoot type="single">
			<SelectTrigger>
				Select an option...
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="option1">Option 1</SelectItem>
				<SelectItem value="option2">Option 2</SelectItem>
				<SelectItem value="option3">Option 3</SelectItem>
			</SelectContent>
		</SelectRoot>
	</div>
{/snippet}
</Story>

<Story name="With Groups">
	{#snippet template(args)}
		<div class="w-64">
			<SelectRoot type="single">
				<SelectTrigger>
					Choose a table...
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectGroupHeading>Insurance</SelectGroupHeading>
						<SelectItem value="claims">Claims</SelectItem>
						<SelectItem value="policies">Policies</SelectItem>
					</SelectGroup>
					<SelectSeparator />
					<SelectGroup>
						<SelectGroupHeading>Customers</SelectGroupHeading>
						<SelectItem value="customers">Customers</SelectItem>
						<SelectItem value="contacts">Contacts</SelectItem>
					</SelectGroup>
				</SelectContent>
			</SelectRoot>
		</div>
	{/snippet}
</Story>

<Story name="Small">
	{#snippet template(args)}
		<div class="w-48">
			<SelectRoot type="single">
				<SelectTrigger size="sm">
					Small trigger
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="a">Option A</SelectItem>
					<SelectItem value="b">Option B</SelectItem>
				</SelectContent>
			</SelectRoot>
		</div>
	{/snippet}
</Story>