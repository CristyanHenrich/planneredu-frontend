<!-- pages/teacher/Dashboard.svelte — Dashboard web do Professor -->
<script>
  import { onMount } from 'svelte';
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import Icon       from '../../components/ui/Icon.svelte';
  import { currentUser } from '../../stores/auth.js';
  import { api } from '../../lib/api.js';

  export let onNavigate = (id) => {};

  let subjects = [];
  let loading = true;
  let totalStudents = 0;
  let totalClasses = 0;
  let pendingAttempts = [];
  let pendingAttemptsCount = 0;

  onMount(async () => {
    try {
      subjects = await api.teacher.subjects() ?? [];
      totalClasses = subjects.length;
      totalStudents = subjects.reduce((sum, s) => sum + (s.student_count ?? 0), 0);
    } catch (_) {}
    
    try {
      // Fetch submissions that need grading
      const attemptsData = await api.teacher.attempts.list({ status: 'submitted' });
      pendingAttempts = attemptsData ?? [];
      pendingAttemptsCount = pendingAttempts.length;
    } catch (_) {}
    
    loading = false;
  });

  $: stats = [
    { label:'Aulas hoje',         value:'3',   sub:'próxima: 10:30',       icon:'calendar', color:'#FF6700', bg:'rgba(255,103,0,0.08)' },
    { label:'Tarefas p/ corrigir',value: String(pendingAttemptsCount), sub:'Pendentes de avaliação', icon:'book', color:'#FF2D5F', bg:'rgba(255,45,95,0.08)' },
    { label:'Média da turma',     value:'7.4', sub:'↑ 0.2 este bimestre', icon:'chart',    color:'#4CD964', bg:'rgba(76,217,100,0.08)' },
  ];

  // Helper to format date
  function formatDate(dStr) {
    if (!dStr) return '';
    const d = new Date(dStr);
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  }

  const topStudents = [
    { name:'Rafaela O.', class:'9º A', avg:9.2, avatar:'RO' },
    { name:'Lucas M.',   class:'9º A', avg:8.9, avatar:'LM' },
    { name:'Ana C.',     class:'1º A', avg:8.7, avatar:'AC' },
    { name:'Pedro N.',   class:'9º B', avg:8.5, avatar:'PN' },
    { name:'Sofia L.',   class:'1º B', avg:8.3, avatar:'SL' },
  ];
</script>

<AppLayout
  title="Dashboard"
  breadcrumbs={[{ label:'Professor' }]}
  active="t-dashboard"
  {onNavigate}
>
  <PageHeader
    title="Bom dia, {$currentUser.name}! 👋"
    subtitle="Confira o progresso geral das suas turmas e disciplinas vinculadas."
  />

  <!-- Stats -->
  <div class="grid grid-cols-4 gap-4 mb-6">
    <!-- Total Students Card (Dynamic) -->
    <div
      class="bg-white rounded-14 p-4 flex items-start gap-3"
      style="border:1px solid #E4E4E7;"
    >
      <div
        class="w-10 h-10 rounded-10 flex items-center justify-center flex-shrink-0"
        style="background:rgba(0,78,152,0.08);"
      >
        <Icon name="user" size={20} color="#004E98" />
      </div>
      <div>
        <p class="text-[12px] text-pe-text-sec font-medium">Total de alunos</p>
        <p class="text-[22px] font-extrabold text-pe-text tracking-tight leading-tight">
          {#if loading}
            ...
          {:else}
            {totalStudents}
          {/if}
        </p>
        <p class="text-[11px] font-medium" style="color:#004E98;">
          em {totalClasses} {totalClasses === 1 ? 'disciplina ativa' : 'disciplinas ativas'}
        </p>
      </div>
    </div>

    <!-- Static stats cards -->
    {#each stats as s}
      <div
        class="bg-white rounded-14 p-4 flex items-start gap-3"
        style="border:1px solid #E4E4E7;"
      >
        <div
          class="w-10 h-10 rounded-10 flex items-center justify-center flex-shrink-0"
          style="background:{s.bg};"
        >
          <Icon name={s.icon} size={20} color={s.color} />
        </div>
        <div>
          <p class="text-[12px] text-pe-text-sec font-medium">{s.label}</p>
          <p class="text-[22px] font-extrabold text-pe-text tracking-tight leading-tight">{s.value}</p>
          <p class="text-[11px] font-medium" style="color:{s.color};">{s.sub}</p>
        </div>
      </div>
    {/each}
  </div>

  <div class="grid grid-cols-3 gap-4 mb-4">
    <!-- Minhas turmas -->
    <div class="col-span-2 bg-white rounded-14 p-5" style="border:1px solid #E4E4E7;">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-[15px] font-bold text-pe-text tracking-tight">Minhas turmas</h2>
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span class="text-[12px] font-semibold text-pe-primary cursor-pointer hover:underline" on:click={() => onNavigate('teacher-classes')}>Gerenciar →</span>
      </div>

      {#if loading}
        <div class="flex items-center justify-center h-32">
          <span class="w-6 h-6 border-2 border-slate-200 border-t-pe-primary rounded-full animate-spin"></span>
        </div>
      {:else if subjects.length === 0}
        <div class="flex flex-col items-center justify-center h-32 text-slate-400 gap-1 text-center">
          <svg class="mx-auto" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <p class="text-[13px] font-bold">Nenhuma turma atribuída</p>
          <p class="text-[11px]">Você ainda não foi vinculado a nenhuma turma.</p>
        </div>
      {:else}
        <div class="grid grid-cols-2 gap-3">
          {#each subjects as cls}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              class="p-4 rounded-12 cursor-pointer hover:shadow-sm transition-shadow bg-white"
              style="border:1px solid #E4E4E7; border-left:4px solid {cls.color || '#004E98'};"
              on:click={() => onNavigate('teacher-classes')}
            >
              <div class="flex justify-between items-start mb-2">
                <div>
                  <p class="text-[14px] font-bold text-pe-text truncate max-w-[155px]">{cls.grade_level || 'Sem série'}</p>
                  <p class="text-[11px] font-semibold text-pe-text-sec truncate max-w-[155px]" style="color:{cls.color || '#004E98'}">{cls.name}</p>
                </div>
              </div>
              <div class="flex items-center justify-between mt-4">
                <div class="flex items-center gap-1 text-[12px] text-pe-text-sec">
                  <Icon name="user" size={12} color="#6B7280" />
                  <strong>{cls.student_count ?? 0}</strong> { (cls.student_count ?? 0) === 1 ? 'aluno' : 'alunos' }
                </div>
                {#if cls.institution}
                  <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">{cls.institution}</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Top alunos -->
    <div class="col-span-1 bg-white rounded-14 p-5" style="border:1px solid #E4E4E7;">
      <h2 class="text-[15px] font-bold text-pe-text tracking-tight mb-4">Melhores alunos</h2>
      {#each topStudents as student, i}
        <div
          class="flex items-center gap-3 py-2"
          style="border-bottom:{i < topStudents.length-1 ? '1px solid #F5F6F8' : 'none'};"
        >
          <span class="text-[13px] font-bold text-pe-text-sec w-5">{i+1}</span>
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
            style="background:hsl({i*40+200},60%,50%);"
          >{student.avatar}</div>
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-semibold text-pe-text truncate">{student.name}</p>
            <p class="text-[11px] text-pe-text-sec">{student.class}</p>
          </div>
          <span
            class="text-[14px] font-bold"
            style="color:{student.avg >= 9 ? '#4CD964' : student.avg >= 8 ? '#004E98' : '#FFB42E'};"
          >{student.avg}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Tarefas para corrigir -->
  <div class="bg-white rounded-14 p-5" style="border:1px solid #E4E4E7;">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-[15px] font-bold text-pe-text tracking-tight">Tarefas para corrigir</h2>
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <span class="text-[12px] font-semibold text-pe-primary cursor-pointer hover:underline" on:click={() => onNavigate('teacher-corrections')}>Ver todas ({pendingAttemptsCount} entregas) →</span>
    </div>
    {#if loading}
      <div class="flex items-center justify-center h-24">
        <span class="w-6 h-6 border-2 border-slate-200 border-t-pe-primary rounded-full animate-spin"></span>
      </div>
    {:else if pendingAttempts.length === 0}
      <div class="flex flex-col items-center justify-center py-8 text-slate-400 gap-1 text-center">
        <svg class="mx-auto" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <p class="text-[13px] font-bold">Tudo em dia!</p>
        <p class="text-[11px]">Nenhuma entrega pendente de correção no momento.</p>
      </div>
    {:else}
      <div class="grid grid-cols-2 gap-3">
        {#each pendingAttempts.slice(0, 4) as attempt}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="flex items-center gap-3 p-3 rounded-12 cursor-pointer hover:bg-pe-bg-alt transition-colors bg-white"
            style="border:1px solid #E4E4E7;"
            on:click={() => onNavigate('teacher-corrections')}
          >
            <div
              class="w-9 h-9 rounded-10 flex items-center justify-center flex-shrink-0"
              style="background:rgba(255,45,95,0.08);"
            >
              <Icon name="check" size={18} color="#FF2D5F" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-semibold text-pe-text truncate">{attempt.task?.title ?? attempt.Task?.Title ?? 'Tarefa Sem Título'}</p>
              <p class="text-[11px] text-pe-text-sec">Aluno: {attempt.student?.name ?? attempt.User?.Name ?? attempt.user?.name ?? 'Estudante'} · Tentativa #{attempt.ID ?? attempt.id ?? '-'}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="text-[11px] text-slate-400 font-semibold">{formatDate(attempt.submitted_at)}</p>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 uppercase tracking-wide">Pendente</span>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</AppLayout>
