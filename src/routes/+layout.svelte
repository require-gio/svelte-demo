<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { page } from '$app/state';
	import { TableProperties } from '@lucide/svelte';
	import ThemeToggle from '$lib/components/theme-toggle.svelte';

	let { children } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 5 * 60 * 1000,
				refetchOnWindowFocus: false
			}
		}
	});

	const navItems = [
		{ href: '/ai_table', label: 'AI Table', icon: TableProperties }
	];

	let currentRoute = $derived(navItems.find((n) => page.url.pathname.startsWith(n.href)));
	let routeTitle = $derived(currentRoute?.label ?? 'Conversational BI');

	// Hide shell on the root redirect page
	let isRedirectPage = $derived(page.url.pathname === '/');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{routeTitle} | Conversational BI</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
	{#if isRedirectPage}
		{@render children()}
	{:else}
		<div class="flex h-screen overflow-hidden bg-background">
			<!-- Sidebar -->
			<aside class="w-56 shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col">
				<!-- Sidebar Header / Brand -->
				<div class="px-4 py-5 shrink-0">
					<span class="text-base font-semibold text-sidebar-foreground tracking-tight">Conversational BI</span>
				</div>

				<!-- Sidebar Navigation -->
				<nav class="flex-1 px-3 py-2">
					{#each navItems as item}
						{@const isActive = page.url.pathname.startsWith(item.href)}
						<a
							href={item.href}
							class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
								{isActive
									? 'bg-sidebar-accent text-sidebar-accent-foreground'
									: 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}"
						>
							<item.icon class="size-4 shrink-0" />
							{item.label}
						</a>
					{/each}
				</nav>
			</aside>

			<!-- Main area -->
			<div class="flex-1 flex flex-col min-w-0">
				<!-- Top navigation bar -->
				<header class="h-14 shrink-0 border-b border-border bg-background flex items-center justify-between px-6">
					<h1 class="text-base font-semibold">{routeTitle}</h1>
					<ThemeToggle />
				</header>

				<!-- Page content -->
				<main class="flex-1 min-h-0 overflow-hidden">
					{@render children()}
				</main>
			</div>
		</div>
	{/if}
</QueryClientProvider>
