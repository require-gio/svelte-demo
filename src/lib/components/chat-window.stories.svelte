<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ChatWindow from './chat-window.svelte';

	const { Story } = defineMeta({
		title: 'Components/ChatWindow',
		component: ChatWindow,
		tags: ['autodocs'],
		argTypes: {
			title: { control: 'text' },
			welcomeDescription: { control: 'text' },
			endpoint: { control: 'text' },
		},
		parameters: {
			layout: 'fullscreen',
		},
	});
</script>

<Story name="Default" args={{
	title: 'Genie Chat',
	welcomeDescription: 'Stelle Fragen in natürlicher Sprache. Databricks Genie übersetzt sie in SQL und liefert die Ergebnisse direkt.',
	suggestions: ['Wie ist die Verteilung des Familienstands?', 'Was ist das Höchstalter?', 'Welche 5 Kunden haben die höchsten Prämien?'],
}}>
	{#snippet template(args)}
		<div style="height: 600px;">
			<ChatWindow {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Custom Title" args={{
	title: 'Data Assistant',
	welcomeDescription: 'Ask questions about your insurance data in natural language.',
	suggestions: ['How many customers?', 'Show top 5 claims', 'Average policy value?'],
}}>
	{#snippet template(args)}
		<div style="height: 600px;">
			<ChatWindow {...args} />
		</div>
	{/snippet}
</Story>

<Story name="No Suggestions" args={{
	title: 'Minimal Chat',
	welcomeDescription: 'Type your question below to get started.',
	suggestions: [],
}}>
	{#snippet template(args)}
		<div style="height: 600px;">
			<ChatWindow {...args} />
		</div>
	{/snippet}
</Story>
