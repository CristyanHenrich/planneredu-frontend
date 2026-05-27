<script>
  import { onMount } from 'svelte';
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import Icon       from '../../components/ui/Icon.svelte';
  import Modal      from '../../components/ui/Modal.svelte';
  import { api }    from '../../lib/api.js';

  export let onNavigate = (id) => {};

  let subjects = [];
  let loading = true;
  let error = null;
  let selectedSubject = null;

  onMount(async () => {
    try {
      subjects = await api.students.subjects() ?? [];
    } catch (e) {
      error = 'Erro ao carregar matérias';
      console.error(e);
    } finally {
      loading = false;
    }
  });

  function openSubject(s) { selectedSubject = s; }
  function closeSubject() { selectedSubject = null; }

  function teacherNames(subject) {
    if (!subject.teachers || subject.teachers.length === 0) return 'Sem professor';
    return subject.teachers.map(t => t.name).join(', ');
  }
</script>

<AppLayout title="Matérias" breadcrumbs={[{label:'Aluno'},{label:'Matérias'}]} active="subjects" {onNavigate}>
  <PageHeader
    title="Matérias"
    subtitle="{subjects.length} disciplinas"
  />

  {#if loading}
    <div class="grid grid-cols-3 gap-4">
      {#each [1,2,3,4,5,6] as _}
        <div class="bg-white rounded-16 p-5 border border-slate-200 animate-pulse">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-14 bg-slate-200" />
            <div class="flex-1">
              <div class="h-4 bg-slate-200 rounded w-2/3 mb-1" />
              <div class="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
          <div class="h-3 bg-slate-200 rounded w-full mb-3" />
          <div class="h-3 bg-slate-200 rounded w-full mb-3" />
          <div class="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      {/each}
    </div>
  {:else if error}
    <div class="text-center py-12">
      <p class="text-[14px] font-bold text-red-500">{error}</p>
    </div>
  {:else}
    <div class="grid grid-cols-3 gap-4">
      {#each subjects as s}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="bg-white rounded-16 p-5 border border-slate-200 cursor-pointer hover:shadow-md transition-all"
          on:click={() => openSubject(s)}
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-14 flex items-center justify-center flex-shrink-0" style="background:{s.color}15;">
              <Icon name="book" size={24} color={s.color} />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[15px] font-black text-slate-900 tracking-tight truncate">{s.name}</p>
              <p class="text-[12px] text-slate-500 truncate">{teacherNames(s)}</p>
            </div>
            <div class="text-right flex-shrink-0">
              {#if s.total_tasks > 0}
                <p class="text-[22px] font-black tracking-tight" style="color:{s.average_grade < 7 ? '#EF4444' : s.color};">{s.average_grade.toFixed(1)}</p>
                <p class="text-[9px] font-black uppercase tracking-wider text-slate-400">Média</p>
              {/if}
            </div>
          </div>

          <div class="mb-3">
            <div class="flex justify-between text-[11px] text-slate-500 font-semibold mb-1">
              <span>Conteúdo</span>
              <span>{s.done_tasks}/{s.total_tasks} tarefas</span>
            </div>
            <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all" style="width:{s.total_tasks > 0 ? s.done_tasks / s.total_tasks * 100 : 0}%;background:{s.color};" />
            </div>
          </div>

          <div class="mb-3">
            <div class="flex justify-between text-[11px] font-bold mb-1 text-emerald-600">
              <span>Faltas</span>
              <span>0/0</span>
            </div>
            <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all" style="width:0%;background:#10B981;" />
            </div>
          </div>

          <div class="flex items-center gap-1.5 text-[12px] text-slate-500 pt-3 border-t border-slate-100">
            <Icon name="clock" size={12} color="#94A3B8" />
            <span>Próxima: <strong class="text-slate-700 font-semibold">—</strong></span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</AppLayout>

<Modal open={!!selectedSubject} onClose={closeSubject} width="680px">
  {#if selectedSubject}
    <div class="text-white px-6 pb-6 pt-6" style="background:{selectedSubject.color};">
      <div class="flex items-start justify-between mb-4">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-wider opacity-80">MATÉRIA</p>
          <h1 class="text-[28px] font-extrabold tracking-tighter mt-1">{selectedSubject.name}</h1>
          <p class="text-[13px] opacity-85 mt-1">{teacherNames(selectedSubject)}</p>
        </div>
      </div>
      <div class="flex gap-3">
        {#each [
          { label:'Média', value: selectedSubject.average_grade.toFixed(1), accent: selectedSubject.average_grade < 7 ? '#FCA5A5' : '#FFFFFF' },
          { label:'Conteúdo', value: `${selectedSubject.done_tasks}/${selectedSubject.total_tasks}` },
        ] as st}
          <div class="flex-1 rounded-10 p-3" style="background:rgba(255,255,255,0.12);">
            <p class="text-[10px] opacity-75 font-bold uppercase tracking-wide">{st.label}</p>
            <p class="text-[18px] font-extrabold mt-0.5" style="color:{st.accent ?? '#FFFFFF'};">{st.value}</p>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</Modal>
