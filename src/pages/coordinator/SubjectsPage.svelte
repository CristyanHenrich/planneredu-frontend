<script>
  import { onMount } from 'svelte';
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import { api }   from '../../lib/api.js';

  export let onNavigate = (id) => {};

  let subjects      = [];
  let teachers      = [];
  let institutionId = null;
  let loading       = true;
  let saving        = false;
  let formError     = '';

  // assign slide-over
  let panelOpen          = false;
  let editSubject        = null;
  let selectedTeacherIds = [];

  // create slide-over
  let createOpen         = false;
  let createName         = '';
  let createColor        = '#004E98';
  let createAbsenceLimit = 0;
  let createTeacherIds   = [];
  let createError        = '';
  let creating           = false;

  const PRESET_COLORS = [
    '#004E98','#FF6700','#FF2D5F','#4CD964','#FFB42E',
    '#7C3AED','#0EA5E9','#EC4899','#14B8A6','#64748B',
  ];

  onMount(async () => {
    try {
      const [subjectsData, enrollments] = await Promise.all([
        api.subjects.list(),
        api.enrollments.list(),
      ]);
      subjects = subjectsData ?? [];

      if (enrollments?.length > 0) {
        institutionId = enrollments[0].institution_id;
        const users = await api.institutions.listUsers(institutionId);
        teachers = (users ?? []).filter(u => u.role === 'teacher');
      }
    } catch (_) {}
    loading = false;
  });

  function openCreate() {
    createName         = '';
    createColor        = '#004E98';
    createAbsenceLimit = 0;
    createTeacherIds   = [];
    createError        = '';
    createOpen         = true;
  }

  async function submitCreate() {
    if (!createName.trim()) { createError = 'O nome é obrigatório.'; return; }
    creating    = true;
    createError = '';
    try {
      const body = {
        name:           createName.trim(),
        color:          createColor,
        absence_limit:  Number(createAbsenceLimit) || 0,
        institution_id: institutionId ?? 0,
        teacher_ids:    createTeacherIds,
      };
      const created = await api.subjects.create(body);
      subjects  = [...subjects, created];
      createOpen = false;
    } catch (err) {
      createError = err?.errors?.[0]?.message || 'Erro ao criar disciplina.';
    } finally {
      creating = false;
    }
  }

  function openAssign(subject) {
    editSubject        = subject;
    selectedTeacherIds = (subject.teachers ?? []).map(t => t.id);
    formError          = '';
    panelOpen          = true;
  }

  async function saveAssign() {
    if (!editSubject) return;
    saving    = true;
    formError = '';
    try {
      const updated = await api.subjects.update(editSubject.id, { teacher_ids: selectedTeacherIds });
      subjects  = subjects.map(s => s.id === editSubject.id ? updated : s);
      panelOpen = false;
    } catch (err) {
      formError = err?.errors?.[0]?.message || 'Erro ao salvar. Tente novamente.';
    } finally {
      saving = false;
    }
  }

  async function removeTeacher(subject, teacherId) {
    try {
      const newTeacherIds = (subject.teachers ?? []).map(t => t.id).filter(id => id !== teacherId);
      const updated = await api.subjects.update(subject.id, { teacher_ids: newTeacherIds });
      subjects = subjects.map(s => s.id === subject.id ? updated : s);
    } catch (_) {}
  }
</script>

<AppLayout title="Disciplinas" active="c-subjects" {onNavigate}>
  <PageHeader
    title="Disciplinas"
    subtitle="Crie disciplinas e atribua professores responsáveis."
  >
    <svelte:fragment slot="actions">
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-10 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
        style="background:#004E98;"
        on:click={openCreate}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nova disciplina
      </button>
    </svelte:fragment>
  </PageHeader>

  {#if loading}
    <div class="flex items-center justify-center h-40">
      <span class="w-7 h-7 border-2 border-slate-200 border-t-pe-primary rounded-full animate-spin"></span>
    </div>

  {:else if subjects.length === 0}
    <div class="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      <p class="text-[14px] font-semibold">Nenhuma disciplina cadastrada.</p>
    </div>

  {:else}
    <div class="bg-white rounded-2xl overflow-hidden" style="border:1px solid #E4E4E7;">
      <!-- Table header -->
      <div class="flex items-center px-5 py-3.5" style="background:#F8FAFC; border-bottom:1px solid #E4E4E7;">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-1">Disciplina</span>
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider w-72">Professores responsáveis</span>
        <span class="w-36"></span>
      </div>

      {#each subjects as subject}
        <div
          class="flex items-center px-5 py-3.5 hover:bg-slate-50 transition-colors"
          style="border-bottom:1px solid #F1F5F9;"
        >
          <!-- Subject name + color dot -->
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="w-3 h-3 rounded-full flex-shrink-0" style="background:{subject.color || '#004E98'};"></div>
            <p class="text-[14px] font-semibold text-slate-800 truncate">{subject.name}</p>
          </div>

          <!-- Teacher -->
          <div class="w-72">
            {#if subject.teachers && subject.teachers.length > 0}
              <div class="flex flex-wrap gap-1.5">
                {#each subject.teachers as teacher}
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-slate-100 text-slate-700">
                    <span class="truncate max-w-[120px]">{teacher.name}</span>
                    <button
                      class="text-slate-400 hover:text-red-500 font-bold ml-0.5"
                      on:click={() => removeTeacher(subject, teacher.id)}
                    >
                      ×
                    </button>
                  </div>
                {/each}
              </div>
            {:else}
              <span class="text-[13px] text-slate-400 italic">Sem professor</span>
            {/if}
          </div>

          <!-- Actions -->
          <div class="w-36 flex items-center justify-end gap-2">
            <button
              class="px-3 py-1.5 text-[12px] font-bold text-white rounded-8 transition-opacity hover:opacity-90"
              style="background:#7C3AED;"
              on:click={() => openAssign(subject)}
            >
              {subject.teachers && subject.teachers.length > 0 ? 'Gerenciar' : 'Atribuir'}
            </button>
          </div>
        </div>
      {/each}
    </div>

    <!-- Summary -->
    <p class="mt-3 text-[12px] text-slate-400 text-right">
      {subjects.filter(s => s.teachers && s.teachers.length > 0).length} de {subjects.length} disciplinas com professor atribuído
    </p>
  {/if}
</AppLayout>

<!-- ── Slide-over: create subject ──────────────────────────────── -->
{#if createOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" on:click={() => createOpen = false} />

  <div class="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid #E4E4E7;">
      <div>
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nova Disciplina</p>
        <h2 class="text-[17px] font-black text-slate-900 tracking-tight">Criar disciplina</h2>
      </div>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 cursor-pointer transition-colors"
        on:click={() => createOpen = false}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">

      <!-- Name -->
      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">Nome da disciplina *</label>
        <input
          bind:value={createName}
          type="text"
          placeholder="Ex: Matemática, Física, História..."
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-14 text-[14px] focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-700"
          on:input={() => createError = ''}
        />
      </div>

      <!-- Color -->
      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-3">Cor</label>
        <div class="flex flex-wrap gap-2.5">
          {#each PRESET_COLORS as color}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              class="w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110"
              style="background:{color}; {createColor === color ? 'outline:3px solid '+color+'; outline-offset:2px;' : ''}"
              on:click={() => createColor = color}
            />
          {/each}
        </div>
      </div>

      <!-- Absence limit -->
      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">Limite de faltas</label>
        <input
          bind:value={createAbsenceLimit}
          type="number"
          min="0"
          placeholder="0"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-14 text-[14px] focus:bg-white focus:border-blue-500 outline-none transition-all text-slate-700"
        />
        <p class="text-[12px] text-slate-400 mt-1.5">Deixe 0 para sem limite.</p>
      </div>

      <!-- Teachers -->
      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">Professores (opcional)</label>
        {#if teachers.length === 0}
          <p class="text-[13px] text-slate-400 italic">Nenhum professor disponível.</p>
        {:else}
          <div class="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-14">
            {#each teachers as teacher}
              <label class="flex items-center gap-2.5 px-2 py-1.5 hover:bg-slate-100 rounded-8 cursor-pointer transition-colors text-[13px] font-medium text-slate-700">
                <input
                  type="checkbox"
                  value={teacher.id}
                  checked={createTeacherIds.includes(teacher.id)}
                  on:change={(e) => {
                    if (e.target.checked) {
                      createTeacherIds = [...createTeacherIds, teacher.id];
                    } else {
                      createTeacherIds = createTeacherIds.filter(id => id !== teacher.id);
                    }
                  }}
                  class="rounded border-slate-300 text-pe-primary focus:ring-pe-primary"
                />
                <span class="truncate">{teacher.name}</span>
              </label>
            {/each}
          </div>
        {/if}
      </div>

      {#if createError}
        <p class="text-[13px] font-medium text-red-600">{createError}</p>
      {/if}
    </div>

    <!-- Footer -->
    <div class="p-6 flex gap-3" style="border-top:1px solid #E4E4E7;">
      <button
        class="flex-1 py-3 rounded-14 text-[14px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        on:click={() => createOpen = false}
      >Cancelar</button>
      <button
        class="flex-1 py-3 rounded-14 text-[14px] font-bold text-white transition-opacity disabled:opacity-60"
        style="background:#004E98;"
        disabled={creating}
        on:click={submitCreate}
      >
        {creating ? 'Criando...' : 'Criar disciplina'}
      </button>
    </div>
  </div>
{/if}

<!-- ── Slide-over: assign teacher ──────────────────────────────── -->
{#if panelOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" on:click={() => panelOpen = false} />

  <div class="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid #E4E4E7;">
      <div>
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Atribuir Professor</p>
        <h2 class="text-[17px] font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span class="w-3 h-3 rounded-full flex-shrink-0" style="background:{editSubject?.color || '#004E98'};"></span>
          {editSubject?.name}
        </h2>
      </div>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 cursor-pointer transition-colors"
        on:click={() => panelOpen = false}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">

      <!-- Teacher select -->
      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">
          Selecionar professores
        </label>

        {#if teachers.length === 0}
          <div class="p-4 rounded-14 bg-amber-50 border border-amber-200">
            <p class="text-[13px] text-amber-700 font-medium">
              Nenhum professor cadastrado. Cadastre professores na seção "Professores" antes de atribuí-los.
            </p>
          </div>
        {:else}
          <div class="space-y-2 max-h-60 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-14">
            {#each teachers as teacher}
              <label class="flex items-center gap-2.5 px-2 py-1.5 hover:bg-slate-100 rounded-8 cursor-pointer transition-colors text-[13px] font-medium text-slate-700">
                <input
                  type="checkbox"
                  value={teacher.id}
                  checked={selectedTeacherIds.includes(teacher.id)}
                  on:change={(e) => {
                    if (e.target.checked) {
                      selectedTeacherIds = [...selectedTeacherIds, teacher.id];
                    } else {
                      selectedTeacherIds = selectedTeacherIds.filter(id => id !== teacher.id);
                    }
                  }}
                  class="rounded border-slate-300 text-pe-primary focus:ring-pe-primary"
                />
                <span class="truncate">{teacher.name}</span>
              </label>
            {/each}
          </div>
        {/if}
      </div>

      {#if formError}
        <p class="text-[13px] font-medium text-red-600">{formError}</p>
      {/if}
    </div>

    <!-- Footer -->
    <div class="p-6 flex gap-3" style="border-top:1px solid #E4E4E7;">
      <button
        class="flex-1 py-3 rounded-14 text-[14px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        on:click={() => panelOpen = false}
      >Cancelar</button>
      <button
        class="flex-1 py-3 rounded-14 text-[14px] font-bold text-white transition-opacity disabled:opacity-60"
        style="background:#7C3AED;"
        disabled={saving || teachers.length === 0}
        on:click={saveAssign}
      >
        {saving ? 'Salvando...' : 'Confirmar'}
      </button>
    </div>
  </div>
{/if}
