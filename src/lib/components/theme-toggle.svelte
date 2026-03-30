<script lang="ts">
  import { Sun, Moon } from '@lucide/svelte';
  import { Button } from '$lib/components/ui/button';

  let isDark = $state(false);

  function initTheme() {
    isDark = document.documentElement.classList.contains('dark');
  }

  function toggleTheme() {
    isDark = !isDark;
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  $effect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      isDark = true;
    } else {
      document.documentElement.classList.remove('dark');
      isDark = false;
    }
  });
</script>

<Button variant="ghost" size="icon" onclick={toggleTheme} aria-label="Theme umschalten">
  {#if isDark}
    <Sun class="size-5" />
  {:else}
    <Moon class="size-5" />
  {/if}
</Button>
