<script>
  import { onMount } from 'svelte';
  import AppLayout   from '../../layouts/AppLayout.svelte';
  import PageHeader  from '../../components/layout/PageHeader.svelte';
  import Modal       from '../../components/ui/Modal.svelte';
  import { api }     from '../../lib/api.js';
  import { selectedSubject, selectedStudent } from '../../stores/teacher.js';

  export let onNavigate = (id) => {};

  // ─── Internal view state ──────────────────────────────────────
  let view = 'list'; // 'list' | 'students'

  // ─── Subjects list state ──────────────────────────────────────
  let subjects = [];
  let loadingSubjects = true;
  let errorSubjects   = null;

  // ─── Students list state ──────────────────────────────────────
  let students        = [];
  let loadingStudents = false;
  let errorStudents   = null;

  // current subject for student view (local copy)
  let currentSubject = null;

  // ─── Unified Modal state ──────────────────────────────────────
  let showUnifiedModal = false;
  let activeActionTab  = 'task'; // 'task' | 'event'
  let unifiedFormError = '';
  let unifiedFormSuccess = '';
  
  let createForm     = { title: '', description: '', priority: 'medium', status: 'todo', estimated_time: 0, due_date: '', assessment_method: 'none', reminder_interval: 'none', subtasks: [] };
  let creating       = false;

  let eventForm       = { title: '', type: 'exam', date: '', description: '', scope: 'class', studentId: '' };
  let creatingEvent   = false;

  let questionBank = [];
  let selectedQuestionIDs = [];
  let questionFilterGrade = 'Todos';

  let showTaskModal = false;
  let showEventModal = false;

  $: filteredQuestionBank = questionBank.filter(q => {
    const matchesSubject = q.SubjectID ? q.SubjectID === currentSubject?.id : true;
    const matchesGrade = questionFilterGrade === 'Todos' || q.GradeLevel === questionFilterGrade;
    return matchesSubject && matchesGrade;
  });

  // Subtask helpers
  let newSubtaskText = '';
  function addSubtask() {
    if (newSubtaskText.trim()) {
      createForm.subtasks = [...createForm.subtasks, newSubtaskText.trim()];
      newSubtaskText = '';
    }
  }
  function removeSubtask(index) {
    createForm.subtasks = createForm.subtasks.filter((_, idx) => idx !== index);
  }

  // ─── Load subjects ────────────────────────────────────────────
  onMount(async () => {
    await loadSubjects();
    loadQuestionBank();

    // Sincronização do $selectedSubject para restaurar a listagem de alunos da turma atual
    const savedSubject = selectedSubject ? getStoreValue(selectedSubject) : null;
    if (savedSubject) {
      openSubject(savedSubject);
    }
  });

  // Helper to read store value directly inside onMount
  function getStoreValue(store) {
    let value;
    store.subscribe(v => value = v)();
    return value;
  }

  async function loadQuestionBank() {
    try {
      questionBank = await api.teacher.questions.list() ?? [];
    } catch (err) {
      console.error(err);
    }
  }

  async function loadSubjects() {
    loadingSubjects = true;
    errorSubjects   = null;
    try {
      subjects = await api.teacher.subjects() ?? [];
    } catch {
      errorSubjects = 'Erro ao carregar turmas. Verifique sua conexão.';
    } finally {
      loadingSubjects = false;
    }
  }

  // ─── Navigate to students ─────────────────────────────────────
  async function openSubject(subject) {
    currentSubject = subject;
    selectedSubject.set(subject);
    view            = 'students';
    loadingStudents = true;
    errorStudents   = null;
    students        = [];
    try {
      students = await api.teacher.subjectStudents(subject.id) ?? [];
    } catch {
      errorStudents = 'Erro ao carregar alunos.';
    } finally {
      loadingStudents = false;
    }
  }

  // ─── Navigate to student kanban ───────────────────────────────
  function openStudent(student) {
    selectedStudent.set(student);
    onNavigate('teacher-student');
  }

  // ─── Back to subjects list ────────────────────────────────────
  function goBack() {
    view           = 'list';
    currentSubject = null;
    selectedSubject.set(null); // Clear selected subject in store on back
  }

  $: uniqueClasses = students.length > 0
    ? [...new Map(students.map(s => [`${s.grade_level}|${s.class_group}`, { gradeLevel: s.grade_level, classGroup: s.class_group }])).values()]
    : [];

  function openTaskModal() {
    createForm = { title: '', description: '', priority: 'medium', status: 'todo', estimated_time: 0, due_date: '', assessment_method: 'none', reminder_interval: 'none', subtasks: [] };
    selectedQuestionIDs = [];
    questionFilterGrade = 'Todos';
    newSubtaskText = '';
    unifiedFormError = '';
    unifiedFormSuccess = '';
    showTaskModal = true;
  }

  function openEventModal() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    eventForm = {
      title: '', type: 'exam', description: '', scope: 'class', studentId: '',
      date: `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,
    };
    unifiedFormError = '';
    unifiedFormSuccess = '';
    showEventModal = true;
  }

  async function submitTask() {
    unifiedFormError = '';
    unifiedFormSuccess = '';
    if (!createForm.title.trim()) { unifiedFormError = 'O título da tarefa é obrigatório'; return; }
    creating = true;
    try {
      const body = {
        title:                  createForm.title.trim(),
        description:            createForm.description.trim() || undefined,
        priority:               createForm.priority,
        status:                 createForm.status,
        estimated_time:         Number(createForm.estimated_time) || 0,
        due_date:               createForm.due_date ? new Date(createForm.due_date).toISOString() : undefined,
        subject_id:             currentSubject.id,
        question_ids:           selectedQuestionIDs,
        assessment_method:      createForm.assessment_method,
        reminder_interval:      createForm.reminder_interval,
        subtasks:               createForm.subtasks,
      };
      const result = await api.teacher.createSubjectTask(currentSubject.id, body);
      const count  = result?.count ?? result?.created ?? students.length;
      unifiedFormSuccess = `Tarefa criada com sucesso para ${count} aluno(s).`;
    } catch (err) {
      unifiedFormError = err?.errors?.[0]?.message || 'Erro ao criar tarefa.';
    } finally {
      creating = false;
    }
  }

  async function submitEvent() {
    unifiedFormError = '';
    unifiedFormSuccess = '';
    if (!eventForm.title.trim()) { unifiedFormError = 'O título do evento é obrigatório'; return; }
    if (!eventForm.date)         { unifiedFormError = 'A data do evento é obrigatória'; return; }
    creatingEvent = true;
    try {
      const body = {
        title:       eventForm.title.trim(),
        description: eventForm.description.trim() || undefined,
        type:        eventForm.type,
        date:        eventForm.date,
        subject_id:  currentSubject?.id,
      };
      if (eventForm.scope === 'student' && eventForm.studentId) {
        body.target_user_id = Number(eventForm.studentId);
      } else if (uniqueClasses.length > 0) {
        body.grade_level = uniqueClasses[0].gradeLevel;
        body.class_group = uniqueClasses[0].classGroup;
      }
      await api.teacher.calendar.create(body);
      unifiedFormSuccess = eventForm.scope === 'student'
        ? 'Evento criado com sucesso para o aluno selecionado.'
        : `Evento criado com sucesso para toda a turma.`;
    } catch (err) {
      unifiedFormError = err?.errors?.[0]?.message || 'Erro ao criar evento.';
    } finally {
      creatingEvent = false;
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────
  function taskProgress(student) {
    const total = student.total_tasks ?? 0;
    const done  = student.done_tasks  ?? 0;
    const pct   = total > 0 ? Math.round(done / total * 100) : 0;
    return { total, done, pct };
  }
</script>

<AppLayout
  title={view === 'list' ? 'Minhas Turmas' : (currentSubject?.class_room_name || currentSubject?.name || 'Alunos')}
  breadcrumbs={view === 'list'
    ? [{label:'Professor'},{label:'Turmas'}]
    : [{label:'Professor'},{label:'Turmas'},{label: currentSubject?.class_room_name || currentSubject?.name || 'Alunos'}]}
  active="teacher-classes"
  {onNavigate}
>

  <!-- ══════════════ VIEW A — Subjects list ══════════════════════ -->
  {#if view === 'list'}
    <PageHeader
      title="Minhas Turmas"
      subtitle="{subjects.length} {subjects.length === 1 ? 'disciplina vinculada' : 'disciplinas vinculadas'}"
    />

    {#if loadingSubjects}
      <div class="flex items-center justify-center h-48">
        <span class="w-6 h-6 border-2 border-slate-200 border-t-pe-primary rounded-full animate-spin"></span>
      </div>
    {:else if errorSubjects}
      <div class="flex flex-col items-center justify-center h-48 gap-3">
        <p class="text-slate-500 text-[14px]">{errorSubjects}</p>
        <button
          class="px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-10"
          on:click={loadSubjects}
        >Tentar novamente</button>
      </div>
    {:else if subjects.length === 0}
      <div class="flex flex-col items-center justify-center h-48 gap-2">
        <p class="text-slate-400 text-[15px] font-semibold">Nenhuma turma atribuída</p>
        <p class="text-slate-300 text-[13px]">Você não possui disciplinas vinculadas ao seu perfil de professor.</p>
      </div>
    {:else}
      <div class="grid grid-cols-2 gap-4">
        {#each subjects as subject}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="bg-white rounded-20 p-5 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow border border-slate-200/60"
            style="border-left:5px solid {subject.color || '#004E98'};"
            on:click={() => openSubject(subject)}
          >
            <div class="space-y-1">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                {subject.institution || 'Instituição'}
              </span>
              <p class="text-[17px] font-black text-slate-900 tracking-tight leading-tight">
                {subject.grade_level || 'Sem turma'}
              </p>
              <div class="flex items-center gap-1.5 pt-0.5">
                <span class="w-2 h-2 rounded-full" style="background:{subject.color || '#004E98'};"></span>
                <p class="text-[13px] font-semibold text-slate-600">{subject.name}</p>
              </div>
            </div>

            <div class="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
              <span class="inline-flex items-center gap-1.5 text-[13px] text-slate-500 font-medium">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <strong>{subject.student_count ?? 0}</strong> {(subject.student_count ?? 0) === 1 ? 'aluno' : 'alunos'}
              </span>
              <button
                class="px-3.5 py-2 rounded-10 text-[12px] font-bold text-white transition-opacity hover:opacity-90 flex items-center gap-1"
                style="background:{subject.color || '#004E98'};"
                on:click|stopPropagation={() => openSubject(subject)}
              >
                Ver alunos
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}

  <!-- ══════════════ VIEW B — Students list ══════════════════════ -->
  {:else}
    <!-- Header row -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <button
          class="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          on:click={goBack}
        >
          ← Voltar
        </button>
        <span class="text-slate-300">|</span>
        <h1 class="text-[20px] font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>{currentSubject?.grade_level || ''}</span>
          <span class="text-[13px] font-bold text-slate-400 uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100" style="color:{currentSubject?.color || '#004E98'}; background:{currentSubject?.color || '#004E98'}12;">
            {currentSubject?.name}
          </span>
        </h1>
      </div>

      <div class="flex gap-2">
        <button
          class="px-4 py-2.5 rounded-12 text-[13px] font-bold text-white transition-opacity hover:opacity-90 flex items-center gap-1.5"
          style="background:#004E98;"
          on:click={openTaskModal}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Criar Tarefa
        </button>
        <button
          class="px-4 py-2.5 rounded-12 text-[13px] font-bold text-slate-700 bg-slate-100 transition-opacity hover:opacity-90 flex items-center gap-1.5 border border-slate-200"
          on:click={openEventModal}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Criar Evento
        </button>
      </div>
    </div>

    {#if loadingStudents}
      <div class="flex items-center justify-center h-48">
        <span class="w-6 h-6 border-2 border-slate-200 border-t-pe-primary rounded-full animate-spin"></span>
      </div>
    {:else if errorStudents}
      <div class="flex flex-col items-center justify-center h-48 gap-3">
        <p class="text-slate-500 text-[14px]">{errorStudents}</p>
      </div>
    {:else if students.length === 0}
      <div class="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        <p class="text-[14px] font-bold">Nenhum aluno matriculado nesta turma.</p>
      </div>
    {:else}
      <div class="bg-white rounded-20 overflow-hidden shadow-sm" style="border:1px solid #E4E4E7;">
        <div class="flex items-center justify-between px-5 py-4" style="border-bottom:1px solid #E4E4E7; background:#F8FAFC;">
          <p class="text-[12px] font-black text-slate-400 uppercase tracking-widest">Estudantes Matriculados</p>
          <span class="text-[11px] font-bold text-slate-500 px-2 py-0.5 bg-slate-200/50 rounded-full">{students.length} matriculados</span>
        </div>

        <table class="w-full">
          <thead>
            <tr style="background:#F8FAFC; border-bottom:1px solid #E4E4E7;">
              <th class="text-left px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Nome</th>
              <th class="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Email</th>
              <th class="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Progresso de Tarefas</th>
              <th class="px-5 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {#each students as student}
              {@const { total, done, pct } = taskProgress(student)}
              <tr class="hover:bg-slate-50 transition-colors" style="border-top:1px solid #F1F5F9;">
                <!-- Avatar & Name -->
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black text-white"
                      style="background:{currentSubject?.color || '#004E98'};">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p class="text-[14px] font-semibold text-slate-800">{student.name}</p>
                      <p class="text-[11px] font-semibold text-slate-400">
                        {student.grade_level}{student.class_group ? ' · ' + student.class_group : ''}
                      </p>
                    </div>
                  </div>
                </td>
                
                <!-- Email -->
                <td class="px-4 py-3.5">
                  <p class="text-[13px] text-slate-500 truncate max-w-[200px]">{student.email}</p>
                </td>

                <!-- Progress -->
                <td class="px-4 py-3.5">
                  <div class="w-48">
                    <div class="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>{done}/{total} entregues</span>
                      <span style="color:{currentSubject?.color || '#004E98'};">{pct}%</span>
                    </div>
                    <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-500"
                        style="width:{pct}%; background:{currentSubject?.color || '#004E98'};"
                      />
                    </div>
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-5 py-3.5 text-right">
                  <button
                    class="px-3.5 py-2 rounded-10 text-[12px] font-bold text-white transition-opacity hover:opacity-90 flex items-center gap-1 ml-auto"
                    style="background:{currentSubject?.color || '#004E98'};"
                    on:click={() => openStudent(student)}
                  >
                    Ver Kanban
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}
</AppLayout>

<!-- ══════════════════════ TASK ACTION MODAL ══════════════════ -->
<Modal open={showTaskModal} title="Criar Nova Tarefa" onClose={() => showTaskModal = false} width="680px">
  <div class="px-6 py-5 flex flex-col gap-4">
    {#if unifiedFormSuccess}
      <div class="flex flex-col items-center gap-3 py-6">
        <div class="text-[44px]">🎉</div>
        <p class="text-[15px] font-bold text-slate-800 text-center leading-relaxed">{unifiedFormSuccess}</p>
        <button
          class="px-5 py-2.5 rounded-10 text-[13px] font-bold text-white"
          style="background:{currentSubject?.color || '#004E98'};"
          on:click={() => showTaskModal = false}
        >Fechar</button>
      </div>
    {:else}
      <div class="flex flex-col gap-1">
        <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Título da tarefa *</label>
        <input
          type="text"
          bind:value={createForm.title}
          placeholder="Ex: Trabalho Trimestral, Lista de Exercícios..."
          class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Descrição / Conteúdo</label>
        <textarea
          bind:value={createForm.description}
          placeholder="Forneça instruções, links ou observações para esta tarefa..."
          rows="3"
          class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none"
        />
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Tempo (minutos)</label>
          <input
            type="number"
            step="5"
            min="0"
            bind:value={createForm.estimated_time}
            placeholder="Ex: 120"
            class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Prioridade</label>
          <select
            bind:value={createForm.priority}
            class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="low">🟢 Baixa</option>
            <option value="medium">🟡 Média</option>
            <option value="high">🟠 Alta</option>
            <option value="urgent">🔴 Urgente</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Status inicial</label>
          <select
            bind:value={createForm.status}
            class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="todo">A fazer</option>
            <option value="doing">Fazendo</option>
            <option value="review">Revisão</option>
            <option value="done">Entregue</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <!-- Due date with time -->
        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Prazo</label>
          <input
            type="datetime-local"
            bind:value={createForm.due_date}
            class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <!-- Assessment Method selector -->
        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Método de Avaliação *</label>
          <select
            bind:value={createForm.assessment_method}
            class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="none">Nenhum (Tarefa simples)</option>
            <option value="essay">Redação (Aluno redige e envia redação)</option>
            <option value="quiz">Questionário (Questões abertas/fechadas)</option>
          </select>
        </div>

        <!-- Reminders configuration (Simplified) -->
        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Lembretes Automáticos</label>
          <select
            bind:value={createForm.reminder_interval}
            class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="none">Nenhum lembrete</option>
            <option value="hourly">A cada hora</option>
            <option value="12hours">A cada 12 horas</option>
            <option value="daily">Diariamente</option>
            <option value="weekly">Semanalmente</option>
          </select>
        </div>
      </div>

      <!-- Subtasks creation -->
      <div class="flex flex-col gap-2 bg-slate-50 border border-slate-200 rounded-12 p-3.5 mt-1">
        <label class="text-[12px] font-bold text-slate-700 uppercase tracking-wider">Subtarefas da Tarefa</label>

        {#if createForm.subtasks.length > 0}
          <ul class="flex flex-col gap-1.5 mb-1">
            {#each createForm.subtasks as st, idx}
              <li class="flex items-center gap-2 px-3 py-2 bg-white rounded-10 border border-slate-200 group">
                <span class="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0"></span>
                <span class="flex-1 text-[13px] text-slate-700 truncate">{st}</span>
                <button
                  type="button"
                  class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all text-[16px] leading-none"
                  on:click={() => removeSubtask(idx)}
                  title="Remover"
                >×</button>
              </li>
            {/each}
          </ul>
        {/if}

        <div class="flex gap-2">
          <input
            type="text"
            bind:value={newSubtaskText}
            placeholder="Adicionar subtarefa..."
            class="flex-1 px-3 py-2 rounded-10 text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors bg-white"
            on:keydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
          />
          <button
            type="button"
            class="px-3 py-2 rounded-10 text-[13px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors whitespace-nowrap"
            on:click={addSubtask}
          >+ Add</button>
        </div>
      </div>

      <!-- Question Selection (only if quiz or essay) -->
      {#if createForm.assessment_method === 'quiz' || createForm.assessment_method === 'essay'}
        <div class="flex flex-col gap-2 bg-slate-50 border border-slate-200 rounded-12 p-3.5 mt-1">
          <div class="flex justify-between items-center">
            <label class="text-[12px] font-bold text-slate-700 uppercase tracking-wider">Questões vinculadas ({selectedQuestionIDs.length} sel.)</label>
            <span class="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-wider">
              Banco de Questões
            </span>
          </div>
          
          <!-- Series filtering -->
          <div class="flex gap-2 items-center my-1 bg-white p-2 rounded-8 border border-slate-200">
            <label class="text-[10.5px] font-bold text-slate-500 uppercase">Série:</label>
            <select
              bind:value={questionFilterGrade}
              class="flex-1 px-2 py-1 rounded-6 text-[12px] border border-slate-100 bg-slate-50 font-semibold focus:outline-none"
            >
              <option value="Todos">Todas as séries</option>
              <option value="9º Ano Ensino Fundamental">9º Ano EF</option>
              <option value="3º Ano Ensino Médio">3º Ano EM</option>
            </select>
          </div>

          {#if filteredQuestionBank.length === 0}
            <p class="text-[12px] text-slate-400 font-semibold italic text-center py-3 bg-white border border-slate-200 rounded-10">Nenhuma questão compatível com os filtros.</p>
          {:else}
            <div class="max-h-[140px] overflow-y-auto flex flex-col gap-1.5 mt-1 border border-slate-200 rounded-10 p-2 bg-white">
              {#each filteredQuestionBank as q}
                <label class="flex items-start gap-2.5 p-2 rounded-8 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    value={q.ID}
                    checked={selectedQuestionIDs.includes(q.ID)}
                    on:change={(e) => {
                      if (e.target.checked) {
                        selectedQuestionIDs = [...selectedQuestionIDs, q.ID];
                      } else {
                        selectedQuestionIDs = selectedQuestionIDs.filter(id => id !== q.ID);
                      }
                    }}
                    class="w-4 h-4 mt-0.5 text-blue-600"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-[12.5px] font-bold text-slate-700 truncate">{q.Prompt}</p>
                    <p class="text-[10px] font-bold uppercase text-slate-400 flex justify-between">
                      <span>{q.Type === 'multiple_choice' ? 'Múltipla Escolha' : q.Type === 'open' ? 'Dissertativa' : 'Redação'}</span>
                      <span class="text-blue-500 font-black">{q.GradeLevel || 'Geral'}</span>
                    </p>
                  </div>
                </label>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      {#if unifiedFormError}
        <p class="text-[13px] text-red-500 font-semibold">{unifiedFormError}</p>
      {/if}

      <!-- Actions -->
      <div class="flex gap-2 pt-2" style="border-top:1px solid #F1F5F9;">
        <button
          type="button"
          class="flex-1 py-3 rounded-12 text-[14px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          on:click={() => showTaskModal = false}
        >
          Cancelar
        </button>
        <button
          type="button"
          class="flex-1 py-3 rounded-12 text-[14px] font-bold text-white transition-opacity disabled:opacity-60"
          style="background:{currentSubject?.color || '#004E98'};"
          disabled={creating}
          on:click={submitTask}
        >
          {#if creating}Salvando...{:else}Criar Tarefa{/if}
        </button>
      </div>
    {/if}
  </div>
</Modal>

<!-- ══════════════════════ EVENT ACTION MODAL ══════════════════ -->
<Modal open={showEventModal} title="Criar Novo Evento" onClose={() => showEventModal = false} width="680px">
  <div class="px-6 py-5 flex flex-col gap-4">
    {#if unifiedFormSuccess}
      <div class="flex flex-col items-center gap-3 py-6">
        <div class="text-[44px]">🎉</div>
        <p class="text-[15px] font-bold text-slate-800 text-center leading-relaxed">{unifiedFormSuccess}</p>
        <button
          class="px-5 py-2.5 rounded-10 text-[13px] font-bold text-white"
          style="background:{currentSubject?.color || '#004E98'};"
          on:click={() => showEventModal = false}
        >Fechar</button>
      </div>
    {:else}
      <div class="flex flex-col gap-1">
        <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Título do evento *</label>
        <input
          type="text"
          bind:value={eventForm.title}
          placeholder="Ex: Prova Bimestral, Entrega de Maquetes..."
          class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Tipo</label>
          <select
            bind:value={eventForm.type}
            class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
          >
            <option value="exam">🔴 Prova</option>
            <option value="work">🔵 Trabalho</option>
            <option value="activity">🟠 Atividade</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Data do evento *</label>
          <input
            type="date"
            bind:value={eventForm.date}
            class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Público Alvo</label>
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 py-2 rounded-10 text-[13px] font-bold border transition-all"
            style="background:{eventForm.scope==='class'?(currentSubject?.color || '#004E98'):'#FFFFFF'}; border-color:{eventForm.scope==='class'?(currentSubject?.color || '#004E98'):'#E2E8F0'}; color:{eventForm.scope==='class'?'#FFFFFF':'#64748B'};"
            on:click={() => eventForm.scope = 'class'}
          >Toda a turma</button>
          <button
            type="button"
            class="flex-1 py-2 rounded-10 text-[13px] font-bold border transition-all"
            style="background:{eventForm.scope==='student'?(currentSubject?.color || '#004E98'):'#FFFFFF'}; border-color:{eventForm.scope==='student'?(currentSubject?.color || '#004E98'):'#E2E8F0'}; color:{eventForm.scope==='student'?'#FFFFFF':'#64748B'};"
            on:click={() => eventForm.scope = 'student'}
          >Aluno específico</button>
        </div>
      </div>

      {#if eventForm.scope === 'student' && students.length > 0}
        <div class="flex flex-col gap-1">
          <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Selecionar aluno</label>
          <select
            bind:value={eventForm.studentId}
            class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-purple-500 bg-white"
          >
            <option value="">— Selecione um aluno —</option>
            {#each students as s}
              <option value={String(s.id)}>{s.name}</option>
            {/each}
          </select>
        </div>
      {/if}

      <div class="flex flex-col gap-1">
        <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Descrição do Evento</label>
        <textarea
          bind:value={eventForm.description}
          placeholder="Conteúdo a ser avaliado, material de apoio..."
          rows="2"
          class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-purple-500 resize-none"
        />
      </div>

      {#if unifiedFormError}
        <p class="text-[13px] text-red-500 font-semibold">{unifiedFormError}</p>
      {/if}

      <!-- Actions -->
      <div class="flex gap-2 pt-2" style="border-top:1px solid #F1F5F9;">
        <button
          type="button"
          class="flex-1 py-3 rounded-12 text-[14px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          on:click={() => showEventModal = false}
        >
          Cancelar
        </button>
        <button
          type="button"
          class="flex-1 py-3 rounded-12 text-[14px] font-bold text-white transition-opacity disabled:opacity-60"
          style="background:{currentSubject?.color || '#004E98'};"
          disabled={creatingEvent}
          on:click={submitEvent}
        >
          {#if creatingEvent}Salvando...{:else}Criar Evento{/if}
        </button>
      </div>
    {/if}
  </div>
</Modal>
