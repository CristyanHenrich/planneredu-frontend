<!-- TopNav.svelte — Barra de navegação superior -->
<script>
  import Icon from './Icon.svelte';

  /** Exibe o botão de voltar */
  export let showBack = true;
  /** Cor do ícone de voltar */
  export let backColor = '#14213D';

  /** Chamado ao clicar em voltar */
  export let onBack = () => {};
</script>

<div class="flex items-center justify-between px-5 pb-4" style="padding-top: 56px; height: auto; box-sizing: content-box;">
  {#if showBack}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="w-10 h-10 rounded-full bg-pe-bg-alt flex items-center justify-center cursor-pointer active:opacity-70"
      on:click={onBack}
    >
      <Icon name="chevL" size={22} color={backColor} />
    </div>
  {:else}
    <div class="w-10" />
  {/if}

  <!-- Slot para conteúdo à direita (ex: botão "Pular") -->
  <div>
    <slot />
  </div>
</div>
