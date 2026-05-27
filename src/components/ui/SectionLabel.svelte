<!-- SectionLabel.svelte — Rótulo de seção com ação opcional à direita -->
<script>
  export let text  = '';
  /**
   * Texto clicável à direita (ex: "Ver todas")
   * @type {string|null}
   */
  export let right = null;
</script>

<div class="flex justify-between items-baseline mt-2 mb-2.5">
  <span class="text-[11px] font-bold text-pe-text-sec uppercase tracking-wide">
    {text}
  </span>
  {#if right}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span
      class="text-[13px] font-semibold text-pe-primary cursor-pointer"
      on:click
    >
      {right}
    </span>
  {/if}
</div>
