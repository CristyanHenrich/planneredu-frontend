<script>
  import { onMount } from 'svelte';
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import { api }   from '../../lib/api.js';
  import {
    Clock, CheckCircle2, ClipboardList, Inbox, AlertTriangle, Check
  } from 'lucide-svelte';

  export let onNavigate = (id) => {};

  let attempts     = [];
  let loading      = true;
  let filterStatus = '';

  onMount(() => loadAttempts());

  async function loadAttempts() {
    loading = true;
    try {
      const all = await api.teacher.attempts.list() ?? [];
      attempts = filterStatus ? all.filter(a => a.Status === filterStatus) : all;
    } catch (err) {
      console.error(err);
    } finally {
      loading = false;
    }
  }

  async function openGrading(attempt) {
    onNavigate('teacher-correction', { id: String(attempt.ID ?? attempt.id) });
  }

  function formatTime(sec) {
    // Handle negative or invalid values
    if (!sec || sec < 0) return '0s';
    if (sec < 60) return `${Math.round(sec)}s`;
    return `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`;
  }

  function onFilterChange(e) {
    filterStatus = e.target.value;
    loadAttempts();
  }

  $: pendingCount = attempts.filter(a => a.Status !== 'graded').length;
</script>

<AppLayout
  title="Correções"
  breadcrumbs={[{label:'Professor'},{label:'Correção de Tarefas'}]}
  active="teacher-corrections"
  {onNavigate}
>
  <PageHeader
    title="Correção de Tarefas"
    subtitle="Revise as submissões dos alunos, corrija questões dissertativas/redações e atribua notas."
  />

  <!-- Stats bar -->
  <div class="grid grid-cols-3 gap-4 mb-6">
    <div class="bg-white border border-slate-200 rounded-16 p-4 shadow-sm flex items-center gap-3">
      <div class="w-10 h-10 rounded-12 bg-amber-50 flex items-center justify-center text-amber-500"><Clock size={20} /></div>
      <div>
        <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pendentes</p>
        <p class="text-[22px] font-black text-amber-600">{pendingCount}</p>
      </div>
    </div>
    <div class="bg-white border border-slate-200 rounded-16 p-4 shadow-sm flex items-center gap-3">
      <div class="w-10 h-10 rounded-12 bg-emerald-50 flex items-center justify-center text-emerald-500"><CheckCircle2 size={20} /></div>
      <div>
        <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Corrigidos</p>
        <p class="text-[22px] font-black text-emerald-600">{attempts.filter(a => a.Status === 'graded').length}</p>
      </div>
    </div>
    <div class="bg-white border border-slate-200 rounded-16 p-4 shadow-sm flex items-center gap-3">
      <div class="w-10 h-10 rounded-12 bg-blue-50 flex items-center justify-center text-blue-500"><ClipboardList size={20} /></div>
      <div>
        <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total</p>
        <p class="text-[22px] font-black text-blue-600">{attempts.length}</p>
      </div>
    </div>
  </div>

  <!-- Filter bar -->
  <div class="bg-white border border-slate-200 rounded-16 p-4 shadow-sm mb-4 flex items-center gap-4">
    <label class="text-[13px] font-bold text-slate-600">Filtrar por status:</label>
    <select
      class="px-3 py-1.5 rounded-10 text-[13px] border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500"
      value={filterStatus}
      on:change={onFilterChange}
    >
      <option value="">Todos</option>
      <option value="submitted">Aguardando correção</option>
      <option value="graded">Já corrigidos</option>
    </select>
  </div>

  <!-- Table -->
  {#if loading}
    <div class="flex justify-center py-20 text-slate-400 text-[14px]">Carregando tentativas...</div>
  {:else if attempts.length === 0}
    <div class="bg-slate-50 border border-dashed border-slate-200 rounded-16 py-20 text-center flex flex-col items-center justify-center">
      <div class="text-slate-400 mb-3"><Inbox size={40} /></div>
      <p class="text-slate-500 text-[14px] font-semibold">Nenhuma tentativa de quiz enviada ainda.</p>
    </div>
  {:else}
    <div class="bg-white rounded-16 border border-slate-200 overflow-hidden shadow-sm">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            <th class="px-5 py-3">Estudante</th>
            <th class="px-5 py-3">Tarefa / Quiz</th>
            <th class="px-5 py-3 text-center">Desvios de Aba</th>
            <th class="px-5 py-3 text-center">Tempo Total</th>
            <th class="px-5 py-3 text-center">Nota</th>
            <th class="px-5 py-3 text-center">Status</th>
            <th class="px-5 py-3 text-right">Ação</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-[13px]">
          {#each attempts as att (att.ID)}
            <tr class="hover:bg-slate-50/80 transition-colors">
              <td class="px-5 py-4 font-bold text-slate-800">{att.User?.Name ?? 'Aluno'}{#if att.User?.Classroom?.Name} ({att.User.Classroom.Name}){/if}</td>
              <td class="px-5 py-4 text-slate-500 truncate max-w-[180px]">{att.Task?.Title || att.Task?.title || 'Tarefa s/ título'}</td>

              <td class="px-5 py-4 text-center">
                {#if (att.TabSwitches ?? att.tab_switches) > 0}
                  <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-black bg-rose-50 text-rose-600 border border-rose-200">
                    <AlertTriangle size={12} /> {att.TabSwitches ?? att.tab_switches}x
                  </span>
                {:else}
                  <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <Check size={12} /> 0
                  </span>
                {/if}
              </td>

              <td class="px-5 py-4 text-center font-bold text-slate-700">{formatTime(att.TotalTimeSeconds ?? att.total_time_seconds)}</td>

              <td class="px-5 py-4 text-center font-black text-[14px]">
                {#if att.Status === 'graded'}
                  <span class={att.Score >= 60 ? 'text-emerald-600' : 'text-rose-500'}>{(att.Score ?? att.score)?.toFixed(1)}%</span>
                {:else}
                  <span class="text-slate-400">—</span>
                {/if}
              </td>

              <td class="px-5 py-4 text-center">
                {#if att.Status === 'graded'}
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 uppercase">Corrigido</span>
                {:else}
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700 uppercase animate-pulse">Pendente</span>
                {/if}
              </td>

              <td class="px-5 py-4 text-right">
                <button
                  class="px-3.5 py-1.5 rounded-8 text-[12px] font-bold text-white transition-colors {att.Status === 'graded' ? 'bg-slate-400 hover:bg-slate-500' : 'bg-blue-600 hover:bg-blue-700'}"
                  on:click={() => openGrading(att)}
                >
                  {att.Status === 'graded' ? 'Rever' : 'Corrigir'}
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</AppLayout>
