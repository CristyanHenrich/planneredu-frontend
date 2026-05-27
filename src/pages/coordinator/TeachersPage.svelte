<script>
  import { onMount } from 'svelte';
  import AppLayout from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import { api } from '../../lib/api.js';

  export let onNavigate = (id) => {};

  let teachers = [];
  let institutionId = null;
  let loading = true;
  let panelOpen = false;
  let saving = false;
  let formError = '';
  let form = { name: '', email: '', password: '', role: 'teacher' };

  onMount(async () => {
    try {
      const enrollments = await api.enrollments.list();
      if (enrollments?.length > 0) {
        institutionId = enrollments[0].institution_id;
        const users = await api.institutions.listUsers(institutionId);
        teachers = (users || []).filter(u => u.role === 'teacher');
      }
    } catch (_) {} finally {
      loading = false;
    }
  });

  function openNew() {
    form = { name: '', email: '', password: '', role: 'teacher' };
    formError = '';
    panelOpen = true;
  }

  async function save() {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      formError = 'Preencha todos os campos obrigatórios.';
      return;
    }
    if (!institutionId) { formError = 'Nenhuma instituição encontrada.'; return; }
    saving = true;
    formError = '';
    try {
      const created = await api.institutions.createUser(institutionId, form);
      teachers = [created, ...teachers];
      panelOpen = false;
    } catch (err) {
      formError = err?.errors?.[0]?.message || 'Erro ao criar professor.';
    } finally {
      saving = false;
    }
  }
</script>

<AppLayout title="Professores" active="c-teachers" {onNavigate}>
  <PageHeader
    title="Professores"
    subtitle="Gerencie os professores da sua instituição."
    actions={[{ label: '+ Novo Professor', variant: 'primary', onClick: openNew }]}
  />

  {#if loading}
    <div class="flex items-center justify-center h-40">
      <span class="w-7 h-7 border-2 border-slate-200 border-t-pe-primary rounded-full animate-spin"></span>
    </div>
  {:else if teachers.length === 0}
    <div class="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <p class="text-[14px] font-semibold">Nenhum professor cadastrado.</p>
    </div>
  {:else}
    <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nome</th>
            <th class="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">E-mail</th>
          </tr>
        </thead>
        <tbody>
          {#each teachers as t}
            <tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
              <td class="px-5 py-3.5 text-[14px] font-semibold text-slate-800">{t.name}</td>
              <td class="px-5 py-3.5 text-[13px] text-slate-500">{t.email}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</AppLayout>

{#if panelOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" on:click={() => panelOpen = false} />
  <div class="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
    <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
      <h2 class="text-[17px] font-bold text-slate-900">Novo Professor</h2>
      <button class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-500" on:click={() => panelOpen = false}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="flex-1 overflow-y-auto p-6 space-y-5">
      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">Nome *</label>
        <input type="text" bind:value={form.name} placeholder="Nome completo"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-14 text-[14px] focus:bg-white focus:border-pe-primary outline-none transition-all" />
      </div>
      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">E-mail *</label>
        <input type="email" bind:value={form.email} placeholder="professor@escola.com"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-14 text-[14px] focus:bg-white focus:border-pe-primary outline-none transition-all" />
      </div>
      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">Senha provisória *</label>
        <input type="password" bind:value={form.password} placeholder="Mínimo 8 caracteres"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-14 text-[14px] focus:bg-white focus:border-pe-primary outline-none transition-all" />
      </div>
      {#if formError}
        <p class="text-[13px] font-medium text-red-600">{formError}</p>
      {/if}
    </div>
    <div class="p-6 border-t border-slate-100 flex gap-3">
      <button class="flex-1 py-3 rounded-14 text-[14px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50" on:click={() => panelOpen = false}>Cancelar</button>
      <button
        class="flex-1 py-3 rounded-14 text-[14px] font-bold text-white disabled:opacity-60"
        style="background:#004E98;"
        disabled={saving}
        on:click={save}
      >
        {saving ? 'Criando...' : 'Criar Professor'}
      </button>
    </div>
  </div>
{/if}
