<script>
  export let open = false;
  export let title = '';
  export let onClose = () => {};
  export let width = '640px';
  export let maxWidth = '';

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4"
    style="background:rgba(0,0,0,0.6); backdrop-filter:blur(4px);"
    on:click={handleBackdrop}
  >
    <div
      class="relative flex flex-col bg-white rounded-16 md:rounded-2xl overflow-hidden max-h-[95vh] md:max-h-[90vh]"
      style="
        width:{width};
        max-width:{maxWidth ? maxWidth : '640px'};
        box-shadow:0 32px 64px rgba(0,0,0,0.3);
      "
    >
      {#if title}
        <div class="flex items-center justify-between px-3 md:px-5 py-3 md:py-4 flex-shrink-0 border-b border-slate-100">
          <h2 class="text-[14px] md:text-[16px] font-black text-slate-900 tracking-tight line-clamp-1">{title}</h2>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors flex-shrink-0"
            on:click={onClose}
          >
            <span class="text-[16px] md:text-[18px] text-slate-400 leading-none">✕</span>
          </div>
        </div>
      {:else}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="absolute top-2 right-2 z-10 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors"
          style="background:rgba(255,255,255,0.9);"
          on:click={onClose}
        >
          <span class="text-[16px] md:text-[18px] text-slate-500 leading-none">×</span>
        </div>
      {/if}

      <div class="flex-1 overflow-y-auto">
        <slot />
      </div>
    </div>
  </div>
{/if}
