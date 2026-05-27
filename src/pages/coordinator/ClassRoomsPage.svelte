<script>
  import { onMount } from 'svelte';
  import AppLayout from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import { api } from '../../lib/api.js';

  export let onNavigate = (id) => {};

  let classrooms = [];
  let loading = true;
  let saving = false;
  let deleting = false;
  let panelOpen = false;
  let editTarget = null;
  let deleteTarget = null;
  let formError = '';
  let openMenuId = null;

  let institutionId = null;

  const gradeLevels = [
    '6º Ano - Fundamental', '7º Ano - Fundamental', '8º Ano - Fundamental', '9º Ano - Fundamental',
    '1º Ano - Médio', '2º Ano - Médio', '3º Ano - Médio',
    '1º Semestre', '2º Semestre', '3º Semestre', '4º Semestre',
    '5º Semestre', '6º Semestre', '7º Semestre', '8º Semestre',
  ];

  let form = { name: '', grade_level: '', year: new Date().getFullYear() };

  // Disciplines (Subjects) inside Classroom state
  let activeClassRoom = null;
  let subjects = [];
  let teachers = [];
  let loadingSubjects = false;
  let subjectPanelOpen = false;
  let editSubjectTarget = null;
  let deleteSubjectTarget = null;
  let subjectFormError = '';
  let subjectSaving = false;
  let subjectDeleting = false;
  let subjectOpenMenuId = null;

  let PRESET_COLORS = [
    '#004E98','#FF6700','#FF2D5F','#4CD964','#FFB42E',
    '#7C3AED','#0EA5E9','#EC4899','#14B8A6','#64748B',
  ];

  let subjectForm = {
    name: '',
    color: '#004E98',
    absence_limit: 0,
    teacher_ids: []
  };

  onMount(async () => {
    try {
      const enrollments = await api.enrollments.list();
      if (enrollments?.length > 0) {
        institutionId = enrollments[0].institution_id;
        const [rooms, users] = await Promise.all([
          api.classrooms.list(institutionId),
          api.institutions.listUsers(institutionId)
        ]);
        classrooms = rooms ?? [];
        teachers = (users ?? []).filter(u => u.role === 'teacher');
      }
    } catch (_) {}
    loading = false;
  });

  function openNew() {
    editTarget = null;
    form = { name: '', grade_level: '', year: new Date().getFullYear() };
    formError = '';
    panelOpen = true;
  }

  function openEdit(room) {
    editTarget = room;
    form = { name: room.name, grade_level: room.grade_level || '', year: room.year || new Date().getFullYear() };
    formError = '';
    panelOpen = true;
  }

  async function save() {
    if (!form.name.trim()) { formError = 'Nome é obrigatório.'; return; }
    if (!institutionId) { formError = 'Nenhuma instituição encontrada.'; return; }
    saving = true;
    formError = '';
    try {
      if (editTarget) {
        const updated = await api.classrooms.update(institutionId, editTarget.id, form);
        classrooms = classrooms.map(r => r.id === editTarget.id ? updated : r);
      } else {
        const created = await api.classrooms.create(institutionId, form);
        classrooms = [created, ...classrooms];
      }
      panelOpen = false;
    } catch (err) {
      formError = err?.errors?.[0]?.message || 'Erro ao salvar.';
    } finally {
      saving = false;
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || !institutionId) return;
    deleting = true;
    try {
      await api.classrooms.remove(institutionId, deleteTarget.id);
      classrooms = classrooms.filter(r => r.id !== deleteTarget.id);
      deleteTarget = null;
    } catch (_) {} finally {
      deleting = false;
    }
  }

  // Manage Subjects
  async function manageSubjects(room) {
    activeClassRoom = room;
    loadingSubjects = true;
    try {
      subjects = await api.subjects.list({ class_room_id: room.id });
    } catch (_) {
      subjects = [];
    } finally {
      loadingSubjects = false;
    }
  }

  function openNewSubject() {
    editSubjectTarget = null;
    subjectForm = { name: '', color: '#004E98', absence_limit: 0, teacher_ids: [] };
    subjectFormError = '';
    subjectPanelOpen = true;
  }

  function openEditSubject(subject) {
    editSubjectTarget = subject;
    subjectForm = {
      name: subject.name,
      color: subject.color || '#004E98',
      absence_limit: subject.absence_limit || 0,
      teacher_ids: (subject.teachers ?? []).map(t => t.id)
    };
    subjectFormError = '';
    subjectPanelOpen = true;
  }

  async function saveSubject() {
    if (!subjectForm.name.trim()) { subjectFormError = 'Nome é obrigatório.'; return; }
    subjectSaving = true;
    subjectFormError = '';
    try {
      const payload = {
        name: subjectForm.name.trim(),
        color: subjectForm.color,
        absence_limit: Number(subjectForm.absence_limit) || 0,
        institution_id: institutionId,
        class_room_id: activeClassRoom.id,
        teacher_ids: subjectForm.teacher_ids
      };

      if (editSubjectTarget) {
        const updated = await api.subjects.update(editSubjectTarget.id, payload);
        subjects = subjects.map(s => s.id === editSubjectTarget.id ? updated : s);
      } else {
        const created = await api.subjects.create(payload);
        subjects = [...subjects, created];
      }
      subjectPanelOpen = false;
    } catch (err) {
      subjectFormError = err?.errors?.[0]?.message || 'Erro ao salvar disciplina.';
    } finally {
      subjectSaving = false;
    }
  }

  async function confirmDeleteSubject() {
    if (!deleteSubjectTarget) return;
    subjectDeleting = true;
    try {
      await api.subjects.delete(deleteSubjectTarget.id);
      subjects = subjects.filter(s => s.id !== deleteSubjectTarget.id);
      deleteSubjectTarget = null;
    } catch (_) {} finally {
      subjectDeleting = false;
    }
  }
</script>

<AppLayout title="Turmas" active="c-classrooms" {onNavigate}>
  {#if activeClassRoom}
    <PageHeader
      title={`Disciplinas de ${activeClassRoom.name}`}
      subtitle="Gerencie as disciplinas e professores desta turma."
      actions={[
        { label: 'Voltar para Turmas', variant: 'secondary', onClick: () => { activeClassRoom = null; } },
        { label: '+ Nova Disciplina', variant: 'primary', onClick: openNewSubject }
      ]}
    />

    <div class="bg-white rounded-14 overflow-hidden" style="border:1px solid #E4E4E7;">
      <div class="flex items-center justify-between px-5 py-3.5" style="border-bottom:1px solid #E4E4E7;">
        <p class="text-[13px] font-semibold text-slate-500">
          {#if loadingSubjects}Carregando...{:else}{subjects.length} disciplina{subjects.length !== 1 ? 's' : ''} encontrada{subjects.length !== 1 ? 's' : ''}{/if}
        </p>
      </div>

      {#if loadingSubjects}
        <div class="flex items-center justify-center py-16">
          <span class="w-6 h-6 border-2 border-slate-200 border-t-pe-primary rounded-full animate-spin"></span>
        </div>
      {:else if subjects.length === 0}
        <div class="flex flex-col items-center justify-center py-16 text-slate-400">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <p class="mt-3 text-[14px] font-medium">Nenhuma disciplina cadastrada ainda.</p>
          <button type="button" class="mt-3 text-[13px] font-bold text-pe-primary hover:underline" on:click={openNewSubject}>
            + Criar primeira disciplina
          </button>
        </div>
      {:else}
        <table class="w-full">
          <thead>
            <tr style="background:#F8FAFC;">
              <th class="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Nome</th>
              <th class="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Professores</th>
              <th class="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Limite de Faltas</th>
              <th class="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {#each subjects as subject}
              <tr class="hover:bg-slate-50 transition-colors" style="border-top:1px solid #F1F5F9;">
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full flex-shrink-0" style="background:{subject.color || '#004E98'};"></div>
                    <p class="text-[14px] font-semibold text-slate-800">{subject.name}</p>
                  </div>
                </td>
                <td class="px-4 py-3.5">
                  {#if subject.teachers && subject.teachers.length > 0}
                    <div class="flex flex-wrap gap-1.5">
                      {#each subject.teachers as teacher}
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-slate-100 text-slate-700">
                          {teacher.name}
                        </span>
                      {/each}
                    </div>
                  {:else}
                    <span class="text-[13px] text-slate-400 italic">Sem professores</span>
                  {/if}
                </td>
                <td class="px-4 py-3.5">
                  <p class="text-[13px] text-slate-500">{subject.absence_limit > 0 ? `${subject.absence_limit} faltas` : 'Sem limite'}</p>
                </td>
                <td class="px-4 py-3.5">
                  <div class="relative flex justify-end">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <button
                      class="p-1.5 rounded-8 hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                      on:click|stopPropagation={() => subjectOpenMenuId = subjectOpenMenuId === subject.id ? null : subject.id}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                    </button>

                    {#if subjectOpenMenuId === subject.id}
                      <div class="absolute right-0 top-8 w-48 bg-white rounded-12 shadow-xl z-50 py-1.5 overflow-hidden" style="border:1px solid #E4E4E7;">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div
                          class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                          on:click={() => { subjectOpenMenuId = null; openEditSubject(subject); }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Editar
                        </div>
                        <div class="my-1" style="border-top:1px solid #F1F5F9;"></div>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div
                          class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                          on:click={() => { subjectOpenMenuId = null; deleteSubjectTarget = subject; }}
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
  {:else}
    <PageHeader
      title="Turmas"
      subtitle="Gerencie as turmas da sua instituição."
      actions={[{ label: '+ Nova Turma', variant: 'primary', onClick: openNew }]}
    />

    <div class="bg-white rounded-14 overflow-hidden" style="border:1px solid #E4E4E7;">
      <div class="flex items-center justify-between px-5 py-3.5" style="border-bottom:1px solid #E4E4E7;">
        <p class="text-[13px] font-semibold text-slate-500">
          {#if loading}Carregando...{:else}{classrooms.length} turma{classrooms.length !== 1 ? 's' : ''} encontrada{classrooms.length !== 1 ? 's' : ''}{/if}
        </p>
      </div>

      {#if loading}
        <div class="flex items-center justify-center py-16">
          <span class="w-6 h-6 border-2 border-slate-200 border-t-pe-primary rounded-full animate-spin"></span>
        </div>
      {:else if classrooms.length === 0}
        <div class="flex flex-col items-center justify-center py-16 text-slate-400">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <p class="mt-3 text-[14px] font-medium">Nenhuma turma cadastrada ainda.</p>
          <button type="button" class="mt-3 text-[13px] font-bold text-pe-primary hover:underline" on:click={openNew}>
            + Criar primeira turma
          </button>
        </div>
      {:else}
        <table class="w-full">
          <thead>
            <tr style="background:#F8FAFC;">
              <th class="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Nome</th>
              <th class="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Série / Período</th>
              <th class="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Ano letivo</th>
              <th class="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Status</th>
              <th class="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {#each classrooms as room}
              <tr class="hover:bg-slate-50 transition-colors" style="border-top:1px solid #F1F5F9;">
                <td class="px-5 py-3.5">
                  <p class="text-[14px] font-semibold text-slate-800">{room.name}</p>
                </td>
                <td class="px-4 py-3.5">
                  <p class="text-[13px] text-slate-500">{room.grade_level || '—'}</p>
                </td>
                <td class="px-4 py-3.5">
                  <p class="text-[13px] text-slate-500">{room.year || '—'}</p>
                </td>
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-1.5">
                    <div class="w-1.5 h-1.5 rounded-full" style="background:{room.is_active ? '#4CD964' : '#E4E4E7'};"></div>
                    <span class="text-[12px] font-medium" style="color:{room.is_active ? '#4CD964' : '#94A3B8'};">
                      {room.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3.5">
                  <div class="relative flex justify-end">
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <button
                      class="p-1.5 rounded-8 hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                      on:click|stopPropagation={() => openMenuId = openMenuId === room.id ? null : room.id}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                    </button>

                    {#if openMenuId === room.id}
                      <div class="absolute right-0 top-8 w-48 bg-white rounded-12 shadow-xl z-50 py-1.5 overflow-hidden" style="border:1px solid #E4E4E7;">
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div
                          class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                          on:click={() => { openMenuId = null; openEdit(room); }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Editar
                        </div>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div
                          class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                          on:click={() => { openMenuId = null; onNavigate('c-students', { classRoomId: room.id, classRoomName: room.name }); }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          Alunos da Turma
                        </div>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div
                          class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                          on:click={() => { openMenuId = null; manageSubjects(room); }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                          Disciplinas da Turma
                        </div>
                        <div class="my-1" style="border-top:1px solid #F1F5F9;"></div>
                        <!-- svelte-ignore a11y-click-events-have-key-events -->
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div
                          class="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                          on:click={() => { openMenuId = null; deleteTarget = room; }}
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
  {/if}
</AppLayout>

{#if openMenuId !== null}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 z-40" on:click={() => openMenuId = null} />
{/if}

{#if subjectOpenMenuId !== null}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 z-40" on:click={() => subjectOpenMenuId = null} />
{/if}

<!-- Slide-over panel: ClassRoom -->
{#if panelOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" on:click={() => panelOpen = false} />
  <div class="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
    <div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid #E4E4E7;">
      <h2 class="text-[17px] font-black text-slate-900 tracking-tight">{editTarget ? 'Editar Turma' : 'Nova Turma'}</h2>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-500 cursor-pointer" on:click={() => panelOpen = false}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-6 space-y-5">
      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">Nome da Turma *</label>
        <input type="text" bind:value={form.name} placeholder="Ex: Turma A"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-14 text-[14px] focus:bg-white focus:border-pe-primary focus:ring-4 focus:ring-pe-primary/5 outline-none transition-all" />
      </div>

      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">Série / Período</label>
        <select bind:value={form.grade_level}
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-14 text-[14px] focus:bg-white focus:border-pe-primary outline-none transition-all text-slate-700">
          <option value="">Selecionar...</option>
          {#each gradeLevels as level}
            <option value={level}>{level}</option>
          {/each}
        </select>
      </div>

      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">Ano letivo</label>
        <input type="number" bind:value={form.year} min="2020" max="2035"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-14 text-[14px] focus:bg-white focus:border-pe-primary focus:ring-4 focus:ring-pe-primary/5 outline-none transition-all" />
      </div>

      {#if formError}
        <p class="text-[13px] font-medium text-red-600">{formError}</p>
      {/if}
    </div>

    <div class="p-6 flex gap-3" style="border-top:1px solid #E4E4E7;">
      <button class="flex-1 py-3 rounded-14 text-[14px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors" on:click={() => panelOpen = false}>
        Cancelar
      </button>
      <button
        class="flex-1 py-3 rounded-14 text-[14px] font-bold text-white transition-opacity disabled:opacity-60"
        style="background:#004E98;"
        disabled={saving}
        on:click={save}
      >
        {#if saving}Salvando...{:else}{editTarget ? 'Salvar' : 'Criar Turma'}{/if}
      </button>
    </div>
  </div>
{/if}

<!-- Slide-over panel: Subject -->
{#if subjectPanelOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" on:click={() => subjectPanelOpen = false} />
  <div class="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
    <div class="flex items-center justify-between px-6 py-5" style="border-bottom:1px solid #E4E4E7;">
      <h2 class="text-[17px] font-black text-slate-900 tracking-tight">{editSubjectTarget ? 'Editar Disciplina' : 'Nova Disciplina'}</h2>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-500 cursor-pointer" on:click={() => subjectPanelOpen = false}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-6 space-y-5">
      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">Nome da Disciplina *</label>
        <input type="text" bind:value={subjectForm.name} placeholder="Ex: Matemática"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-14 text-[14px] focus:bg-white focus:border-pe-primary focus:ring-4 focus:ring-pe-primary/5 outline-none transition-all" />
      </div>

      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-3">Cor</label>
        <div class="flex flex-wrap gap-2.5">
          {#each PRESET_COLORS as color}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              class="w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110"
              style="background:{color}; {subjectForm.color === color ? 'outline:3px solid '+color+'; outline-offset:2px;' : ''}"
              on:click={() => subjectForm.color = color}
            />
          {/each}
        </div>
      </div>

      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">Limite de faltas</label>
        <input
          bind:value={subjectForm.absence_limit}
          type="number"
          min="0"
          placeholder="0"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-14 text-[14px] focus:bg-white focus:border-pe-primary focus:ring-4 focus:ring-pe-primary/5 outline-none transition-all"
        />
        <p class="text-[12px] text-slate-400 mt-1.5">Deixe 0 para sem limite.</p>
      </div>

      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">Professores Responsáveis</label>
        {#if teachers.length === 0}
          <p class="text-[13px] text-slate-400 italic">Nenhum professor cadastrado na instituição.</p>
        {:else}
          <div class="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-14">
            {#each teachers as teacher}
              <label class="flex items-center gap-2.5 px-2 py-1.5 hover:bg-slate-100 rounded-8 cursor-pointer transition-colors text-[13px] font-medium text-slate-700">
                <input
                  type="checkbox"
                  value={teacher.id}
                  checked={subjectForm.teacher_ids.includes(teacher.id)}
                  on:change={(e) => {
                    if (e.target.checked) {
                      subjectForm.teacher_ids = [...subjectForm.teacher_ids, teacher.id];
                    } else {
                      subjectForm.teacher_ids = subjectForm.teacher_ids.filter(id => id !== teacher.id);
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

      {#if subjectFormError}
        <p class="text-[13px] font-medium text-red-600">{subjectFormError}</p>
      {/if}
    </div>

    <div class="p-6 flex gap-3" style="border-top:1px solid #E4E4E7;">
      <button class="flex-1 py-3 rounded-14 text-[14px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors" on:click={() => subjectPanelOpen = false}>
        Cancelar
      </button>
      <button
        class="flex-1 py-3 rounded-14 text-[14px] font-bold text-white transition-opacity disabled:opacity-60"
        style="background:#004E98;"
        disabled={subjectSaving}
        on:click={saveSubject}
      >
        {#if subjectSaving}Salvando...{:else}{editSubjectTarget ? 'Salvar' : 'Criar Disciplina'}{/if}
      </button>
    </div>
  </div>
{/if}

<!-- Modal de exclusão: ClassRoom -->
{#if deleteTarget}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm px-4" on:click={() => deleteTarget = null}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="bg-white rounded-20 shadow-2xl w-full max-w-sm p-6" on:click|stopPropagation>
      <div class="w-12 h-12 rounded-14 flex items-center justify-center mb-4" style="background:rgba(255,45,95,0.08);">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF2D5F" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </div>
      <h3 class="text-[17px] font-black text-slate-900 mb-2">Excluir turma?</h3>
      <p class="text-[14px] text-slate-500 mb-6">
        A turma <strong class="text-slate-800">{deleteTarget.name}</strong> será removida permanentemente.
      </p>
      <div class="flex gap-3">
        <button class="flex-1 py-3 rounded-14 text-[14px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50" on:click={() => deleteTarget = null}>
          Cancelar
        </button>
        <button
          class="flex-1 py-3 rounded-14 text-[14px] font-bold text-white transition-colors disabled:opacity-60"
          style="background:#FF2D5F;"
          disabled={deleting}
          on:click={confirmDelete}
        >
          {deleting ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Modal de exclusão: Subject -->
{#if deleteSubjectTarget}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm px-4" on:click={() => deleteSubjectTarget = null}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="bg-white rounded-20 shadow-2xl w-full max-w-sm p-6" on:click|stopPropagation>
      <div class="w-12 h-12 rounded-14 flex items-center justify-center mb-4" style="background:rgba(255,45,95,0.08);">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF2D5F" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </div>
      <h3 class="text-[17px] font-black text-slate-900 mb-2">Excluir disciplina?</h3>
      <p class="text-[14px] text-slate-500 mb-6">
        A disciplina <strong class="text-slate-800">{deleteSubjectTarget.name}</strong> será removida permanentemente.
      </p>
      <div class="flex gap-3">
        <button class="flex-1 py-3 rounded-14 text-[14px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50" on:click={() => deleteSubjectTarget = null}>
          Cancelar
        </button>
        <button
          class="flex-1 py-3 rounded-14 text-[14px] font-bold text-white transition-colors disabled:opacity-60"
          style="background:#FF2D5F;"
          disabled={subjectDeleting}
          on:click={confirmDeleteSubject}
        >
          {subjectDeleting ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>
    </div>
  </div>
{/if}
