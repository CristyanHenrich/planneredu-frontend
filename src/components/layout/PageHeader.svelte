<!-- PageHeader.svelte — Cabeçalho de página web (título + ações) -->
<script>
  export let title       = '';
  export let subtitle    = '';
  /**
   * Ações opcionais à direita
   * @type {Array<{label:string, variant?:string, onClick?:Function}>}
   */
  export let actions = [];
</script>

<div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 mb-4 md:mb-6">
  <div class="flex-1 min-w-0">
    <h1 class="text-[20px] md:text-[24px] font-extrabold text-pe-text tracking-tight leading-tight truncate">
      {title}
    </h1>
    {#if subtitle}
      <p class="text-[13px] md:text-[14px] text-pe-text-sec mt-0.5 leading-snug">
        {subtitle}
      </p>
    {/if}
  </div>

  {#if actions.length > 0 || $$slots.actions}
    <div class="flex items-center gap-2 flex-shrink-0 overflow-x-auto scrollbar-none">
      <slot name="actions" />
      {#each actions as action}
        <button
          class="px-3 md:px-4 py-1.5 md:py-2 rounded-10 text-[12px] md:text-[13px] font-semibold cursor-pointer transition-opacity active:opacity-70 whitespace-nowrap"
          style="
            background:{action.variant === 'primary' ? '#004E98' : '#F5F6F8'};
            color:{action.variant === 'primary' ? '#FFFFFF' : '#14213D'};
            border:1px solid {action.variant === 'primary' ? '#004E98' : '#E4E4E7'};
          "
          on:click={action.onClick}
        >
          {action.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
