<script>
  import { onMount, onDestroy } from 'svelte';
  import AppLayout from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import Icon from '../../components/ui/Icon.svelte';
  import { api } from '../../lib/api.js';

  export let onNavigate = (id) => {};
  export let institutionId = null;
  export let institutionName = '';

  let users = [];
  let loading = false;
  let panelOpen = false;
  let saving = false;
  let formError = '';

  // Form state
  let form = { name: '', email: '', password: '', role: 'coordinator' };

  // Institution search inside the form
  let instQuery = '';
  let instResults = [];
  let instSearching = false;
  let instSelected = null;
  let showInstDropdown = false;
  let instTimer;

  const roleLabel = { coordinator: 'Coordenador', teacher: 'Professor', student: 'Aluno' };
  const roleColor = { coordinator: '#004E98', teacher: '#FF6700', student: '#4CD964' };
  const roleBg    = { coordinator: 'rgba(0,78,152,0.08)', teacher: 'rgba(255,103,0,0.08)', student: 'rgba(76,217,100,0.08)' };

  onMount(() => {
    if (institutionId) load(institutionId);
  });

  onDestroy(() => clearTimeout(instTimer));

  // Reload users when institutionId prop changes (from navParams)
  $: if (institutionId) load(institutionId);

  async function load(id) {
    if (!id) return;
    loading = true;
    try {
      users = await api.institutions.listUsers(id);
    } catch (_) {
      users = [];
    } finally {
      loading = false;
    }
  }

  // ── Institution search (inside form) ───────────────────────
  function handleInstInput() {
    instSelected = null;
    clearTimeout(instTimer);
    if (instQuery.length < 2) { instResults = []; showInstDropdown = false; return; }
    instTimer = setTimeout(doInstSearch, 280);
  }

  async function doInstSearch() {
    instSearching = true;
    try {
      instResults = await api.institutions.search(instQuery);
      showInstDropdown = instResults.length > 0;
    } catch (_) {
      instResults = [];
    } finally {
      instSearching = false;
    }
  }

  function selectInst(inst) {
    instSelected = inst;
    instQuery = inst.name;
    showInstDropdown = false;
  }

  function handleInstBlur() {
    setTimeout(() => { showInstDropdown = false; }, 150);
  }

  // ── Panel helpers ──────────────────────────────────────────
  function openNew() {
    form = { name: '', email: '', password: '', role: 'coordinator' };
    formError = '';
    // Pre-fill institution from prop if available
    if (institutionId) {
      instSelected = { id: institutionId, name: institutionName };
      instQuery = institutionName;
    } else {
      instSelected = null;
      instQuery = '';
    }
    instResults = [];
    showInstDropdown = false;
    panelOpen = true;
  }

  async function save() {
    const targetId = instSelected?.id ?? institutionId;
    if (!targetId) { formError = 'Selecione uma instituição.'; return; }
    if (!form.name.trim() || !form.email.trim() || form.password.length < 8) {
      formError = 'Preencha todos os campos. A senha deve ter ao menos 8 caracteres.';
      return;
    }
    saving = true;
    formError = '';
    try {
      const created = await api.institutions.createUser(targetId, form);
      users = [created, ...users];
      panelOpen = false;
      // If we just created a user for a new institution, load that institution's data
      if (!institutionId) {
        institutionId = targetId;
        institutionName = instSelected?.name ?? '';
      }
    } catch (err) {
      formError = err?.errors?.[0]?.message || 'Erro ao criar usuário.';
    } finally {
      saving = false;
    }
  }
</script>

<AppLayout title="Usuários da Instituição" active="a-institutions" {onNavigate}>
  <div class="mb-2">
    <button
      class="text-[13px] text-slate-400 hover:text-slate-700 flex items-center gap-1.5 transition-colors"
      on:click={() => onNavigate('a-institutions')}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      Instituições
    </button>
  </div>

  <PageHeader
    title={institutionName || 'Usuários'}
    subtitle="Coordenadores e professores vinculados à instituição."
    actions={[{ label: '+ Adicionar Usuário', variant: 'primary', onClick: openNew }]}
  />

  {#if !institutionId}
    <!-- Estado vazio: nenhuma instituição selecionada -->
    <div class="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
      <div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background:#F1F5F9;">
        <Icon name="school" size={28} color="#CBD5E1" />
      </div>
      <div class="text-center">
        <p class="text-[15px] font-semibold text-slate-600">Nenhuma instituição selecionada</p>
        <p class="text-[13px] mt-1">Acesse esta página pela lista de instituições.</p>
      </div>
      <button
        class="px-5 py-2.5 rounded-12 text-[14px] font-bold text-white"
        style="background:#004E98;"
        on:click={() => onNavigate('a-institutions')}
      >
        Ir para Instituições
      </button>
    </div>
  {:else if loading}
    <div class="flex items-center justify-center h-40">
      <span class="w-7 h-7 border-2 border-slate-200 border-t-pe-primary rounded-full animate-spin"></span>
    </div>
  {:else if users.length === 0}
    <div class="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
      <p class="text-[14px] font-semibold">Nenhum usuário vinculado.</p>
      <button class="text-[13px] font-bold text-pe-primary hover:underline" on:click={openNew}>
        + Adicionar primeiro usuário
      </button>
    </div>
  {:else}
    <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-slate-100" style="background:#F8FAFC;">
            <th class="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Usuário</th>
            <th class="px-5 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Função</th>
          </tr>
        </thead>
        <tbody>
          {#each users as u}
            <tr class="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                    style="background:{roleColor[u.role] ?? '#94A3B8'};">
                    {u.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <p class="text-[14px] font-semibold text-slate-800">{u.name}</p>
                    <p class="text-[12px] text-slate-400">{u.email}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <span class="px-2.5 py-1 rounded-8 text-[11px] font-bold"
                  style="background:{roleBg[u.role] ?? 'rgba(100,116,139,0.08)'}; color:{roleColor[u.role] ?? '#64748B'};">
                  {roleLabel[u.role] ?? u.role}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</AppLayout>

<!-- Slide-over panel -->
{#if panelOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" on:click={() => panelOpen = false} />
  <div class="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
    <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
      <h2 class="text-[17px] font-bold text-slate-900">Adicionar Usuário</h2>
      <button class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-500" on:click={() => panelOpen = false}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-6 space-y-5">

      <!-- Instituição -->
      <div>
        <label for="inst-search" class="text-[13px] font-bold text-slate-700 block mb-2">Instituição *</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon name="school" size={16} />
          </div>
          <input
            id="inst-search"
            type="text"
            bind:value={instQuery}
            on:input={handleInstInput}
            on:blur={handleInstBlur}
            placeholder="Buscar instituição..."
            autocomplete="off"
            disabled={!!institutionId}
            class="w-full pl-10 pr-9 py-3 bg-slate-50 border rounded-14 text-[14px] focus:bg-white outline-none transition-all placeholder:text-slate-400
              {institutionId ? 'opacity-70 cursor-not-allowed' : ''}
              {instSelected ? 'border-green-400' : 'border-slate-200 focus:border-pe-primary focus:ring-4 focus:ring-pe-primary/5'}"
          />
          <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            {#if instSearching}
              <span class="w-3.5 h-3.5 border-2 border-slate-300 border-t-pe-primary rounded-full animate-spin"></span>
            {:else if instSelected}
              <Icon name="check" size={16} color="#22C55E" />
            {/if}
          </div>

          {#if showInstDropdown}
            <div class="absolute top-full left-0 right-0 mt-1 bg-white rounded-14 border border-slate-200 shadow-lg z-10 overflow-hidden">
              {#each instResults as inst}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                  class="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
                  on:mousedown={() => selectInst(inst)}
                >
                  <p class="text-[13px] font-semibold text-slate-800 truncate">{inst.name}</p>
                  {#if inst.city || inst.state}
                    <p class="text-[11px] text-slate-400 flex-shrink-0">{[inst.city, inst.state].filter(Boolean).join(' · ')}</p>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
        {#if !institutionId && instQuery.length >= 2 && !instSearching && instResults.length === 0 && !instSelected}
          <p class="mt-1 text-[12px] text-slate-400">Nenhuma instituição encontrada.</p>
        {/if}
      </div>

      <!-- Função -->
      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">Função *</label>
        <div class="grid grid-cols-2 gap-3">
          {#each ['coordinator', 'teacher'] as r}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              class="flex items-center justify-center gap-2 py-3 rounded-14 border cursor-pointer font-semibold text-[13px] transition-all"
              style={form.role === r
                ? 'background:#004E98;color:#fff;border-color:#004E98;'
                : 'background:#F8FAFC;color:#64748B;border-color:#E4E4E7;'}
              on:click={() => form.role = r}
            >
              {roleLabel[r]}
            </div>
          {/each}
        </div>
      </div>

      <!-- Nome -->
      <div>
        <label for="iu-name" class="text-[13px] font-bold text-slate-700 block mb-2">Nome *</label>
        <input id="iu-name" type="text" bind:value={form.name} placeholder="Nome completo"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-14 text-[14px] focus:bg-white focus:border-pe-primary focus:ring-4 focus:ring-pe-primary/5 outline-none transition-all" />
      </div>

      <!-- E-mail -->
      <div>
        <label for="iu-email" class="text-[13px] font-bold text-slate-700 block mb-2">E-mail *</label>
        <input id="iu-email" type="email" bind:value={form.email} placeholder="email@exemplo.com"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-14 text-[14px] focus:bg-white focus:border-pe-primary focus:ring-4 focus:ring-pe-primary/5 outline-none transition-all" />
      </div>

      <!-- Senha -->
      <div>
        <label for="iu-pass" class="text-[13px] font-bold text-slate-700 block mb-2">Senha provisória *</label>
        <input id="iu-pass" type="password" bind:value={form.password} placeholder="Mínimo 8 caracteres"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-14 text-[14px] focus:bg-white focus:border-pe-primary focus:ring-4 focus:ring-pe-primary/5 outline-none transition-all" />
      </div>

      {#if formError}
        <p class="text-[13px] font-medium text-red-600">{formError}</p>
      {/if}
    </div>

    <div class="p-6 border-t border-slate-100 flex gap-3">
      <button
        class="flex-1 py-3 rounded-14 text-[14px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        on:click={() => panelOpen = false}
      >
        Cancelar
      </button>
      <button
        class="flex-1 py-3 rounded-14 text-[14px] font-bold text-white transition-opacity disabled:opacity-60"
        style="background:#004E98;"
        disabled={saving}
        on:click={save}
      >
        {saving ? 'Criando...' : 'Criar'}
      </button>
    </div>
  </div>
{/if}
