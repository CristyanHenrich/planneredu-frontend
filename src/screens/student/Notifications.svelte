<!-- Notifications.svelte — Central de notificações com filtro por matéria -->
<script>
  import TopNav from '../../components/ui/TopNav.svelte';

  export let onNavigate = (screen) => {};

  const subjColors = {
    'História': '#FF6700',
    'Física':   '#FF2D5F',
    'Biologia': '#4CD964',
    'Matemática': '#004E98',
    'Química':  '#5856D6',
    'Português':'#FFB42E',
  };

  const groups = [
    { label:'Hoje', items:[
      { ic:'🏆', title:'Nova conquista desbloqueada!', desc:'"Velocidade" — 5 tarefas em um dia',      time:'agora', color:'#FFB42E', unread:true },
      { ic:'📝', title:'Redação de História',          desc:'Entrega amanhã às 14:00',                 time:'2h',   color:'#FF6700', unread:true, subj:'História' },
      { ic:'✦',  title:'Edu IA sugere',                desc:'Revisar MRUV antes da prova de Física',   time:'4h',   color:'#004E98', unread:true, subj:'Física'   },
    ]},
    { label:'Ontem', items:[
      { ic:'🔥', title:'7 dias de foco seguidos',      desc:'+150 XP · continue assim!',               time:'1d',   color:'#FF6700' },
      { ic:'📚', title:'Nova aula disponível',          desc:'Biologia · Meiose (32min)',                time:'1d',   color:'#4CD964', subj:'Biologia' },
    ]},
    { label:'Esta semana', items:[
      { ic:'⚡', title:'Modo Recuperação ativado',     desc:'Redistribuímos 2.5h de estudo',            time:'3d',   color:'#004E98' },
      { ic:'👥', title:'Lucas passou você no ranking', desc:'Agora em 2º lugar',                        time:'4d',   color:'#6B7280' },
    ]},
  ];

  const unreadCount = groups.flatMap(g => g.items).filter(i => i.unread).length;

  // Monta lista de matérias que aparecem nas notificações
  const subjs = [...new Set(groups.flatMap(g => g.items).filter(i => i.subj).map(i => i.subj))];
  const filterSubjects = [
    { name:'Todas', color:'#14213D' },
    ...subjs.map(s => ({ name:s, color: subjColors[s] || '#6B7280' }))
  ];

  let selectedSubject = 'Todas';

  $: filteredGroups = groups
    .map(g => ({
      ...g,
      items: g.items.filter(n => selectedSubject === 'Todas' || n.subj === selectedSubject),
    }))
    .filter(g => g.items.length > 0);
</script>

<div class="w-full h-full bg-white flex flex-col">
  <TopNav>
    <span class="text-[14px] font-semibold text-pe-primary cursor-pointer">Marcar lidas</span>
  </TopNav>

  <div class="px-6 pb-3 flex items-center gap-2.5">
    <h1 class="text-[30px] font-extrabold text-pe-text tracking-tighter">Notificações</h1>
    {#if unreadCount > 0}
      <div
        class="text-white text-[12px] font-extrabold px-2 py-0.5 rounded-full"
        style="background:#FF2D5F;"
      >{unreadCount}</div>
    {/if}
  </div>

  <!-- Filtro por matéria -->
  <div class="flex gap-2 overflow-x-auto scrollbar-none px-5 pb-3">
    {#each filterSubjects as s}
      <button
        class="flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-bold border transition-all"
        style="
          background: {selectedSubject === s.name ? s.color : '#FFFFFF'};
          border-color: {selectedSubject === s.name ? s.color : '#E4E4E7'};
          color: {selectedSubject === s.name ? '#FFFFFF' : '#6B7280'};
        "
        on:click={() => selectedSubject = s.name}
      >{s.name}</button>
    {/each}
  </div>

  <div class="flex-1 overflow-auto px-5 pb-5 scrollbar-none">
    {#if filteredGroups.length === 0}
      <p class="text-[13px] text-pe-text-sec text-center pt-8">Nenhuma notificação nesta matéria</p>
    {:else}
      {#each filteredGroups as group}
        <p class="text-[11px] font-bold text-pe-text-sec uppercase tracking-wide pt-3.5 pb-2 px-1">
          {group.label}
        </p>

        {#each group.items as n}
          <div
            class="rounded-12 p-3 mb-1.5 flex gap-3 items-start relative"
            style="
              background:{n.unread ? '#FFFFFF' : 'transparent'};
              border:1px solid {n.unread ? '#E4E4E7' : 'transparent'};
            "
          >
            <div
              class="w-10 h-10 rounded-10 flex items-center justify-center text-[18px] flex-shrink-0"
              style="background:{n.color}18;"
            >{n.ic}</div>
            <div class="flex-1">
              <div class="flex items-center gap-1.5 mb-0.5">
                <p class="text-[13px] font-bold text-pe-text tracking-tight leading-snug">{n.title}</p>
                {#if n.subj}
                  <span
                    class="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style="background:{subjColors[n.subj]}18; color:{subjColors[n.subj]};"
                  >{n.subj}</span>
                {/if}
              </div>
              <p class="text-[12px] text-pe-text-sec leading-snug">{n.desc}</p>
            </div>
            <p class="text-[11px] text-pe-text-sec font-semibold flex-shrink-0">{n.time}</p>
            {#if n.unread}
              <div
                class="absolute top-3.5 -right-1 w-2 h-2 rounded-full"
                style="background:#004E98;"
              />
            {/if}
          </div>
        {/each}
      {/each}
    {/if}
  </div>
</div>
