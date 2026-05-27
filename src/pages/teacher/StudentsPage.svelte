<script>
  import { onMount } from 'svelte';
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import Icon       from '../../components/ui/Icon.svelte';
  import { api }    from '../../lib/api.js';
  import { selectedStudent } from '../../stores/teacher.js';

  export let onNavigate = (id) => {};

  let students = [];
  let searchQuery = '';
  let loading = true;

  onMount(async () => {
    try {
      students = await api.teacher.allStudents() ?? [];
    } catch (err) {
      console.error(err);
    } finally {
      loading = false;
    }
  });

  $: filteredStudents = students.filter(s => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(term) || (s.email && s.email.toLowerCase().includes(term));
  });

  function handleViewProgress(student) {
    selectedStudent.set(student);
    onNavigate('teacher-student');
  }
</script>

<AppLayout
  title="Alunos"
  breadcrumbs={[{ label: 'Professor' }, { label: 'Alunos' }]}
  active="teacher-students"
  {onNavigate}
>
  <PageHeader
    title="Meus Alunos"
    subtitle="Visualize o progresso e tarefas de todos os alunos sob sua responsabilidade."
  />

  <!-- Search Bar -->
  <div class="bg-white border border-slate-200 rounded-20 p-4 mb-6 shadow-sm flex gap-3 items-center">
    <div class="relative flex-1">
      <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
        <Icon name="search" size={18} />
      </div>
      <input
        type="text"
        placeholder="Pesquisar por nome ou e-mail..."
        bind:value={searchQuery}
        class="w-full pl-10 pr-4 py-2.5 rounded-12 text-[14px] border border-slate-200 focus:outline-none focus:border-pe-primary focus:bg-white bg-slate-50/50 transition-colors"
      />
    </div>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-24">
      <span class="w-8 h-8 border-3 border-slate-200 border-t-pe-primary rounded-full animate-spin"></span>
    </div>
  {:else if filteredStudents.length === 0}
    <div class="bg-white border border-dashed border-slate-200 rounded-20 py-20 text-center shadow-sm">
      <p class="text-slate-600 text-[15px] font-bold">Nenhum aluno encontrado</p>
      <p class="text-slate-400 text-[13px] mt-1">Experimente mudar o termo da sua pesquisa.</p>
    </div>
  {:else}
    <div class="bg-white rounded-20 overflow-hidden border border-slate-200/80 shadow-sm">
      <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <p class="text-[12px] font-black text-slate-400 uppercase tracking-widest">Alunos Ativos</p>
        <span class="text-[11px] font-bold text-slate-600 px-2 py-0.5 bg-slate-200/60 rounded-full">{filteredStudents.length} alunos</span>
      </div>

      <table class="w-full">
        <thead>
          <tr class="bg-slate-50/20 border-b border-slate-100">
            <th class="text-left px-6 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nome</th>
            <th class="text-left px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">E-mail</th>
            <th class="text-left px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Turma / Série</th>
            <th class="text-left px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tarefas Entregues</th>
            <th class="px-6 py-3.5 w-32"></th>
          </tr>
        </thead>
        <tbody>
          {#each filteredStudents as student}
            {@const done = student.done_tasks ?? 0}
            {@const total = student.total_tasks ?? 0}
            {@const pct = total > 0 ? Math.round(done / total * 100) : 0}
            <tr class="hover:bg-slate-50/50 transition-colors border-t border-slate-100">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black text-white bg-pe-primary">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p class="text-[14px] font-bold text-slate-800">{student.name}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 text-[13px] text-slate-500">{student.email || 'Sem e-mail'}</td>
              <td class="px-4 py-4">
                <span class="inline-block text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {student.grade_level || 'Sem turma'}{student.class_group ? ' · ' + student.class_group : ''}
                </span>
              </td>
              <td class="px-4 py-4">
                <div class="w-40">
                  <div class="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                    <span>{done}/{total} entregues</span>
                    <span class="text-pe-primary">{pct}%</span>
                  </div>
                  <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-pe-primary rounded-full transition-all" style="width: {pct}%" />
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  class="px-3.5 py-2 rounded-10 text-[12px] font-bold text-white bg-pe-primary hover:opacity-90 flex items-center gap-1.5 ml-auto"
                  on:click={() => handleViewProgress(student)}
                >
                  Progresso
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</AppLayout>
