<!--
  ChatWindow – Reusable Genie Chat Component
  
  Renders a full chat interface with:
  - Welcome screen with suggestion chips
  - Message history (user + assistant)
  - Table results via DataTable
  - SQL toggle per response
  - Loading animation
  - Input field with Enter-to-send
-->

<script lang="ts" module>
  /**
   * Einfache Markdown-artige Formatierung für Textantworten.
   * Wandelt **bold** in <strong> um.
   */
  export function formatContent(content: string): string {
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }
</script>

<script lang="ts">
  import type { ColumnDef } from '@tanstack/svelte-table';
  import type { ChatMessage, ChatResponse } from '$lib/types';
  import DataTable from '$lib/components/data-table.svelte';
  import * as Card from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Separator } from '$lib/components/ui/separator';

  interface ChatWindowProps {
    /** The API endpoint to POST chat messages to. */
    endpoint?: string;
    /** Example suggestions shown on the welcome screen. */
    suggestions?: string[];
    /** Title shown in the chat header. */
    title?: string;
    /** Subtitle / description on the welcome screen. */
    welcomeDescription?: string;
    /** Additional CSS classes for the root container. */
    class?: string;
  }

  let {
    endpoint = '/api/chat',
    suggestions = ['Wie viele Einträge gibt es?', 'Zeige die ersten 10 Zeilen', 'Welche Spalten gibt es?'],
    title = 'Genie Chat',
    welcomeDescription = 'Stelle Fragen in natürlicher Sprache. Databricks Genie übersetzt sie in SQL und liefert die Ergebnisse direkt.',
    class: className = '',
  }: ChatWindowProps = $props();

  // ============================================================
  // CHAT STATE
  // ============================================================
  let messages: ChatMessage[] = $state([]);
  let chatInput: string = $state('');
  let isLoadingChat: boolean = $state(false);
  let chatContainer: HTMLDivElement | undefined = $state();
  let expandedSql: Set<number> = $state(new Set());
  let conversationId: string | undefined = $state();

  // ============================================================
  // CHAT: Send message
  // ============================================================
  async function sendMessage() {
    const question = chatInput.trim();
    if (!question || isLoadingChat) return;

    messages = [...messages, { role: 'user', type: 'text', content: question }];
    chatInput = '';
    isLoadingChat = true;
    scrollToBottom();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, conversationId })
      });

      const data: ChatResponse = await response.json();

      if (data.conversationId) {
        conversationId = data.conversationId;
      }

      messages = [
        ...messages,
        {
          role: 'assistant',
          type: data.type,
          content: data.content,
          columns: data.columns,
          rows: data.rows,
          sql: data.sql
        }
      ];
    } catch {
      messages = [
        ...messages,
        {
          role: 'assistant',
          type: 'error',
          content: 'Verbindungsfehler. Bitte versuche es erneut.'
        }
      ];
    } finally {
      isLoadingChat = false;
      scrollToBottom();
    }
  }

  function startNewConversation() {
    messages = [];
    conversationId = undefined;
    expandedSql = new Set();
    chatInput = '';
  }

  function handleChatKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });
  }

  function toggleSql(index: number) {
    const next = new Set(expandedSql);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    expandedSql = next;
  }

  function handleSuggestion(suggestion: string) {
    chatInput = suggestion;
    sendMessage();
  }

  function createChatTableColumns(columnNames: string[]): ColumnDef<Record<string, unknown>, unknown>[] {
    return columnNames.map((name) => ({
      accessorKey: name,
      header: name
    }));
  }
</script>

<!-- ============================================================ -->
<!-- CHAT WINDOW                                                    -->
<!-- ============================================================ -->
<div class="h-full flex flex-col {className}">
  <!-- Chat-Header -->
  <div class="px-6 py-3 border-b bg-background shrink-0">
    <div class="max-w-4xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">{title}</span>
        {#if conversationId}
          <Badge variant="secondary" class="text-xs">Konversation aktiv</Badge>
        {:else}
          <Badge variant="outline" class="text-xs">Neue Konversation</Badge>
        {/if}
      </div>
      {#if messages.length > 0}
        <Button
          variant="outline"
          size="sm"
          onclick={startNewConversation}
        >
          Neue Konversation
        </Button>
      {/if}
    </div>
  </div>

  <!-- Chat-Nachrichten -->
  <div
    bind:this={chatContainer}
    class="flex-1 overflow-y-auto px-6 py-6"
  >
    <div class="max-w-4xl mx-auto space-y-4">
      <!-- Willkommen -->
      {#if messages.length === 0}
        <div class="flex flex-col items-center justify-center py-16">
          <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h2 class="text-lg font-semibold tracking-tight">Frag deine Daten</h2>
          <p class="text-muted-foreground mt-2 max-w-md text-center text-sm leading-relaxed">
            {welcomeDescription}
          </p>
          <Separator class="my-6 max-w-xs" />
          <p class="text-xs text-muted-foreground mb-3">Beispiel-Fragen:</p>
          <div class="flex flex-wrap justify-center gap-2">
            {#each suggestions as suggestion}
              <button
                type="button"
                class="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors cursor-pointer"
                onclick={() => handleSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Nachrichten -->
      {#each messages as message, index}
        <div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
          {#if message.role === 'user'}
            <!-- User-Nachricht -->
            <div class="max-w-[85%] rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-3">
              <p class="text-sm">{message.content}</p>
            </div>
          {:else if message.type === 'error'}
            <!-- Fehler -->
            <Card.Root class="max-w-[85%] border-destructive/30 bg-destructive/5">
              <Card.Content class="p-4">
                <div class="flex items-start gap-3">
                  <div class="shrink-0 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-destructive"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  </div>
                  <p class="text-sm text-destructive">{message.content}</p>
                </div>
              </Card.Content>
            </Card.Root>
          {:else if message.type === 'text'}
            <!-- Text-Antwort -->
            <Card.Root class="max-w-[85%]">
              <Card.Content class="p-4">
                <div class="flex items-start gap-3">
                  <div class="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm whitespace-pre-wrap">{@html formatContent(message.content)}</p>
                    {#if message.sql}
                      <button
                        type="button"
                        class="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1"
                        onclick={() => toggleSql(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="{expandedSql.has(index) ? '6 9 12 15 18 9' : '9 18 15 12 9 6'}"/></svg>
                        {expandedSql.has(index) ? 'SQL ausblenden' : 'SQL anzeigen'}
                      </button>
                      {#if expandedSql.has(index)}
                        <pre class="mt-2 p-3 bg-zinc-950 text-green-400 text-xs rounded-lg overflow-x-auto font-mono leading-relaxed">{message.sql}</pre>
                      {/if}
                    {/if}
                  </div>
                </div>
              </Card.Content>
            </Card.Root>
          {:else if message.type === 'table' && message.columns && message.rows}
            <!-- Tabellen-Antwort (TanStack Table) -->
            <Card.Root class="max-w-[95%]">
              <Card.Content class="p-4">
                <div class="flex items-start gap-3">
                  <div class="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-muted-foreground mb-3">{message.content}</p>
                    <DataTable
                      data={message.rows}
                      columns={createChatTableColumns(message.columns)}
                    />
                    {#if message.sql}
                      <button
                        type="button"
                        class="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1"
                        onclick={() => toggleSql(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="{expandedSql.has(index) ? '6 9 12 15 18 9' : '9 18 15 12 9 6'}"/></svg>
                        {expandedSql.has(index) ? 'SQL ausblenden' : 'SQL anzeigen'}
                      </button>
                      {#if expandedSql.has(index)}
                        <pre class="mt-2 p-3 bg-zinc-950 text-green-400 text-xs rounded-lg overflow-x-auto font-mono leading-relaxed">{message.sql}</pre>
                      {/if}
                    {/if}
                  </div>
                </div>
              </Card.Content>
            </Card.Root>
          {/if}
        </div>
      {/each}

      <!-- Loading -->
      {#if isLoadingChat}
        <div class="flex justify-start">
          <Card.Root class="max-w-[85%]">
            <Card.Content class="p-4">
              <div class="flex items-center gap-3">
                <div class="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-sm text-muted-foreground">Genie denkt nach</span>
                  <div class="flex gap-1 ml-1">
                    <div class="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card.Root>
        </div>
      {/if}
    </div>
  </div>

  <!-- Eingabefeld -->
  <div class="border-t bg-background px-6 py-4 shrink-0">
    <div class="max-w-4xl mx-auto">
      <form
        class="flex gap-3"
        onsubmit={(e) => { e.preventDefault(); sendMessage(); }}
      >
        <Input
          type="text"
          bind:value={chatInput}
          onkeydown={handleChatKeydown}
          placeholder="Stelle eine Frage an Genie..."
          disabled={isLoadingChat}
          class="flex-1"
        />
        <Button
          type="submit"
          disabled={isLoadingChat || !chatInput.trim()}
        >
          Senden
        </Button>
      </form>
      <p class="text-xs text-muted-foreground mt-2 text-center">
        Powered by Databricks AI/BI Genie. Ergebnisse sollten verifiziert werden.
      </p>
    </div>
  </div>
</div>
