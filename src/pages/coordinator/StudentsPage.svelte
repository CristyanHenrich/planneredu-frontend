<script>
  import { onMount } from 'svelte';
  import AppLayout from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import { api } from '../../lib/api.js';

  export let onNavigate = (id) => {};
  export let classRoomId = null;
  export let classRoomName = '';

  let students = [];
  let loading = true;
  let filterStatus = '';

  onMount(load);

  async function load() {
    loading = true;
    const params = {};
    if (classRoomId)  params.class_room_id = classRoomId;
    if (filterStatus) params.status = filterStatus;
    try {
      students = await api.enrollments.list(params);
    } catch (_) {
      students = [];
    } finally {
      loading = false;
    }
  }

  $: if (filterStatus !== undefined) load();

  const statusLabel = { pending: 'Pendente', approved: 'Aprovado', rejected: 'Rejeitado' };
  const statusColor = { pending: '#FF6700', approved: '#4CD964', rejected: '#FF2D5F' };
  const statusBg    = { pending: 'rgba(255,103,0,0.08)', approved: 'rgba(76,217,100,0.08)', rejected: 'rgba(255,45,95,0.08)' };
</script>

<AppLayout title="Alunos" active="c-students" {onNavigate}>
  {#if classRoomId}
    <div class="mb-2">
      <button
        class="text-[13px] text-slate-400 hover:text-slate-700 flex items-center gap-1.5 transition-colors"
        on:click={() => onNavigate('c-classrooms')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        Turmas
      </button>
    </div>
  {/if}

  <PageHeader
    title={classRoomId ? `Alunos · ${classRoomName}` : 'Todos os Alunos'}
    subtitle={classRoomId ? `Alunos matriculados na turma ${classRoomName}.` : 'Lista completa de alunos da sua instituição.'}
  />

  <!-- Filtro de status -->
  <div class="flex gap-2 mb-5">
    {#each [['', 'Todos'], ['approved', 'Matrículas Aprovadas'], ['pending', 'Matrículas Pendentes'], ['rejected', 'Matrículas Rejeitadas']] as [val, lbl]}
      <button
        class="px-4 py-2 rounded-10 text-[13px] font-semibold transition-all"
        style={filterStatus === val
          ? 'background:#004E98;color:#fff;'
          : 'background:#F5F6F8;color:#64748B;border:1px solid #E4E4E7;'}
        on:click={() => { filterStatus = val; }}
      >{lbl}</button>
    {/each}
  </div>

  <div class="bg-white rounded-14 overflow-hidden" style="border:1px solid #E4E4E7;">
    <div class="flex items-center justify-between px-5 py-3.5" style="border-bottom:1px solid #E4E4E7;">
      <p class="text-[13px] font-semibold text-slate-500">
        {#if loading}Carregando...{:else}{students.length} aluno{students.length !== 1 ? 's' : ''} encontrado{students.length !== 1 ? 's' : ''}{/if}
      </p>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-16">
        <span class="w-6 h-6 border-2 border-slate-200 border-t-pe-primary rounded-full animate-spin"></span>
      </div>
    {:else if students.length === 0}
      <div class="flex flex-col items-center justify-center py-16 text-slate-400">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <p class="mt-3 text-[14px] font-medium">Nenhum aluno encontrado.</p>
      </div>
    {:else}
      <table class="w-full">
        <thead>
          <tr style="background:#F8FAFC;">
            <th class="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Aluno</th>
            <th class="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Turma</th>
            <th class="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Série</th>
            <th class="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Status</th>
            <th class="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Desde</th>
          </tr>
        </thead>
        <tbody>
          {#each students as s}
            <tr class="hover:bg-slate-50 transition-colors" style="border-top:1px solid #F1F5F9;">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0" style="background:#004E98;">
                    {s.user_name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p class="text-[14px] font-semibold text-slate-800">{s.user_name}</p>
                    <p class="text-[12px] text-slate-400">{s.user_email}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <p class="text-[13px] text-slate-700 font-medium">{s.class_room_name || '—'}</p>
              </td>
              <td class="px-4 py-3.5">
                <p class="text-[13px] text-slate-500">{s.grade_level || '—'}</p>
              </td>
              <td class="px-4 py-3.5">
                <span class="px-2.5 py-1 rounded-8 text-[11px] font-bold"
                  style="background:{statusBg[s.status]};color:{statusColor[s.status]};">
                  {statusLabel[s.status] ?? s.status}
                </span>
              </td>
              <td class="px-4 py-3.5">
                <p class="text-[13px] text-slate-400">{new Date(s.created_at).toLocaleDateString('pt-BR')}</p>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</AppLayout>
