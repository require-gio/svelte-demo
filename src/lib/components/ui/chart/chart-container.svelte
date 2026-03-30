<script lang="ts">
  import { cn } from "$lib/utils.js";
  import type { ChartConfig } from "./index.js";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    config,
    children,
    class: className,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig;
    children: Snippet;
  } = $props();

  // Generate CSS custom properties from chart config
  let style = $derived(
    Object.entries(config)
      .filter(([_, v]) => v.color)
      .map(([key, value]) => `--color-${key}: ${value.color}`)
      .join("; ")
  );
</script>

<div
  data-slot="chart"
  class={cn("flex aspect-auto justify-center text-xs [&_.layerchart-tooltip-content]:rounded-lg [&_.layerchart-tooltip-content]:border [&_.layerchart-tooltip-content]:bg-background [&_.layerchart-tooltip-content]:p-2 [&_.layerchart-tooltip-content]:shadow-xl", className)}
  {style}
  {...restProps}
>
  {@render children()}
</div>
