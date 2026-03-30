<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TabsRoot from './tabs.svelte';
	import TabsList from './tabs-list.svelte';
	import TabsTrigger from './tabs-trigger.svelte';
	import TabsContent from './tabs-content.svelte';

	const { Story } = defineMeta({
		title: 'UI/Tabs',
		component: TabsRoot,
		tags: ['autodocs'],
	});
</script>

<Story name="Default">
	{#snippet template(args)}
		<TabsRoot value="tab1" class="w-96">
			<TabsList>
				<TabsTrigger value="tab1">Tab 1</TabsTrigger>
				<TabsTrigger value="tab2">Tab 2</TabsTrigger>
				<TabsTrigger value="tab3">Tab 3</TabsTrigger>
			</TabsList>
			<TabsContent value="tab1">
				<div class="p-4">
					<p>Content for the first tab.</p>
				</div>
			</TabsContent>
			<TabsContent value="tab2">
				<div class="p-4">
					<p>Content for the second tab.</p>
				</div>
			</TabsContent>
			<TabsContent value="tab3">
				<div class="p-4">
					<p>Content for the third tab.</p>
				</div>
			</TabsContent>
		</TabsRoot>
	{/snippet}
</Story>

<Story name="Line Variant">
	{#snippet template(args)}
		<TabsRoot value="tab1" class="w-96">
			<TabsList variant="line">
				<TabsTrigger value="tab1">Overview</TabsTrigger>
				<TabsTrigger value="tab2">Settings</TabsTrigger>
				<TabsTrigger value="tab3">Analytics</TabsTrigger>
			</TabsList>
			<TabsContent value="tab1">
				<div class="p-4">
					<p>Overview content with the line variant tabs.</p>
				</div>
			</TabsContent>
			<TabsContent value="tab2">
				<div class="p-4">
					<p>Settings panel.</p>
				</div>
			</TabsContent>
			<TabsContent value="tab3">
				<div class="p-4">
					<p>Analytics dashboard.</p>
				</div>
			</TabsContent>
		</TabsRoot>
	{/snippet}
</Story>

<Story name="Two Tabs">
	{#snippet template(args)}
		<TabsRoot value="explorer" class="w-96">
			<TabsList>
				<TabsTrigger value="explorer">Schema-Explorer</TabsTrigger>
				<TabsTrigger value="chat">Chat</TabsTrigger>
			</TabsList>
			<TabsContent value="explorer">
				<div class="p-4">
					<p>Schema explorer content here.</p>
				</div>
			</TabsContent>
			<TabsContent value="chat">
				<div class="p-4">
					<p>Chat content here.</p>
				</div>
			</TabsContent>
		</TabsRoot>
	{/snippet}
</Story>
