<script>
  import { onMount } from 'svelte';
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import Icon       from '../../components/ui/Icon.svelte';
  import { api }   from '../../lib/api.js';

  export let onNavigate = (id) => {};

  // ── State ──────────────────────────────────────────────
  let institutions = [];
  let loading = true;
  let searchQuery = '';
  let filterType  = '';

  // Slide-over form
  let panelOpen    = false;
  let editTarget   = null; // null = novo
  let saving       = false;
  let deleteTarget = null;
  let deleting     = false;
  let formError    = '';
  let openMenuId   = null;

  let form = { name: '', type: 'school', state: '', city: '', is_active: true };

  const typeLabel = { school: 'Escola', university: 'Faculdade/Universidade' };
  const typeColor = { school: '#004E98', university: '#FF6700' };
  const typeBg    = { school: 'rgba(0,78,152,0.08)', university: 'rgba(255,103,0,0.08)' };

  // ── Fetch ───────────────────────────────────────────────
  async function load() {
    loading = true;
    try {
      institutions = await api.institutions.search(searchQuery, filterType);
    } finally {
      loading = false;
    }
  }

  onMount(load);

  let searchTimer;
  function onSearchInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(load, 280);
  }

  // ── Panel helpers ────────────────────────────────────────
  function openNew() {
    editTarget = null;
    form = { name: '', type: 'school', state: '', city: '', is_active: true };
    formError = '';
    panelOpen = true;
  }

  function openEdit(inst) {
    editTarget = inst;
    form = { name: inst.name, type: inst.type, state: inst.state, city: inst.city, is_active: inst.is_active };
    formError = '';
    panelOpen = true;
  }

  function closePanel() { panelOpen = false; editTarget = null; }

  // ── Save ─────────────────────────────────────────────────
  async function save() {
    formError = '';
    if (!form.name.trim() || form.name.length < 3) { formError = 'Nome deve ter ao menos 3 caracteres.'; return; }
    if (!form.type) { formError = 'Selecione o tipo da instituição.'; return; }

    saving = true;
    try {
      if (editTarget) {
        await api.institutions.update(editTarget.id, form);
      } else {
        await api.institutions.create(form);
      }
      closePanel();
      await load();
    } catch (err) {
      const msg = err?.errors?.[0]?.message;
      formError = msg || 'Erro ao salvar. Tente novamente.';
    } finally {
      saving = false;
    }
  }

  // ── Delete ────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteTarget) return;
    deleting = true;
    try {
      await api.institutions.remove(deleteTarget.id);
      deleteTarget = null;
      await load();
    } catch (_) {
      deleteTarget = null;
    } finally {
      deleting = false;
    }
  }
</script>

<AppLayout
  title="Instituições"
  breadcrumbs={[{ label: 'Admin' }, { label: 'Instituições' }]}
  active="a-institutions"
  {onNavigate}
>
  <PageHeader
    title="Instituições de Ensino"
    subtitle="Gerencie escolas e universidades cadastradas na plataforma"
    actions={[{ label: '+ Nova Instituição', variant: 'primary', onClick: openNew }]}
  />

  <!-- Filtros -->
  <div class="flex gap-3 mb-5">
    <!-- Busca -->
    <div class="relative flex-1 max-w-sm">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Icon name="search" size={16} />
      </div>
      <input
        type="text"
        bind:value={searchQuery}
        on:input={onSearchInput}
        placeholder="Buscar por nome..."
        class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-12 text-[14px] focus:border-pe-primary focus:ring-2 focus:ring-pe-primary/10 outline-none transition-all"
      />
    </div>

    <!-- Filtro tipo -->
    <select
      bind:value={filterType}
      on:change={load}
      class="px-3 py-2.5 bg-white border border-slate-200 rounded-12 text-[14px] focus:border-pe-primary outline-none transition-all text-slate-700 cursor-pointer"
    >
      <option value="">Todos os tipos</option>
      <option value="school">Escolas</option>
      <option value="university">Universidades</option>
    </select>
  </div>

  <!-- Tabela -->
  <div class="bg-white rounded-14 overflow-hidden" style="border:1px solid #E4E4E7;">
    <div class="flex items-center justify-between px-5 py-3.5" style="border-bottom:1px solid #E4E4E7;">
      <p class="text-[13px] font-semibold text-slate-500">
        {#if loading}Carregando...{:else}{institutions.length} instituição{institutions.length !== 1 ? 'ões' : ''} encontrada{institutions.length !== 1 ? 's' : ''}{/if}
      </p>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-16">
        <span class="w-6 h-6 border-2 border-slate-200 border-t-pe-primary rounded-full animate-spin"></span>
      </div>
    {:else if institutions.length === 0}
      <div class="flex flex-col items-center justify-center py-16 text-slate-400">
        <Icon name="school" size={40} color="#CBD5E1" />
        <p class="mt-3 text-[14px] font-medium">Nenhuma instituição encontrada.</p>
        <button type="button" class="mt-3 text-[13px] font-bold text-pe-primary hover:underline" on:click={openNew}>
          + Criar primeira instituição
        </button>
      </div>
    {:else}
      <table class="w-full">
        <thead>
          <tr style="background:#F8FAFC;">
            <th class="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Nome</th>
            <th class="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Tipo</th>
            <th class="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Cidade / UF</th>
            <th class="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Status</th>
            <th class="px-4 py-3 w-12"></th>
          </tr>
        </thead>
        <tbody>
          {#each institutions as inst}
            <tr class="hover:bg-slate-50 transition-colors" style="border-top:1px solid #F1F5F9;">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-10 flex items-center justify-center flex-shrink-0" style="background:{typeBg[inst.type]};">
                    <Icon name="school" size={16} color={typeColor[inst.type]} />
                  </div>
                  <p class="text-[14px] font-semibold text-slate-800">{inst.name}</p>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <span
                  class="text-[11px] font-bold uppercase px-2.5 py-1 rounded-8"
                  style="background:{typeBg[inst.type]}; color:{typeColor[inst.type]};"
                >{typeLabel[inst.type]}</span>
              </td>
              <td class="px-4 py-3.5">
                <p class="text-[13px] text-slate-500">{[inst.city, inst.state].filter(Boolean).join(' · ') || '—'}</p>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-1.5">
                  <div class="w-1.5 h-1.5 rounded-full" style="background:{inst.is_active ? '#4CD964' : '#E4E4E7'};"></div>
                  <span class="text-[12px] font-medium" style="color:{inst.is_active ? '#4CD964' : '#94A3B8'};">
                    {inst.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3.5">
                <div class="relative flex justify-end">
                  <!-- svelte-ignore a11y-click-events-have-key-events -->
                  <!-- svelte-ignore a11y-no-static-element-interactions -->
                  <button
                    type="button"
                    class="p-1.5 rounded-8 hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                    on:click|stopPropagation={() => openMenuId = openMenuId === inst.id ? null : inst.id}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                  </button>

                  {#if openMenuId === inst.id}
                    <div class="absolute right-0 top-8 w-48 bg-white rounded-12 shadow-xl z-50 py-1.5 overflow-hidden" style="border:1px solid #E4E4E7;">
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <!-- svelte-ignore a11y-no-static-element-interactions -->
                      <div
                        class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                        on:click={() => { openMenuId = null; openEdit(inst); }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Editar
                      </div>
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <!-- svelte-ignore a11y-no-static-element-interactions -->
                      <div
                        class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                        on:click={() => { openMenuId = null; onNavigate('a-inst-users', { institutionId: inst.id, institutionName: inst.name }); }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        Usuários
                      </div>
                      <div class="my-1" style="border-top:1px solid #F1F5F9;"></div>
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <!-- svelte-ignore a11y-no-static-element-interactions -->
                      <div
                        class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                        on:click={() => { openMenuId = null; deleteTarget = inst; }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        Excluir
                      </div>
                    </div>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</AppLayout>

{#if openMenuId !== null}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 z-40" on:click={() => openMenuId = null} />
{/if}

<!-- ── Slide-over panel ── -->
{#if panelOpen}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="fixed inset-0 bg-black/30 z-40 transition-opacity"
    on:click={closePanel}
  ></div>

  <!-- Panel -->
  <div class="fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col" style="border-left:1px solid #E4E4E7;">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid #E4E4E7;">
      <h2 class="text-[17px] font-black text-slate-900 tracking-tight">
        {editTarget ? 'Editar Instituição' : 'Nova Instituição'}
      </h2>
      <button type="button" class="p-2 rounded-10 hover:bg-slate-100 transition-colors text-slate-400" on:click={closePanel}>
        <Icon name="close" size={18} />
      </button>
    </div>

    <!-- Form -->
    <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
      <!-- Nome -->
      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">Nome da Instituição *</label>
        <input
          type="text"
          bind:value={form.name}
          placeholder="Ex: Escola Estadual Prof. João Lima"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-12 text-[14px] focus:bg-white focus:border-pe-primary focus:ring-2 focus:ring-pe-primary/10 outline-none transition-all"
        />
      </div>

      <!-- Tipo -->
      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">Tipo *</label>
        <div class="grid grid-cols-2 gap-3">
          {#each [['school', 'Escola'], ['university', 'Faculdade / Universidade']] as [val, label]}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              class="flex items-center gap-3 p-3 rounded-12 border-2 cursor-pointer transition-all"
              style="border-color:{form.type === val ? typeColor[val] : '#E4E4E7'}; background:{form.type === val ? typeBg[val] : '#FAFAFA'};"
              on:click={() => form.type = val}
            >
              <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                style="border-color:{form.type === val ? typeColor[val] : '#CBD5E1'}; background:{form.type === val ? typeColor[val] : 'transparent'};">
                {#if form.type === val}
                  <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                {/if}
              </div>
              <span class="text-[13px] font-semibold" style="color:{form.type === val ? typeColor[val] : '#64748B'};">{label}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- Cidade e Estado lado a lado -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-[13px] font-bold text-slate-700 block mb-2">Cidade</label>
          <input
            type="text"
            bind:value={form.city}
            placeholder="Ex: São Paulo"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-12 text-[14px] focus:bg-white focus:border-pe-primary focus:ring-2 focus:ring-pe-primary/10 outline-none transition-all"
          />
        </div>
        <div>
          <label class="text-[13px] font-bold text-slate-700 block mb-2">Estado (UF)</label>
          <input
            type="text"
            bind:value={form.state}
            placeholder="Ex: SP"
            maxlength="2"
            class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-12 text-[14px] focus:bg-white focus:border-pe-primary focus:ring-2 focus:ring-pe-primary/10 outline-none transition-all uppercase"
          />
        </div>
      </div>

      <!-- Status (só em edição) -->
      {#if editTarget}
        <div class="flex items-center justify-between p-4 rounded-12 bg-slate-50 border border-slate-200">
          <div>
            <p class="text-[14px] font-semibold text-slate-700">Instituição ativa</p>
            <p class="text-[12px] text-slate-400">Inativas não aparecem nas buscas dos alunos</p>
          </div>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="w-12 h-6 rounded-full transition-all cursor-pointer relative flex-shrink-0"
            style="background:{form.is_active ? '#4CD964' : '#E4E4E7'};"
            on:click={() => form.is_active = !form.is_active}
          >
            <div
              class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style="left:{form.is_active ? '26px' : '2px'};"
            ></div>
          </div>
        </div>
      {/if}

      {#if formError}
        <p class="text-[13px] font-medium text-red-600">{formError}</p>
      {/if}
    </div>

    <!-- Footer -->
    <div class="px-6 py-4 flex gap-3" style="border-top:1px solid #E4E4E7;">
      <button
        type="button"
        class="flex-1 py-3 border border-slate-200 rounded-12 text-[14px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
        on:click={closePanel}
      >
        Cancelar
      </button>
      <button
        type="button"
        disabled={saving}
        class="flex-1 py-3 text-white rounded-12 text-[14px] font-bold transition-all disabled:opacity-60"
        style="background:#004E98;"
        on:click={save}
      >
        {#if saving}
          <span class="flex items-center justify-center gap-2">
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
            Salvando...
          </span>
        {:else}
          {editTarget ? 'Salvar alterações' : 'Criar instituição'}
        {/if}
      </button>
    </div>
  </div>
{/if}

<!-- ── Modal de confirmação de exclusão ── -->
{#if deleteTarget}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" on:click={() => deleteTarget = null}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="bg-white rounded-20 p-6 w-[360px] shadow-2xl" on:click|stopPropagation>
      <div class="w-12 h-12 rounded-14 flex items-center justify-center mb-4" style="background:rgba(255,45,95,0.08);">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF2D5F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
        </svg>
      </div>
      <h3 class="text-[17px] font-black text-slate-900 mb-2">Excluir instituição?</h3>
      <p class="text-[14px] text-slate-500 leading-relaxed mb-6">
        <strong class="text-slate-700">{deleteTarget.name}</strong> será removida permanentemente. Alunos matriculados não serão afetados imediatamente.
      </p>
      <div class="flex gap-3">
        <button
          type="button"
          class="flex-1 py-3 border border-slate-200 rounded-12 text-[14px] font-bold text-slate-600 hover:bg-slate-50 transition-all"
          on:click={() => deleteTarget = null}
        >Cancelar</button>
        <button
          type="button"
          disabled={deleting}
          class="flex-1 py-3 text-white rounded-12 text-[14px] font-bold transition-all disabled:opacity-60"
          style="background:#FF2D5F;"
          on:click={confirmDelete}
        >
          {deleting ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>
    </div>
  </div>
{/if}
