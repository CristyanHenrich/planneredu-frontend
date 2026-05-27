<script>
  import { Flame } from 'lucide-svelte';
  import { fade, scale } from 'svelte/transition';
  import { onMount, onDestroy } from 'svelte';

  export let count = 0;
  export let show = false;
  export let onClose = () => {};

  let mounted = false;
  let showContent = false;

  $: if (show) {
    mounted = true;
    setTimeout(() => { showContent = true; }, 50);
  }

  function handleClose() {
    showContent = false;
    setTimeout(() => {
      mounted = false;
      onClose();
    }, 300);
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) handleClose();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') handleClose();
  }

  onDestroy(() => {
    mounted = false;
    showContent = false;
  });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if mounted}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    style="background:rgba(0,0,0,0.6); backdrop-filter:blur(4px);"
    class:opacity-0={!showContent}
    class:opacity-100={showContent}
    transition:fade={{ duration: 300 }}
    on:click={handleBackdrop}
  >
    <div
      class="relative flex flex-col items-center text-center"
      class:scale-95={!showContent}
      class:scale-100={showContent}
      transition:scale={{ duration: 400, easing: (t) => 1 - Math.pow(1 - t, 3) }}
    >
      <div
        class="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 rounded-3xl p-10 shadow-2xl border border-orange-300/30"
        style="min-width: 280px;"
      >
        <div class="flex justify-center mb-4">
          <div
            class="w-20 h-20 rounded-full flex items-center justify-center"
            style="background:rgba(255,255,255,0.2);"
          >
            <Flame size={48} color="white" fill="white" />
          </div>
        </div>

        <p class="text-white/70 text-[13px] font-bold uppercase tracking-widest mb-2">Sequência</p>
        <p class="text-white text-[72px] font-black leading-none mb-2">{count}</p>
        <p class="text-white/80 text-[16px] font-bold mb-1">
          {#if count === 1}
            dia consecutivo!
          {:else}
            dias consecutivos!
          {/if}
        </p>
        <p class="text-white/50 text-[13px] font-semibold">Continue assim para manter sua sequência</p>

        <button
          class="mt-6 w-full py-3 rounded-2xl text-[14px] font-bold transition-all bg-white text-orange-600 hover:bg-orange-50 active:scale-95 shadow-lg"
          on:click={handleClose}
        >
          Continuar
        </button>
      </div>
    </div>
  </div>
{/if}
