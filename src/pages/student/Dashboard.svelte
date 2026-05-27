<script>
  import { onMount } from 'svelte';
  import AppLayout   from '../../layouts/AppLayout.svelte';
  import PageHeader  from '../../components/layout/PageHeader.svelte';
  import Icon        from '../../components/ui/Icon.svelte';
  import StreakModal from '../../components/student/StreakModal.svelte';
  import { currentUser } from '../../stores/auth.js';
  import { api }      from '../../lib/api.js';
  import { checkStreak, fetchStreak } from '../../stores/streak.js';

  export let onNavigate = (id) => {};

  const today = new Date();
  const todayLabel = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const todayShort = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');

  let statsData = {
    total_tasks: 0,
    done_tasks: 0,
    total_hours: 0,
    study_plan_count: 0
  };
  let loadingStats = true;
  let pendingTasks = [];
  let loadingTasks = true;
  let showStreakModal = false;
  let streakCount = 0;

  function formatDue(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === now.toDateString()) return 'Hoje';
    if (d.toDateString() === tomorrow.toDateString()) return 'Amanhã';
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '');
  }

  function isUrgent(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((d - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  }

  function calcProgress(task) {
    const subtasks = task.subtasks ?? [];
    if (subtasks.length === 0) return 0;
    return Math.round(subtasks.filter(s => s.completed).length / subtasks.length * 100);
  }

  onMount(async () => {
    try {
      statsData = await api.students.stats();
    } catch (err) {
      console.error(err);
    } finally {
      loadingStats = false;
    }

    try {
      const all = await api.tasks.list();
      const filtered = (Array.isArray(all) ? all : (all?.tasks ?? all?.data ?? []))
        .filter(t => t.status !== 'done')
        .slice(0, 4);

      pendingTasks = filtered.map(t => ({
        title: t.title,
        subj: t.subject_name || 'Geral',
        color: t.subject_color || '#6B7280',
        due: formatDue(t.due_date),
        urgent: isUrgent(t.due_date),
        progress: calcProgress(t),
      }));
    } catch (err) {
      console.error('Failed to fetch pending tasks:', err);
    } finally {
      loadingTasks = false;
    }

    const streakData = await checkStreak();
    if (streakData) {
      streakCount = streakData.streak_count;
      if (streakData.just_updated) {
        showStreakModal = true;
      }
    } else {
      const current = await fetchStreak();
      if (current) streakCount = current.streak_count;
    }
  });

  $: stats = [
    { id: 'kanban',    label:'Tarefas concluídas', value:`${statsData.done_tasks}/${statsData.total_tasks}`, sub:'de metas de estudo',   icon:'check',    color:'#4CD964', bg:'rgba(76,217,100,0.08)' },
    { id: 'study-plan',label:'Horas de estudo',    value:`${statsData.total_hours.toFixed(1)}h`,   sub:'horas de foco dedicadas',       icon:'clock',    color:'#004E98', bg:'rgba(0,78,152,0.08)' },
    { id: 'analytics', label:'Média geral',        value:`${statsData.average_grade != null ? statsData.average_grade.toFixed(1) : '-'}`,   sub:'média das disciplinas',icon:'chart',   color:'#FF6700', bg:'rgba(255,103,0,0.08)' },
    { id: 'achievements', label:'Sequência',   value:`${streakCount}`,   sub:'dias de sequência', icon:'flame',    color:'#FF6700', bg:'rgba(255,103,0,0.08)' },
  ];

  const schedule = [
    { time:'08:00', dur:'60min', title:'Matemática · Funções',  subj:'Matemática', color:'#004E98', room:'Sala 204' },
    { time:'10:30', dur:'50min', title:'História',              subj:'História',   color:'#FF6700', room:'Sala 112' },
    { time:'14:00', dur:'30min', title:'Redação (entrega)',     subj:'Tarefa',     color:'#FF2D5F' },
    { time:'16:00', dur:'90min', title:'Prova de Física',       subj:'Prova',      color:'#FF2D5F', room:'Auditório' },
  ];

  const subjects = [
    { name:'Biologia',   pct:92, color:'#4CD964' },
    { name:'Matemática', pct:85, color:'#004E98' },
    { name:'Português',  pct:78, color:'#FF2D5F' },
    { name:'História',   pct:70, color:'#FF6700' },
  ];
</script>

<AppLayout
  title="Dashboard"
  breadcrumbs={[{ label:'Aluno' }]}
  active="home"
  {onNavigate}
>
  <PageHeader
    title="Bom dia, {$currentUser.name.split(' ')[0]}! 👋"
    subtitle="{todayLabel} · {schedule.length} eventos hoje"
    actions={[{ label:'+ Nova tarefa', variant:'primary' }]}
  />

  <!-- Main Dashboard Grid -->
  <div class="grid grid-cols-12 gap-6">
    
    <!-- LEFT COLUMN: Main Stats & Schedule -->
    <div class="col-span-8 space-y-6">
      
      <!-- Quick Stats Row -->
      <div class="grid grid-cols-4 gap-4">
        {#each stats as s}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div 
            class="bg-white rounded-20 p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            on:click={() => onNavigate(s.id)}
          >
            <div class="w-12 h-12 rounded-14 flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style="background:{s.bg};">
              <Icon name={s.icon} size={22} color={s.color} />
            </div>
            <p class="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p class="text-[28px] font-black text-slate-900 tracking-tighter leading-none">{s.value}</p>
            <p class="text-[12px] font-bold mt-2" style="color:{s.color};">{s.sub}</p>
          </div>
        {/each}
      </div>

      <!-- Tasks Row -->
      <div class="w-full">
        <!-- Unified Tasks Card -->
        <div class="bg-white rounded-24 p-6 border border-slate-100 shadow-sm flex flex-col h-full">
            <div class="flex justify-between items-center mb-6">
               <h2 class="text-[18px] font-black text-slate-900 tracking-tight">Pendências</h2>
               <!-- svelte-ignore a11y-click-events-have-key-events -->
               <!-- svelte-ignore a11y-no-static-element-interactions -->
               <span class="text-[13px] font-bold text-blue-600 cursor-pointer hover:underline" on:click={() => onNavigate('kanban')}>Ir para Kanban</span>
            </div>
  
            <div class="grid grid-cols-2 gap-4 flex-1">
              {#if loadingTasks}
                {#each [1,2] as i}
                  <div class="p-4 rounded-20 border border-slate-50 bg-slate-50/30 animate-pulse">
                    <div class="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                    <div class="h-5 bg-slate-200 rounded w-2/3 mb-3" />
                    <div class="flex items-center gap-2">
                      <div class="flex-1 h-2 bg-slate-200 rounded-full" />
                    </div>
                  </div>
                {/each}
              {:else}
                {#each pendingTasks as task}
                  <div class="p-4 rounded-20 border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                    <div class="flex justify-between items-start mb-2">
                      <span class="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md" style="background:{task.color}15; color:{task.color};">{task.subj}</span>
                      <span class="text-[11px] font-bold {task.urgent ? 'text-red-500' : 'text-slate-400'}">{task.due}</span>
                    </div>
                    <p class="text-[15px] font-bold text-slate-800 leading-tight mb-3">{task.title}</p>
                    <div class="flex items-center gap-2">
                       <div class="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div class="h-full rounded-full" style="width:{task.progress}%; background:{task.color};" />
                       </div>
                       <span class="text-[11px] font-bold text-slate-400">{task.progress}%</span>
                    </div>
                  </div>
                {/each}
              {/if}
           </div>
        </div>
      </div>

    </div>

    <!-- RIGHT COLUMN: Tasks & Achievements -->
    <div class="col-span-4 space-y-6">
      
      <!-- Compact Hero Banner -->
      <div class="p-6 rounded-32 text-white relative overflow-hidden shadow-lg shadow-blue-900/10" style="background: linear-gradient(135deg, #004E98, #003B73);">
        <div class="absolute rounded-full" style="top:-20px; right:-20px; width:100px; height:100px; background:rgba(255,103,0,0.15); filter: blur(25px);" />
        <div class="relative flex items-center gap-4">
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
             <p class="text-[11px] font-bold uppercase tracking-widest opacity-70 mb-0.5">Hoje · {todayShort}</p>
             <p class="text-[17px] font-bold tracking-tight">4 aulas e 2 tarefas</p>
             <p class="text-[11px] opacity-70 mt-0.5">Você concluiu 3/4 do planejado</p>
           </div>
        </div>
      </div>

      <!-- Agenda -->
      <div class="bg-white rounded-24 p-6 border border-slate-100 shadow-sm">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-[18px] font-black text-slate-900 tracking-tight">Agenda de hoje</h2>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <span class="text-[13px] font-bold text-blue-600 cursor-pointer hover:underline" on:click={() => onNavigate('calendar')}>Ver tudo</span>
        </div>
        <div class="space-y-4">
          {#each schedule as ev}
            <div class="flex gap-4 items-center p-3 rounded-20 hover:bg-slate-50 transition-colors cursor-pointer group">
              <div class="w-14 text-center">
                <p class="text-[14px] font-black text-slate-900">{ev.time}</p>
                <p class="text-[11px] text-slate-400 font-bold uppercase">{ev.dur}</p>
              </div>
              <div class="w-1 h-10 rounded-full" style="background:{ev.color};" />
              <div class="flex-1">
                <p class="text-[11px] font-black uppercase tracking-widest mb-0.5" style="color:{ev.color};">{ev.subj}</p>
                <p class="text-[15px] font-bold text-slate-800 leading-tight">{ev.title}</p>
              </div>
              <Icon name="chevron-right" size={16} color="#E2E8F0" />
            </div>
          {/each}
        </div>
        <div class="mt-6 pt-4 border-t border-slate-50">
           <button class="w-full py-3 rounded-16 bg-blue-600 text-white text-[14px] font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
              + Novo evento
           </button>
        </div>
      </div>

    </div>

  </div>

</AppLayout>

<StreakModal count={streakCount} show={showStreakModal} onClose={() => showStreakModal = false} />
