<script>
  import { onMount }  from 'svelte';
  import { get }      from 'svelte/store';
  import AppLayout    from '../../layouts/AppLayout.svelte';
  import Modal        from '../../components/ui/Modal.svelte';
  import { api }      from '../../lib/api.js';
  import { selectedStudent } from '../../stores/teacher.js';

  export let onNavigate = (id) => {};

  const COLUMNS = [
    { status: 'todo',   label: 'A fazer',  color: '#6B7280' },
    { status: 'doing',  label: 'Fazendo',  color: '#004E98' },
    { status: 'review', label: 'Revisão',  color: '#FFB42E' },
    { status: 'done',   label: 'Entregue', color: '#4CD964' },
  ];

  const PRIORITY_COLORS = { low: '#4CD964', medium: '#FFB42E', high: '#FF6700', urgent: '#FF2D5F' };
  const PRIORITY_LABELS = { low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente' };

  // ─── State ───────────────────────────────────────────────────
  let student = null;
  let tasks   = [];
  let loading = true;
  let error   = null;

  // Create modal
  let showCreate  = false;
  let createForm  = { title: '', description: '', priority: 'medium', status: 'todo', estimated_time: 0, due_date: '', assessment_method: 'none', category: 'outro', completion_threshold: 60, reminder_days_before: '', reminder_specific_time: '', reminder_daily_time: '' };
  let creating    = false;
  let createError = null;

  let questionBank = [];
  let selectedQuestionIDs = [];
  let questionFilterGrade = 'Todos';

  // Task details and timeline history
  let selectedTask = null;
  let showTaskDetails = false;
  let loadingHistory = false;
  let taskHistory = [];

  $: filteredQuestionBank = questionBank.filter(q => {
    // Filter questions by grade and generic/subject
    const matchesGrade = questionFilterGrade === 'Todos' || q.GradeLevel === questionFilterGrade;
    return matchesGrade;
  });

  async function openTaskDetails(task) {
    selectedTask = task;
    showTaskDetails = true;
    loadingHistory = true;
    taskHistory = [];
    try {
      taskHistory = await api.tasks.history(task.id) ?? [];
    } catch (err) {
      console.error(err);
    } finally {
      loadingHistory = false;
    }
  }

  function closeTaskDetails() {
    selectedTask = null;
    showTaskDetails = false;
    taskHistory = [];
  }

  // ─── Derived ─────────────────────────────────────────────────
  $: columns = COLUMNS.map(col => ({
    ...col,
    cards: tasks.filter(t => t.status === col.status),
  }));

  $: totalCards = tasks.length;
  $: doneCards  = tasks.filter(t => t.status === 'done').length;
  $: pct        = totalCards ? Math.round(doneCards / totalCards * 100) : 0;

  // ─── Load ────────────────────────────────────────────────────
  onMount(() => {
    student = get(selectedStudent);
    if (student) {
      loadTasks();
      loadQuestionBank();
    } else {
      loading = false;
    }
  });

  async function loadQuestionBank() {
    try {
      questionBank = await api.teacher.questions.list() ?? [];
    } catch (err) {
      console.error(err);
    }
  }

  async function loadTasks() {
    loading = true;
    error   = null;
    try {
      tasks = await api.teacher.studentTasks(student.id) ?? [];
    } catch {
      error = 'Erro ao carregar tarefas do aluno.';
    } finally {
      loading = false;
    }
  }

  // ─── Create task ─────────────────────────────────────────────
  function openCreate() {
    createForm  = { title: '', description: '', priority: 'medium', status: 'todo', estimated_time: 0, due_date: '', assessment_method: 'none', category: 'outro', completion_threshold: 60, reminder_days_before: '', reminder_specific_time: '', reminder_daily_time: '' };
    selectedQuestionIDs = [];
    questionFilterGrade = 'Todos';
    createError = null;
    showCreate  = true;
  }

  async function submitCreate() {
    if (!createForm.title.trim()) { createError = 'O título é obrigatório'; return; }
    creating    = true;
    createError = null;
    try {
      const body = {
        title:                  createForm.title.trim(),
        description:            createForm.description.trim() || undefined,
        priority:               createForm.priority,
        status:                 createForm.status,
        estimated_time:         Number(createForm.estimated_time) || 0,
        due_date:               createForm.due_date ? new Date(createForm.due_date).toISOString() : undefined,
        question_ids:           selectedQuestionIDs,
        assessment_method:      createForm.assessment_method,
        category:               createForm.category,
        completion_threshold:   Number(createForm.completion_threshold) || 60,
        reminder_days_before:   createForm.reminder_days_before.trim(),
        reminder_specific_time: createForm.reminder_specific_time ? new Date(createForm.reminder_specific_time).toISOString() : undefined,
        reminder_daily_time:    createForm.reminder_daily_time,
      };
      const task = await api.teacher.createStudentTask(student.id, body);
      tasks      = [task, ...tasks];
      showCreate = false;
    } catch {
      createError = 'Erro ao criar tarefa. Tente novamente.';
    } finally {
      creating = false;
    }
  }

  // ─── Back ─────────────────────────────────────────────────────
  function goBack() {
    selectedStudent.set(null);
    onNavigate('teacher-classes');
  }

  // ─── Helpers ─────────────────────────────────────────────────
  function formatDate(dateStr) {
    if (!dateStr) return null;
    const d        = new Date(dateStr);
    const today    = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === today.toDateString())    return 'Hoje';
    if (d.toDateString() === tomorrow.toDateString()) return 'Amanhã';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }

  function subtaskProgress(task) {
    const total = (task.subtasks ?? []).length;
    const done  = (task.subtasks ?? []).filter(s => s.completed).length;
    return { total, done };
  }

  function dateIsUrgent(label) {
    return label === 'Hoje' || label === 'Amanhã';
  }
</script>

<!-- ══════════════════════════════════════════════════════════════ -->
<AppLayout
  title={student?.name ?? 'Aluno'}
  breadcrumbs={[{label:'Professor'},{label:'Turmas'},{label: student?.name ?? 'Aluno'}]}
  active="teacher-student"
  {onNavigate}
>
  <!-- Header -->
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center gap-3">
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <button
        class="text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        on:click={goBack}
      >← Voltar</button>
      <span class="text-slate-300">|</span>
      <div>
        <h1 class="text-[22px] font-extrabold text-slate-900 tracking-tight leading-snug">
          {student?.name ?? 'Aluno'}
        </h1>
        {#if student?.grade_level}
          <span class="inline-block text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {student.grade_level}{student.class_group ? ' · ' + student.class_group : ''}
          </span>
        {/if}
      </div>
    </div>

    <button
      class="px-4 py-2 rounded-10 text-[13px] font-bold text-white"
      style="background:#004E98;"
      on:click={openCreate}
    >+ Criar tarefa</button>
  </div>

  <!-- Progress bar -->
  <div class="flex items-center gap-4 mb-6 bg-white rounded-14 p-4 border border-slate-200">
    <div class="flex-1">
      <div class="flex justify-between items-center mb-1.5">
        <span class="text-[13px] font-bold text-slate-700">Progresso geral</span>
        <span class="text-[13px] font-black text-slate-900">{doneCards}/{totalCards} tarefas</span>
      </div>
      <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all duration-500" style="width:{pct}%;background:linear-gradient(90deg,#004E98,#4CD964);" />
      </div>
    </div>
    <div class="text-[28px] font-black text-slate-900 flex-shrink-0">{pct}%</div>
  </div>

  <!-- Loading / Error -->
  {#if !student}
    <div class="flex flex-col items-center justify-center h-48 gap-2">
      <p class="text-slate-400 text-[14px]">Nenhum aluno selecionado.</p>
      <button class="px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-10" on:click={goBack}>Voltar às turmas</button>
    </div>
  {:else if loading}
    <div class="flex items-center justify-center h-48 text-slate-400 text-[14px]">Carregando tarefas...</div>
  {:else if error}
    <div class="flex flex-col items-center justify-center h-48 gap-3">
      <p class="text-slate-500 text-[14px]">{error}</p>
      <button class="px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-10" on:click={loadTasks}>Tentar novamente</button>
    </div>
  {:else}
    <!-- Kanban columns -->
    <div class="grid grid-cols-4 gap-4">
      {#each columns as col}
        <div
          class="rounded-16 p-3 flex flex-col gap-2 min-h-[400px]"
          style="background:#F8FAFC; border:1.5px solid #E2E8F0;"
        >
          <!-- Column header -->
          <div class="flex items-center gap-2 px-1 mb-1">
            <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:{col.color};" />
            <p class="flex-1 text-[13px] font-black text-slate-800 tracking-tight">{col.label}</p>
            <span class="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">{col.cards.length}</span>
          </div>

          <!-- Cards -->
          {#each col.cards as card (card.id)}
            {@const due    = formatDate(card.due_date)}
            {@const { total: stTotal, done: stDone } = subtaskProgress(card)}
            {@const isDone = card.status === 'done'}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              class="bg-white rounded-12 p-3 border border-slate-100 hover:shadow-md cursor-pointer transition-shadow"
              style="opacity:{isDone ? 0.65 : 1};"
              on:click={() => openTaskDetails(card)}
            >
              <!-- Subject badge or priority badge -->
              {#if card.subject_name}
                <p class="text-[10px] font-black uppercase tracking-wide mb-1" style="color:{card.subject_color || '#64748B'};">
                  {card.subject_name}
                </p>
              {:else}
                <p class="text-[10px] font-bold uppercase tracking-wide mb-1" style="color:{PRIORITY_COLORS[card.priority] || '#94A3B8'};">
                  {PRIORITY_LABELS[card.priority] || 'Média'}
                </p>
              {/if}

              <p class="text-[13px] font-semibold text-slate-800 tracking-tight leading-snug mb-2"
                style="text-decoration:{isDone ? 'line-through' : 'none'};">{card.title}</p>

              <!-- Subtask progress -->
              {#if stTotal > 0}
                <div class="h-1.5 bg-slate-100 rounded-sm overflow-hidden mb-1.5">
                  <div class="h-full rounded-sm" style="width:{stTotal > 0 ? Math.round(stDone/stTotal*100) : 0}%;background:{col.color};" />
                </div>
                <div class="flex justify-between text-[10px] text-slate-500 font-semibold">
                  <span>{stDone}/{stTotal} subtarefas</span>
                  {#if due}
                    <span style="color:{dateIsUrgent(due) ? '#EF4444' : '#94A3B8'};">{due}</span>
                  {/if}
                </div>
              {:else if due}
                <div class="text-[10px] font-semibold text-right" style="color:{dateIsUrgent(due) ? '#EF4444' : '#94A3B8'};">{due}</div>
              {/if}

              {#if isDone}
                <div class="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
                  <svg width="10" height="10" viewBox="0 0 24 24"><path d="M4 12l5 5 11-11" stroke="#10B981" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>
                  Entregue
                </div>
              {/if}
            </div>
          {/each}

          <!-- Add card shortcut -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="py-2.5 text-center text-[12px] text-slate-400 font-bold rounded-12 cursor-pointer hover:bg-white hover:text-slate-600 transition-all mt-auto"
            style="border:1.5px dashed #CBD5E1;"
            on:click={openCreate}
          >+ Novo cartão</div>
        </div>
      {/each}
    </div>
  {/if}
</AppLayout>

<!-- ══════════════════════════ CREATE MODAL ══════════════════════ -->
<Modal open={showCreate} title="Nova tarefa para {student?.name ?? 'aluno'}" onClose={() => showCreate = false} width="480px">
  <div class="px-6 py-5 flex flex-col gap-4">

    <div class="flex flex-col gap-1">
      <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Título *</label>
      <input
        type="text"
        bind:value={createForm.title}
        placeholder="Descrição da tarefa..."
        class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Descrição</label>
      <textarea
        bind:value={createForm.description}
        placeholder="Detalhes opcionais..."
        rows="3"
        class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none"
      />
    </div>

    <div class="grid grid-cols-3 gap-3">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Categoria</label>
        <select
          bind:value={createForm.category}
          class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
        >
          <option value="estudo">📖 Estudo</option>
          <option value="leitura">📚 Leitura</option>
          <option value="exercicios">✏️ Exercícios</option>
          <option value="trabalho">💼 Trabalho</option>
          <option value="pesquisa">🔍 Pesquisa</option>
          <option value="apresentacao">🎤 Apresentação</option>
          <option value="filme">🎬 Filme</option>
          <option value="redacao">📝 Redação</option>
          <option value="outro">📌 Outro</option>
        </select>
      </div>

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
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="flex flex-col gap-1">
        <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">% Acerto p/ Conclusão</label>
        <input
          type="number"
          min="0"
          max="100"
          step="5"
          bind:value={createForm.completion_threshold}
          placeholder="60"
          class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Status</label>
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

    <div class="flex flex-col gap-1">
      <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Prazo</label>
      <input
        type="datetime-local"
        bind:value={createForm.due_date}
        class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500"
      />
    </div>

    <!-- Assessment Method -->
    <div class="flex flex-col gap-1">
      <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Método de Avaliação</label>
      <select
        bind:value={createForm.assessment_method}
        class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
      >
        <option value="none">Nenhum (Tarefa simples)</option>
        <option value="essay">Redação (Aluno redige e envia redação)</option>
        <option value="quiz">Questionário (Questões abertas/fechadas)</option>
      </select>
    </div>

    <!-- Reminders -->
    <div class="flex flex-col gap-2 bg-slate-50 border border-slate-200 rounded-12 p-3.5">
      <label class="text-[12px] font-bold text-slate-700 uppercase tracking-wider">⏰ Lembretes Automáticos</label>
      <p class="text-[11px] text-slate-500 font-medium">O aluno receberá notificações caso não conclua a tarefa.</p>
      <div class="flex flex-col gap-1">
        <label class="text-[11px] font-bold text-slate-500 uppercase">Dias antes do prazo (Ex: 7,3,1)</label>
        <input
          type="text"
          bind:value={createForm.reminder_days_before}
          placeholder="Ex: 7,3,1"
          class="w-full px-3 py-1.5 rounded-8 text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
        />
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-bold text-slate-500 uppercase">Data específica</label>
          <input type="datetime-local" bind:value={createForm.reminder_specific_time}
            class="w-full px-2 py-1.5 rounded-8 text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[11px] font-bold text-slate-500 uppercase">Lembrete diário às</label>
          <input type="time" bind:value={createForm.reminder_daily_time}
            class="w-full px-2 py-1.5 rounded-8 text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>
      </div>
    </div>

    <!-- Question Selection (only for quiz/essay) -->
    {#if createForm.assessment_method === 'quiz' || createForm.assessment_method === 'essay'}
      <div class="flex flex-col gap-2 bg-slate-50 border border-slate-200 rounded-12 p-3.5">
        <div class="flex justify-between items-center">
          <label class="text-[12px] font-bold text-slate-700 uppercase tracking-wider">Questões Vinculadas ({selectedQuestionIDs.length} sel.)</label>
          <span class="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase">Banco</span>
        </div>
        <p class="text-[11px] text-slate-500 font-medium">Vincule questões do banco para o aluno responder ao entregar.</p>
        <!-- Grade filter -->
        <div class="flex gap-2 items-center bg-white p-2 rounded-8 border border-slate-200">
          <label class="text-[10.5px] font-bold text-slate-500 uppercase">Série:</label>
          <select bind:value={questionFilterGrade}
            class="flex-1 px-2 py-1 rounded-6 text-[12px] border border-slate-100 bg-slate-50 font-semibold focus:outline-none"
          >
            <option value="Todos">Todas</option>
            <option value="9º Ano Ensino Fundamental">9º Ano EF</option>
            <option value="3º Ano Ensino Médio">3º Ano EM</option>
          </select>
        </div>
        {#if filteredQuestionBank.length === 0}
          <p class="text-[12px] text-slate-400 font-semibold italic text-center py-3 bg-white border border-slate-200 rounded-10">Nenhuma questão compatível.</p>
        {:else}
          <div class="max-h-[140px] overflow-y-auto flex flex-col gap-1.5 border border-slate-200 rounded-10 p-2 bg-white">
            {#each filteredQuestionBank as q}
              <label class="flex items-start gap-2.5 p-2 rounded-8 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                <input type="checkbox" value={q.ID}
                  checked={selectedQuestionIDs.includes(q.ID)}
                  on:change={(e) => {
                    if (e.target.checked) { selectedQuestionIDs = [...selectedQuestionIDs, q.ID]; }
                    else { selectedQuestionIDs = selectedQuestionIDs.filter(id => id !== q.ID); }
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

    {#if createError}
      <p class="text-[13px] text-red-500 font-semibold">{createError}</p>
    {/if}

    <div class="flex gap-2 pt-1">
      <button
        class="flex-1 py-2.5 rounded-10 text-[13px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        on:click={() => showCreate = false}
      >Cancelar</button>
      <button
        class="flex-1 py-2.5 rounded-10 text-[13px] font-bold text-white transition-opacity"
        style="background:#004E98; opacity:{creating ? 0.6 : 1};"
        disabled={creating}
        on:click={submitCreate}
      >{creating ? 'Criando...' : 'Criar tarefa'}</button>
    </div>
  </div>
</Modal>

<!-- ══════════════════════════ TASK DETAILS + TIMELINE MODAL ══════════════════════════ -->
{#if showTaskDetails && selectedTask}
  {@const statusLabel = { todo:'A Fazer', doing:'Fazendo', review:'Revisão', done:'Concluída' }[selectedTask.status] ?? selectedTask.status}
  {@const statusColor = { todo:'#94A3B8', doing:'#3B82F6', review:'#F59E0B', done:'#10B981' }[selectedTask.status] ?? '#94A3B8'}
  {@const pLabel = { low:'Baixa', medium:'Média', high:'Alta', urgent:'Urgente' }[selectedTask.priority] ?? selectedTask.priority}
  {@const pColor = { low:'#10B981', medium:'#3B82F6', high:'#F59E0B', urgent:'#EF4444' }[selectedTask.priority] ?? '#94A3B8'}
  <div
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    style="background:rgba(15,23,42,0.55); backdrop-filter:blur(2px);"
    on:click|self={closeTaskDetails}
    role="dialog"
    aria-modal="true"
  >
    <div class="bg-white w-full sm:w-[560px] max-h-[90vh] overflow-y-auto rounded-t-24 sm:rounded-24 shadow-2xl flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
        <div class="flex-1 min-w-0 pr-3">
          <p class="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Detalhes da Tarefa</p>
          <h2 class="text-[18px] font-black text-slate-900 leading-snug truncate">{selectedTask.title}</h2>
        </div>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors text-[20px] leading-none"
          on:click={closeTaskDetails}
        >×</button>
      </div>
 
      <div class="px-6 py-5 flex flex-col gap-5">
        <!-- Meta info row -->
        <div class="grid grid-cols-3 gap-3">
          <!-- Status badge -->
          <div class="flex flex-col gap-1 bg-slate-50 rounded-12 p-3 border border-slate-100">
            <p class="text-[10px] font-black uppercase text-slate-400">Status</p>
            <span class="text-[13px] font-extrabold" style="color:{statusColor};">{statusLabel}</span>
          </div>
          <!-- Priority badge -->
          <div class="flex flex-col gap-1 bg-slate-50 rounded-12 p-3 border border-slate-100">
            <p class="text-[10px] font-black uppercase text-slate-400">Prioridade</p>
            <span class="text-[13px] font-extrabold" style="color:{pColor};">{pLabel}</span>
          </div>
          <!-- Estimated time -->
          <div class="flex flex-col gap-1 bg-slate-50 rounded-12 p-3 border border-slate-100">
            <p class="text-[10px] font-black uppercase text-slate-400">Tempo Est.</p>
            <span class="text-[13px] font-extrabold text-slate-700">{selectedTask.estimated_time || 0}h</span>
          </div>
        </div>

        <!-- Assessment Method -->
        {#if selectedTask.assessment_method && selectedTask.assessment_method !== 'none'}
          <div class="flex items-center gap-2 px-3 py-2 rounded-10 border"
            style="background:{selectedTask.assessment_method === 'essay' ? '#F5F3FF' : '#FFFBEB'}; border-color:{selectedTask.assessment_method === 'essay' ? '#C4B5FD' : '#FDE68A'};">
            <span class="text-[16px]">{selectedTask.assessment_method === 'essay' ? '📝' : '📋'}</span>
            <div>
              <p class="text-[12px] font-black"
                style="color:{selectedTask.assessment_method === 'essay' ? '#7C3AED' : '#92400E'};"
              >
                {selectedTask.assessment_method === 'essay' ? 'Redação obrigatória' : 'Questionário obrigatório'}
              </p>
              <p class="text-[11px] font-semibold"
                style="color:{selectedTask.assessment_method === 'essay' ? '#8B5CF6' : '#B45309'};"
              >
                O aluno precisará {selectedTask.assessment_method === 'essay' ? 'escrever uma redação' : 'responder um questionário'} para concluir.
              </p>
            </div>
          </div>
        {/if}

        <!-- Reminder config -->
        {#if selectedTask.reminder_days_before || selectedTask.reminder_daily_time || selectedTask.reminder_specific_time}
          <div class="flex flex-col gap-1.5 px-3 py-2.5 rounded-10 bg-blue-50 border border-blue-100">
            <p class="text-[11px] font-black uppercase text-blue-700">⏰ Lembretes Configurados</p>
            {#if selectedTask.reminder_days_before}
              <p class="text-[12px] text-blue-600 font-semibold">· Dias antes: {selectedTask.reminder_days_before}</p>
            {/if}
            {#if selectedTask.reminder_daily_time}
              <p class="text-[12px] text-blue-600 font-semibold">· Diário às: {selectedTask.reminder_daily_time}</p>
            {/if}
            {#if selectedTask.reminder_specific_time}
              <p class="text-[12px] text-blue-600 font-semibold">· Data específica: {new Date(selectedTask.reminder_specific_time).toLocaleString('pt-BR')}</p>
            {/if}
          </div>
        {/if}

        <!-- Timeline History -->
        <div>
          <p class="text-[13px] font-black text-slate-700 uppercase tracking-widest mb-3">📌 Histórico de Movimentações</p>

          {#if loadingHistory}
            <div class="flex items-center justify-center py-8 text-slate-400 text-[13px]">Carregando histórico...</div>
          {:else if taskHistory.length === 0}
            <div class="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-12 border border-dashed border-slate-200">
              <span class="text-[28px] mb-2">📭</span>
              <p class="text-[13px] text-slate-400 font-semibold">Nenhum histórico de movimentação ainda.</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Quando o aluno mover a tarefa no Kanban, o histórico aparecerá aqui.</p>
            </div>
          {:else}
            <div class="relative pl-5">
              <!-- Vertical track line -->
              <div class="absolute left-[7px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-200 via-slate-200 to-transparent rounded-full"></div>

              <div class="flex flex-col gap-0">
                {#each taskHistory as entry, i}
                  {@const fromLabel = { todo:'A Fazer', doing:'Fazendo', review:'Revisão', done:'Concluída', '':'Criada' }[entry.from_status] ?? entry.from_status}
                  {@const toLabel   = { todo:'A Fazer', doing:'Fazendo', review:'Revisão', done:'Concluída' }[entry.to_status] ?? entry.to_status}
                  {@const toColor   = { todo:'#94A3B8', doing:'#3B82F6', review:'#F59E0B', done:'#10B981' }[entry.to_status] ?? '#6B7280'}
                  {@const toIcon    = { todo:'○', doing:'⚡', review:'🔍', done:'✓' }[entry.to_status] ?? '·'}
                  <div class="relative flex gap-3 pb-5">
                    <!-- Timeline dot -->
                    <div
                      class="absolute left-[-17px] w-4 h-4 rounded-full border-2 border-white shadow flex items-center justify-center text-[8px] font-black flex-shrink-0 mt-0.5 z-10"
                      style="background:{toColor};"
                    >
                      <span class="text-white text-[9px]">{toIcon}</span>
                    </div>
                    <!-- Content card -->
                    <div class="flex-1 bg-white rounded-12 border border-slate-100 px-3.5 py-2.5 shadow-sm hover:shadow-md transition-shadow">
                      <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          {#if entry.from_status}
                            <span class="text-[11px] font-bold text-slate-400 line-through">{fromLabel}</span>
                            <span class="text-slate-300 text-[11px]">→</span>
                          {/if}
                          <span class="text-[12px] font-black px-2 py-0.5 rounded-full" style="background:{toColor}18; color:{toColor};">{toLabel}</span>
                        </div>
                        <span class="text-[10px] text-slate-400 font-semibold whitespace-nowrap flex-shrink-0">
                          {new Date(entry.moved_at).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                      <p class="text-[11px] text-slate-500 font-semibold mt-0.5">por {entry.moved_by_name}</p>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 pb-6 pt-2">
        <button
          class="w-full py-2.5 rounded-12 text-[13px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          on:click={closeTaskDetails}
        >Fechar</button>
      </div>
    </div>
  </div>
{/if}
