<script lang="ts">
  import * as Tooltip from "layerchart";

  let {
    hideLabel = false,
    nameKey = "",
    labelFormatter,
  }: {
    hideLabel?: boolean;
    nameKey?: string;
    labelFormatter?: (value: unknown) => string;
  } = $props();
</script>

<Tooltip.Tooltip.Root>
  <Tooltip.Tooltip.Header>
    {#if !hideLabel}
      <span class="font-medium text-foreground text-xs">
        {nameKey || 'Value'}
      </span>
    {/if}
  </Tooltip.Tooltip.Header>
</Tooltip.Tooltip.Root>
