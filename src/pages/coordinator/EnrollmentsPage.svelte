<script>
  import { onMount } from 'svelte';
  import AppLayout from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import { api } from '../../lib/api.js';

  export let onNavigate = (id) => {};

  let enrollments = [];
  let loading = true;
  let filter = 'pending';
  let acting = null;

  onMount(() => load());

  async function load() {
    loading = true;
    try {
      enrollments = await api.enrollments.list(filter ? { status: filter } : {});
    } catch (_) {
      enrollments = [];
    } finally {
      loading = false;
    }
  }

  async function approve(id) {
    acting = id;
    try {
      await api.enrollments.approve(id);
      enrollments = enrollments.filter(e => e.id !== id);
    } catch (_) {} finally {
      acting = null;
    }
  }

  async function reject(id) {
    acting = id;
    try {
      await api.enrollments.reject(id);
      enrollments = enrollments.filter(e => e.id !== id);
    } catch (_) {} finally {
      acting = null;
    }
  }

  const statusLabel = { pending: 'Pendente', approved: 'Aprovado', rejected: 'Rejeitado' };
  const statusColor = { pending: '#FF6700', approved: '#4CD964', rejected: '#FF2D5F' };
  const statusBg    = { pending: 'rgba(255,103,0,0.08)', approved: 'rgba(76,217,100,0.08)', rejected: 'rgba(255,45,95,0.08)' };
</script>

<AppLayout title="Matrículas" active="c-enrollments" {onNavigate}>
  <PageHeader
    title="Matrículas"
    subtitle="Aprove ou rejeite solicitações de matrícula."
  />

  <!-- Filtro -->
  <div class="flex gap-2 mb-6">
    {#each [['', 'Todos'], ['pending', 'Matrículas Pendentes'], ['approved', 'Matrículas Aprovadas'], ['rejected', 'Matrículas Rejeitadas']] as [val, lbl]}
      <button
        class="px-4 py-2 rounded-10 text-[13px] font-semibold transition-all"
        style={filter === val
          ? 'background:#004E98;color:#fff;'
          : 'background:#F5F6F8;color:#64748B;border:1px solid #E4E4E7;'}
        on:click={() => { filter = val; load(); }}
      >
        {lbl}
      </button>
    {/each}
  </div>

  {#if loading}
    <div class="flex items-center justify-center h-40">
      <span class="w-7 h-7 border-2 border-slate-200 border-t-pe-primary rounded-full animate-spin"></span>
    </div>
  {:else if enrollments.length === 0}
    <div class="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
      <p class="text-[14px] font-semibold">Nenhuma matrícula encontrada.</p>
    </div>
  {:else}
    <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aluno</th>
            <th class="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Turma</th>
            <th class="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
            <th class="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Solicitado</th>
            <th class="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-36"></th>
          </tr>
        </thead>
        <tbody>
          {#each enrollments as e}
            <tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
              <td class="px-5 py-3.5">
                <p class="text-[14px] font-semibold text-slate-800">{e.user_name}</p>
                <p class="text-[12px] text-slate-400">{e.user_email}</p>
              </td>
              <td class="px-5 py-3.5 text-[13px] text-slate-600">
                {e.class_room_name || e.grade_level || '—'}
              </td>
              <td class="px-5 py-3.5">
                <span class="px-2.5 py-1 rounded-8 text-[11px] font-bold"
                  style="background:{statusBg[e.status]};color:{statusColor[e.status]};">
                  {statusLabel[e.status]}
                </span>
              </td>
              <td class="px-5 py-3.5 text-[12px] text-slate-400">
                {new Date(e.created_at).toLocaleDateString('pt-BR')}
              </td>
              <td class="px-5 py-3.5">
                {#if e.status === 'pending'}
                  <div class="flex gap-2 justify-end">
                    <button
                      class="px-3 py-1.5 rounded-10 text-[12px] font-bold text-white transition-opacity disabled:opacity-50"
                      style="background:#4CD964;"
                      disabled={acting === e.id}
                      on:click={() => approve(e.id)}
                    >
                      Aprovar
                    </button>
                    <button
                      class="px-3 py-1.5 rounded-10 text-[12px] font-bold text-white transition-opacity disabled:opacity-50"
                      style="background:#FF2D5F;"
                      disabled={acting === e.id}
                      on:click={() => reject(e.id)}
                    >
                      Rejeitar
                    </button>
                  </div>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</AppLayout>
