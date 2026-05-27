<!-- Calendar.svelte — Calendário unificado com tabs internas -->
<script>
  import CalendarYear  from './CalendarYear.svelte';
  import CalendarMonth from './CalendarMonth.svelte';
  import CalendarWeek  from './CalendarWeek.svelte';
  import CalendarDay   from './CalendarDay.svelte';

  export let onNavigate = (screen) => {};

  const views = ['Ano', 'Mês', 'Semana', 'Dia'];
  let activeView = 'Mês';

  function handleViewChange(view) {
    activeView = view;
  }
</script>

<div class="w-full h-full bg-white flex flex-col">
  {#if activeView === 'Ano'}
    <CalendarYear  {onNavigate} onViewChange={handleViewChange} />
  {:else if activeView === 'Mês'}
    <CalendarMonth onViewChange={handleViewChange} />
  {:else if activeView === 'Semana'}
    <CalendarWeek  onViewChange={handleViewChange} />
  {:else}
    <CalendarDay   onViewChange={handleViewChange} />
  {/if}
</div>
