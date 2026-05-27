<!-- CalHeader.svelte — Cabeçalho das views de calendário com tabs -->
<script>
  import Icon from './Icon.svelte';
  import TopNav from './TopNav.svelte';

  export let title      = '';
  /** @type {string[]} */
  export let viewTabs   = ['Ano', 'Mês', 'Semana', 'Dia'];
  export let activeView = 'Mês';

  /** Chamado com o nome da view clicada */
  export let onViewChange = (view) => {};
</script>

<div>
  <TopNav>
    <!-- Botão + no canto direito -->
    <div
      class="w-10 h-10 rounded-full bg-pe-bg-alt flex items-center justify-center cursor-pointer active:opacity-70"
    >
      <Icon name="plus" size={20} color="#14213D" />
    </div>
  </TopNav>

  <div class="px-6 pb-4">
    <h1 class="text-[32px] font-extrabold text-pe-text tracking-tighter mb-3.5">
      {title}
    </h1>

    <!-- Segmented control -->
    <div class="flex bg-pe-bg-alt rounded-10 p-1 gap-0.5">
      {#each viewTabs as tab}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="flex-1 py-2 text-center text-[13px] font-semibold tracking-tight rounded-lg cursor-pointer select-none transition-all"
          style="
            background: {tab === activeView ? '#FFFFFF' : 'transparent'};
            color:      {tab === activeView ? '#14213D' : '#6B7280'};
            box-shadow: {tab === activeView ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};
          "
          on:click={() => onViewChange(tab)}
        >
          {tab}
        </div>
      {/each}
    </div>
  </div>
</div>
