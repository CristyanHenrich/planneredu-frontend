<!-- TabBar.svelte — Barra de abas inferior (home, agenda, etc.) -->
<script>
  import Icon from './Icon.svelte';

  /**
   * Lista de abas. Cada item: { id, label, icon }
   * @type {Array<{id: string, label: string, icon: string}>}
   */
  export let tabs = [
    { id: 'home',     label: 'Início',  icon: 'home' },
    { id: 'calendar', label: 'Agenda',  icon: 'calendar' },
    { id: 'tasks',    label: 'Tarefas', icon: 'book' },
    { id: 'grades',   label: 'Notas',   icon: 'chart' },
    { id: 'profile',  label: 'Perfil',  icon: 'user' },
  ];

  /** ID da aba ativa */
  export let active = 'home';

  /** Chamado com o id da aba clicada */
  export let onSelect = (id) => {};
</script>

<div
  class="absolute left-0 right-0 bottom-0 bg-white flex justify-around"
  style="border-top: 1px solid #E4E4E7; padding: 10px 20px 28px;"
>
  {#each tabs as tab}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="flex flex-col items-center gap-1 cursor-pointer transition-opacity active:opacity-60"
      style="color: {tab.id === active ? '#004E98' : '#6B7280'};"
      on:click={() => onSelect(tab.id)}
    >
      <Icon name={tab.icon} size={22} color={tab.id === active ? '#004E98' : '#6B7280'} />
      <span class="text-[10px] font-semibold tracking-tight">{tab.label}</span>
    </div>
  {/each}
</div>
