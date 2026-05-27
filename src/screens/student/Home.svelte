<script>
  import Icon   from '../../components/ui/Icon.svelte';
  import TabBar from '../../components/ui/TabBar.svelte';
  import { notificationStore, unreadCount } from '../../stores/notifications.js';
  import { onMount, onDestroy } from 'svelte';

  export let onNavigate = (screen) => {};

  let activeTab = 'home';

  const tasks = [
    { subj: 'História', color: '#FF6700', title: 'Redação Brasil colônia', due: 'Amanhã',    urgent: true },
    { subj: 'Biologia', color: '#4CD964', title: 'Exercícios cap. 4',      due: 'Sex, 21 abr' },
    { subj: 'Física',   color: '#FFB42E', title: 'Lista – cinemática',     due: 'Seg, 24 abr' },
  ];

  onMount(() => {
    notificationStore.startPolling();
    
    return () => {
      notificationStore.stopPolling();
    };
  });
</script>

<div class="w-full h-full bg-white flex flex-col overflow-hidden relative">
  <div class="flex items-center gap-3 px-6" style="padding-top:56px; padding-bottom:16px;">
    <div
      class="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base"
      style="background:#004E98;"
    >RO</div>
    <div class="flex-1">
      <p class="text-[13px] text-slate-500 leading-none">Olá,</p>
      <p class="text-[17px] font-bold text-slate-900 tracking-tight leading-tight">Rafaela 👋</p>
    </div>
    
    <!-- Notificações com badge real -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div 
      class="relative cursor-pointer" 
      on:click={() => onNavigate('notifications')}
    >
      <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
        <Icon name="bell" size={20} color="#14213D" />
      </div>
      
      {#if $unreadCount > 0}
        <!-- Badge com contagem real -->
        <div class="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center px-1">
          <span class="text-white text-[9px] font-black leading-none">{($unreadCount > 9) ? '9+' : $unreadCount}</span>
        </div>
      {:else}
        <!-- Indicador sutil quando há notificações mas todas lidas -->
        {#if notificationStore.items.length > 0}
          <div class="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 border-2 border-white" />
        {:else}
          <!-- Sem indicador quando não há notificações -->
        {/if}
      {/if}
    </div>
  </div>

  <div class="flex-1 overflow-auto pb-24 scrollbar-none">
    <!-- Hero: Resumo do dia -->
    <div class="px-5 pb-6 pt-2">
      <div class="rounded-24 p-6 text-white relative overflow-hidden shadow-lg shadow-blue-900/20" style="background: linear-gradient(135deg, #004E98, #003B73);">
        <div class="absolute rounded-full" style="top:-30px; right:-30px; width:150px; height:150px; background:rgba(255,103,0,0.15); filter: blur(30px);" />
        
        <div class="relative flex items-center gap-5">
           <!-- Progresso circular simples -->
           <div class="relative w-16 h-16 flex-shrink-0">
             <svg width="64" height="64" viewBox="0 0 64 64">
               <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.2)" stroke-width="6" fill="none"/>
               <circle cx="32" cy="32" r="28" stroke="#FF6700" stroke-width="6" fill="none"
                 stroke-linecap="round" stroke-dasharray="176" stroke-dashoffset="44"
                 transform="rotate(-90 32 32)"
               />
             </svg>
             <div class="absolute inset-0 flex items-center justify-center">
               <span class="text-[14px] font-black">75%</span>
             </div>
           </div>
           <div>
             <p class="text-[12px] font-semibold uppercase tracking-widest opacity-80 mb-0.5">Hoje · 18 abr</p>
             <p class="text-[20px] font-bold tracking-tight">4 aulas e 2 tarefas</p>
             <p class="text-[12px] opacity-75 mt-0.5 font-medium">Você concluiu 3/4 do planejado</p>
           </div>
        </div>
      </div>
    </div>

    <!-- Próximo evento focado -->
    <div class="px-5 pb-6">
      <div class="flex justify-between items-baseline mb-3">
        <p class="text-[16px] font-black text-slate-900 tracking-tight">Próxima aula</p>
        <span class="text-[13px] font-bold text-blue-600 cursor-pointer" on:click={() => onNavigate('calendar')}>Ver horário</span>
      </div>
      <div 
        class="bg-white rounded-20 p-5 flex gap-4 items-center border border-slate-100 shadow-sm"
        on:click={() => onNavigate('calendar')}
      >
        <div class="w-14 h-14 rounded-16 flex flex-col items-center justify-center bg-blue-50 text-blue-600 font-bold">
          <p class="text-[13px] leading-none mb-0.5">10:30</p>
          <p class="text-[10px] opacity-60">1h</p>
        </div>
        <div class="flex-1">
          <p class="text-[12px] font-black text-blue-500 uppercase tracking-wide mb-0.5">Matemática</p>
          <p class="text-[16px] font-extrabold text-slate-900 tracking-tight leading-tight">Funções quadráticas</p>
          <p class="text-[13px] text-slate-500 mt-1">Sala 204 · Prof. Beatriz</p>
        </div>
      </div>
    </div>

    <!-- Tarefas focadas -->
    <div class="px-5 pb-4">
      <div class="flex justify-between items-baseline mb-3">
        <p class="text-[16px] font-black text-slate-900 tracking-tight">Pendências</p>
        <span class="text-[13px] font-bold text-blue-600 cursor-pointer" on:click={() => onNavigate('kanban')}>Ir para Kanban</span>
      </div>
      <div class="flex flex-col gap-3">
        {#each tasks as task}
          <div 
            class="bg-white rounded-20 p-4 flex items-center gap-4 border border-slate-100 shadow-sm" 
            on:click={() => onNavigate('kanban')}
          >
            <div 
               class="w-5 h-5 rounded-full border-2 border-slate-200 flex-shrink-0"
               style="border-color: {task.urgent ? '#EF4444' : '#E2E8F0'};"
            />
            <div class="flex-1">
              <p class="text-[11px] font-bold uppercase tracking-wide mb-0.5" style="color:{task.color};">{task.subj}</p>
              <p class="text-[15px] font-bold text-slate-900 tracking-tight leading-tight">{task.title}</p>
            </div>
            <div class="text-right">
              <p class="text-[12px] font-bold {task.urgent ? 'text-red-500' : 'text-slate-400'}">{task.due}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>


  <div class="absolute right-5 bottom-24 w-14 h-14 rounded-full flex items-center justify-center z-10 cursor-pointer shadow-lg active:scale-95 transition-all" style="background:#FF6700;">
    <Icon name="plus" size={26} color="#FFFFFF" />
  </div>

  <TabBar {activeTab} onSelect={(id) => {
    activeTab = id;
    if (id === 'calendar') onNavigate('calendar');
    if (id === 'kanban') onNavigate('kanban');
    if (id === 'ai') onNavigate('ai');
  }} />
</div>

<style>
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
