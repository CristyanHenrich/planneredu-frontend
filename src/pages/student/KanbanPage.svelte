<script>
  import { onMount } from 'svelte';
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import Icon       from '../../components/ui/Icon.svelte';
  import Modal       from '../../components/ui/Modal.svelte';
  import Toast       from '../../components/ui/Toast.svelte';
  import { showToast } from '../../stores/toast.js';
  import { api }   from '../../lib/api.js';
  import {
    BookOpen, BookMarked, PenTool, Briefcase, Search,
    Presentation, Film, FileText, ClipboardList, MoreHorizontal
  } from 'lucide-svelte';

  export let onNavigate = (id) => {};

  const COLUMNS = [
    { status: 'todo',   label: 'A fazer',  color: '#6B7280' },
    { status: 'doing',  label: 'Fazendo',  color: '#004E98' },
    { status: 'review', label: 'Revisão',  color: '#FFB42E' },
    { status: 'done',   label: 'Entregue', color: '#4CD964' },
  ];

  const PRIORITY_COLORS = { low: '#4CD964', medium: '#FFB42E', high: '#FF6700', urgent: '#FF2D5F' };
  const PRIORITY_LABELS = { low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente' };
  const STATUS_LABELS   = { todo: 'A fazer', doing: 'Fazendo', review: 'Revisão', done: 'Entregue' };
  const STATUS_COLORS   = { todo: '#6B7280', doing: '#004E98', review: '#FFB42E', done: '#4CD964' };

  // ─── Category config ────────────────────────────────────────
  const CATEGORY_CONFIG = {
    estudo:     { label: 'Estudo',   icon: BookOpen,      color: '#3B82F6', bg: '#EFF6FF' },
    leitura:    { label: 'Leitura',  icon: BookMarked,    color: '#8B5CF6', bg: '#F5F3FF' },
    exercicios: { label: 'Exercícios', icon: PenTool,     color: '#10B981', bg: '#ECFDF5' },
    trabalho:   { label: 'Trabalho', icon: Briefcase,    color: '#F59E0B', bg: '#FFFBEB' },
    pesquisa:   { label: 'Pesquisa', icon: Search,        color: '#EF4444', bg: '#FEF2F2' },
    apresentacao: { label: 'Apresentação', icon: Presentation, color: '#EC4899', bg: '#FDF2F8' },
    filme:      { label: 'Filme',    icon: Film,         color: '#6366F1', bg: '#EEF2FF' },
    redacao:    { label: 'Redação',  icon: FileText,     color: '#14B8A6', bg: '#F0FDFA' },
    outro:      { label: 'Outro',    icon: MoreHorizontal, color: '#6B7280', bg: '#F9FAFB' },
  };

  function getCategoryInfo(category) {
    if (!category) return CATEGORY_CONFIG.outro;
    const key = category.toLowerCase().replace(/\s+/g, '');
    return CATEGORY_CONFIG[key] ?? CATEGORY_CONFIG.outro;
  }

  // ─── State ───────────────────────────────────────────────────
  let tasks   = [];
  let loading = true;
  let error   = null;

  // Detail modal
  let selectedTask      = null;
  let newSubtaskTitle   = '';
  let addingSubtask     = false;
  let deletingTask      = false;
  let earnedXP          = 0; // XP earned when teacher grades the task

  // Check if task was created by professor (assigned)
  function isProfessorTask(task) {
    return !!(task.assigned_by_id ?? task.AssignedByID ?? task.assignedBy);
  }

  // Create modal
  let showCreate       = false;
  let createForm       = { title: '', description: '', due_date: '', priority: 'medium', status: 'todo', category: 'outro', completion_threshold: 80 };
  let creating         = false;
  let createError      = null;
  let createSubtasks   = [];
  let newSubtaskDraft  = '';

  // Drag and drop
  let dragTaskId     = null;
  let dragOverStatus = null;

  // Valid column transitions for process flow
  const VALID_TRANSITIONS = {
    todo:   ['doing'],
    doing:  ['todo', 'review', 'done'],
    review: ['todo', 'doing', 'done'],
    done:   [],
  };

  // Quiz/Assessment navigation
  function startQuiz(task) {
    selectedTask = null;
    onNavigate('student-quiz', { taskId: String(task.id) });
  }



  // ─── Derived ─────────────────────────────────────────────────
  $: columns = COLUMNS.map(col => ({
    ...col,
    cards: tasks.filter(t => t.status === col.status),
  }));

  $: totalCards = tasks.length;
  $: doneCards  = tasks.filter(t => t.status === 'done').length;
  $: pct        = totalCards ? Math.round(doneCards / totalCards * 100) : 0;
  $: validDropStatuses = dragTaskId
    ? (VALID_TRANSITIONS[tasks.find(t => t.id === dragTaskId)?.status] || [])
    : [];

  // ─── Load ────────────────────────────────────────────────────
  onMount(loadTasks);

  async function loadTasks() {
    loading = true;
    error   = null;
    try {
      tasks = await api.tasks.list() ?? [];
    } catch {
      error = 'Erro ao carregar tarefas. Verifique sua conexão.';
    } finally {
      loading = false;
    }
  }

  // ─── Create task ─────────────────────────────────────────────
  function openCreate(initialStatus = 'todo') {
    createForm      = { title: '', description: '', due_date: '', priority: 'medium', status: initialStatus };
    createError     = null;
    createSubtasks  = [];
    newSubtaskDraft = '';
    showCreate      = true;
  }

  function addCreateSubtask() {
    const t = newSubtaskDraft.trim();
    if (!t) return;
    createSubtasks  = [...createSubtasks, t];
    newSubtaskDraft = '';
  }

  function removeCreateSubtask(i) {
    createSubtasks = createSubtasks.filter((_, idx) => idx !== i);
  }

  function handleSubtaskDraftKeydown(e) {
    if (e.key === 'Enter') { e.preventDefault(); addCreateSubtask(); }
  }

  async function submitCreate() {
    if (!createForm.title.trim()) { createError = 'O título é obrigatório'; return; }
    creating    = true;
    createError = null;
    try {
      const body = {
        title:              createForm.title.trim(),
        description:        createForm.description.trim() || undefined,
        priority:           createForm.priority,
        status:             createForm.status,
        due_date:           createForm.due_date ? new Date(createForm.due_date).toISOString() : undefined,
        category:           createForm.category,
        completion_threshold: Number(createForm.completion_threshold) || 80,
      };
      const task = await api.tasks.create(body);

      // Create subtasks sequentially
      const subtasks = [];
      for (const title of createSubtasks) {
        try {
          const st = await api.tasks.subtasks.create(task.id, { title });
          subtasks.push(st);
        } catch {}
      }

      tasks      = [{ ...task, subtasks }, ...tasks];
      showCreate = false;
    } catch {
      createError = 'Erro ao criar tarefa. Tente novamente.';
    } finally {
      creating = false;
    }
  }

  // ─── Move task (status) ───────────────────────────────────────
  async function moveTask(taskId, newStatus) {
    const prev = tasks.find(t => t.id === taskId);
    if (!prev || prev.status === newStatus) return;

    // Validate process flow transition
    const allowed = VALID_TRANSITIONS[prev.status] || [];
    if (!allowed.includes(newStatus)) {
      showToast(`Não é permitido mover de "${getStatusLabel(prev.status)}" para "${getStatusLabel(newStatus)}". Passe primeiro por "Fazendo".`, 'warning');
      return;
    }

    // Do not automatically navigate to quiz for student tasks - let the user decide
    // The task completion and XP handling will be done through the quiz submission process itself
    if (newStatus === 'done' && (prev.assessment_method === 'quiz' || prev.assessment_method === 'essay' || prev.has_quiz)) {
      // Only navigate for teacher-assigned tasks that require quiz/essay
      if (isProfessorTask(prev)) {
        startQuiz(prev);
        return;
      }
    }

    tasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    if (selectedTask?.id === taskId) selectedTask = { ...selectedTask, status: newStatus };
    try {
      await api.tasks.update(taskId, { status: newStatus });
    } catch {
      tasks = tasks.map(t => t.id === taskId ? prev : t);
      if (selectedTask?.id === taskId) selectedTask = prev;
    }
  }

  // ─── Delete task ──────────────────────────────────────────────
  async function deleteTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task && isProfessorTask(task)) return; // prevent deletion
    if (!confirm('Remover esta tarefa?')) return;
    deletingTask = true;
    const prev   = tasks.find(t => t.id === taskId);
    tasks        = tasks.filter(t => t.id !== taskId);
    selectedTask = null;
    try {
      await api.tasks.delete(taskId);
    } catch {
      tasks = [...tasks, prev];
    } finally {
      deletingTask = false;
    }
  }

  // ─── Detail modal ─────────────────────────────────────────────
  function openTask(task) {
    selectedTask    = { ...task, subtasks: task.subtasks ? [...task.subtasks] : [] };
    newSubtaskTitle = '';
  }

  function closeTask() {
    selectedTask    = null;
    newSubtaskTitle = '';
  }

  // ─── Subtasks ─────────────────────────────────────────────────
  async function toggleSubtask(subtask) {
    const taskId  = selectedTask.id;
    const updated = { ...subtask, completed: !subtask.completed };
    selectedTask  = { ...selectedTask, subtasks: selectedTask.subtasks.map(s => s.id === subtask.id ? updated : s) };
    tasks         = tasks.map(t => t.id === taskId ? { ...t, subtasks: selectedTask.subtasks } : t);
    try {
      await api.tasks.subtasks.update(taskId, subtask.id, { completed: !subtask.completed });
    } catch {
      await loadTasks();
    }
  }

  async function addSubtask() {
    if (!newSubtaskTitle.trim() || addingSubtask) return;
    if (selectedTask && isProfessorTask(selectedTask)) return; // prevent adding subtasks to professor tasks
    addingSubtask = true;
    try {
      const subtask = await api.tasks.subtasks.create(selectedTask.id, { title: newSubtaskTitle.trim() });
      selectedTask  = { ...selectedTask, subtasks: [...(selectedTask.subtasks ?? []), subtask] };
      tasks         = tasks.map(t => t.id === selectedTask.id ? { ...t, subtasks: selectedTask.subtasks } : t);
      newSubtaskTitle = '';
    } catch {
      // keep input for retry
    } finally {
      addingSubtask = false;
    }
  }

  async function deleteSubtask(subtaskId) {
    if (selectedTask && isProfessorTask(selectedTask)) return; // prevent deleting subtasks from professor tasks
    const taskId = selectedTask.id;
    selectedTask = { ...selectedTask, subtasks: selectedTask.subtasks.filter(s => s.id !== subtaskId) };
    tasks        = tasks.map(t => t.id === taskId ? { ...t, subtasks: selectedTask.subtasks } : t);
    try {
      await api.tasks.subtasks.delete(taskId, subtaskId);
    } catch {
      await loadTasks();
    }
  }

  function handleSubtaskKeydown(e) {
    if (e.key === 'Enter') addSubtask();
  }

  // ─── Drag and Drop ────────────────────────────────────────────
  function onDragStart(e, task) {
    dragTaskId = task.id;
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragOver(e, status) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverStatus = status;
  }

  function onDragLeave() {
    dragOverStatus = null;
  }

  async function onDrop(e, status) {
    e.preventDefault();
    dragOverStatus = null;
    if (dragTaskId) {
      await moveTask(dragTaskId, status);
      dragTaskId = null;
    }
  }

  function onDragEnd() {
    dragTaskId     = null;
    dragOverStatus = null;
  }

  // ─── Helpers ──────────────────────────────────────────────────
  function getStatusLabel(status) {
    return COLUMNS.find(c => c.status === status)?.label || status;
  }

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
<AppLayout title="Kanban" breadcrumbs={[{label:'Aluno'},{label:'Kanban'}]} active="kanban" {onNavigate}>
   <div class="px-2 md:px-4 pb-2 md:pb-4 overflow-hidden">
    <PageHeader
      title="Quadro Kanban"
      subtitle="{totalCards} {totalCards === 1 ? 'tarefa' : 'tarefas'} · {pct}% concluídas"
      actions={[{ label:'+ Nova', variant:'primary', onClick: () => openCreate() }]}
    />

   <!-- Progress bar -->
   <div class="flex flex-col md:flex-row items-center gap-3 md:gap-4 mb-5 md:mb-6 bg-white rounded-12 md:rounded-14 p-3 md:p-4 border border-slate-200">
     <div class="flex-1 w-full md:w-auto">
       <div class="flex justify-between items-center mb-1.5">
         <span class="text-[12px] md:text-[13px] font-bold text-slate-700">Progresso geral</span>
         <span class="text-[12px] md:text-[13px] font-black text-slate-900">{doneCards}/{totalCards} {totalCards === 1 ? 'tarefa' : 'tarefas'}</span>
       </div>
       <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
         <div class="h-full rounded-full transition-all duration-500" style="width:{pct}%;background:linear-gradient(90deg,#004E98,#4CD964);" />
       </div>
     </div>
     <div class="text-[24px] md:text-[28px] font-black text-slate-900 flex-shrink-0">{pct}%</div>
   </div>

   <!-- Loading / Error -->
   {#if loading}
     <div class="flex items-center justify-center h-40 md:h-48 text-slate-400 text-[13px] md:text-[14px]">Carregando tarefas...</div>
   {:else if error}
     <div class="flex flex-col items-center justify-center h-40 md:h-48 gap-3">
       <p class="text-slate-500 text-[13px] md:text-[14px]">{error}</p>
       <button class="px-3 md:px-4 py-2 bg-blue-600 text-white text-[12px] md:text-[13px] font-semibold rounded-10" on:click={loadTasks}>Tentar novamente</button>
     </div>
   {:else}
   <!-- Columns -->
   <div class="flex flex-nowrap gap-2 md:gap-3 overflow-x-auto scrollbar-none">
     {#each columns as col}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="rounded-16 p-2.5 md:p-3 flex flex-col gap-2 min-h-[300px] md:min-h-[400px] transition-colors flex-1 min-w-[300px] md:min-w-[260px]"
          style="
            background:{dragTaskId && dragOverStatus === col.status && validDropStatuses.includes(col.status) ? '#EFF6FF' : '#F8FAFC'};
            border:1.5px {dragTaskId && dragOverStatus === col.status && validDropStatuses.includes(col.status) ? 'dashed #004E98' : 'solid #E2E8F0'};
          "
         on:dragover={(e) => onDragOver(e, col.status)}
         on:dragleave={onDragLeave}
         on:drop={(e) => onDrop(e, col.status)}
       >
          <!-- Column header -->
          <div class="flex items-center gap-2 px-1 mb-1">
            <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:{col.color};" />
            <p class="flex-1 text-[13px] font-black text-slate-800 tracking-tight">{col.label}</p>
            <span class="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">{col.cards.length}</span>
          </div>

          <!-- Cards -->
          {#each col.cards as card (card.id)}
            {@const due     = formatDate(card.due_date)}
            {@const { total: stTotal, done: stDone } = subtaskProgress(card)}
            {@const isDone  = card.status === 'done'}
            {@const awaitingCorrection = isDone && card.awaiting_correction}
            {@const catInfo = getCategoryInfo(card.category)}
             <!-- svelte-ignore a11y-no-static-element-interactions -->
             <div
               draggable="true"
               class="rounded-12 p-2 md:p-3 cursor-pointer hover:shadow-md transition-all select-none"
               style="
                 background:{awaitingCorrection ? '#F8FAFC' : 'white'};
                 border:1.5px solid {dragTaskId === card.id ? '#004E98' : (isDone ? '#E2E8F0' : '#E4E4E7')};
                 box-shadow:{dragTaskId === card.id ? '0 4px 12px rgba(0,78,152,0.15)' : 'none'};
                 opacity:{dragTaskId === card.id ? 0.6 : (awaitingCorrection ? 0.7 : (isDone ? 0.65 : 1))};
               "
              on:dragstart={(e) => onDragStart(e, card)}
              on:dragend={onDragEnd}
              on:click={() => openTask(card)}
            >
               <!-- Badges row: category, subject, priority -->
              <div class="flex flex-wrap gap-0.5 mb-1">
                <!-- Category badge with icon -->
                {#if catInfo.icon}
                  {@const CatIcon = catInfo.icon}
                  <span class="inline-flex items-center gap-0.5 px-1 py-0.375 rounded-md text-[9px] font-black uppercase tracking-wider whitespace-nowrap"
                    style="background:{catInfo.bg}; color:{catInfo.color};">
                    <CatIcon size={9} />
                    {catInfo.label}
                  </span>
                {:else}
                  <span class="inline-flex items-center gap-0.5 px-1 py-0.375 rounded-md text-[9px] font-black uppercase tracking-wider whitespace-nowrap"
                    style="background:{catInfo.bg}; color:{catInfo.color};">
                    {catInfo.label}
                  </span>
                {/if}

                <!-- Subject badge -->
                {#if card.subject_name}
                  <span class="inline-flex items-center px-1 py-0.375 rounded-md text-[9px] font-black uppercase tracking-wider whitespace-nowrap"
                    style="background:{card.subject_color || '#64748B'}22; color:{card.subject_color || '#64748B'};">
                    {card.subject_name}
                  </span>
                {/if}

                <!-- Priority badge -->
                <span class="inline-flex items-center px-1 py-0.375 rounded-md text-[9px] font-black uppercase tracking-wider whitespace-nowrap"
                  style="background:{PRIORITY_COLORS[card.priority] || '#94A3B8'}22; color:{PRIORITY_COLORS[card.priority] || '#94A3B8'};">
                  {PRIORITY_LABELS[card.priority] || 'Média'}
                </span>
              </div>

              <p class="text-[12px] md:text-[13px] font-semibold text-slate-800 tracking-tight leading-snug mb-1.5"
                style="text-decoration:{isDone ? 'line-through' : 'none'};">{card.title}</p>

              <!-- Subtask progress -->
              {#if stTotal > 0}
                <div class="h-1.5 bg-slate-100 rounded-sm overflow-hidden mb-1">
                  <div class="h-full rounded-sm transition-all" style="width:{stTotal > 0 ? Math.round(stDone/stTotal*100) : 0}%;background:{col.color};" />
                </div>
                <div class="flex justify-between text-[9px] md:text-[10px] text-slate-500 font-semibold mb-1">
                  <span>{stDone}/{stTotal} subtarefas</span>
                </div>
              {/if}

              <!-- Due date at bottom of card -->
              {#if due}
                <div class="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100">
                  <span style="color:{dateIsUrgent(due) ? '#EF4444' : '#94A3B8'};" class="text-[9px] md:text-[10px] font-semibold flex items-center gap-0.5">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {due}
                  </span>
                </div>
              {/if}

              {#if isDone}
                <!-- Awaiting correction badge -->
                {#if card.awaiting_correction}
                  <div class="flex items-center gap-0.5 text-[9px] font-bold text-slate-500 mt-1">
                    <svg width="9" height="9" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#6B7280" stroke-width="2.5" fill="none"/><path d="M12 8v4m0 4h.01" stroke="#6B7280" stroke-width="2" stroke-linecap="round"/></svg>
                    Aguardando
                  </div>
                {/if}
                <!-- XP badge - shown when task is graded and score meets threshold -->
                {#if card.xp > 0 && !card.awaiting_correction}
                  <div class="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 mt-1">
                    ⚡ +{card.xp} XP
                  </div>
                {:else if (card.IsRewarded === true || card.is_rewarded === true) && !card.awaiting_correction}
                  <div class="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 mt-1">
                    ⚡ +10 XP
                  </div>
                {/if}
              {/if}
            </div>
          {/each}

           <!-- Add card button -->
           <!-- svelte-ignore a11y-no-static-element-interactions -->
           <!-- svelte-ignore a11y-click-events-have-key-events -->
           <div
             class="py-2 text-center text-[11px] md:text-[12px] text-slate-400 font-bold rounded-12 cursor-pointer hover:bg-white hover:text-slate-600 transition-all mt-auto"
             style="border:1.5px dashed #CBD5E1;"
             on:click={() => openCreate(col.status)}
           >
             + Novo
           </div>
        </div>
      {/each}
    </div>
  {/if}
</AppLayout>

<!-- ══════════════════════════ CREATE MODAL ══════════════════════════ -->
<Modal open={showCreate} title="Nova tarefa" onClose={() => showCreate = false} width="680px" maxWidth="95vw">
  <div class="px-4 md:px-6 py-4 md:py-5 flex flex-col gap-3 md:gap-4">

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

    <div class="grid grid-cols-2 gap-2 md:gap-3">
       <div class="flex flex-col gap-1">
         <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Categoria</label>
         <select
           bind:value={createForm.category}
           class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
         >
           <option value="estudo">Estudo</option>
           <option value="leitura">Leitura</option>
           <option value="exercicios">Exercícios</option>
           <option value="trabalho">Trabalho</option>
           <option value="pesquisa">Pesquisa</option>
           <option value="apresentacao">Apresentação</option>
           <option value="filme">Filme</option>
           <option value="redacao">Redação</option>
           <option value="outro">Outro</option>
         </select>
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

     <div class="grid grid-cols-2 gap-2 md:gap-3">
       <div class="flex flex-col gap-1">
         <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Coluna</label>
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

       <div class="flex flex-col gap-1">
         <label class="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Prazo</label>
         <input
           type="datetime-local"
           bind:value={createForm.due_date}
           class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500"
         />
       </div>
     </div>

     <!-- Subtasks -->
      <div class="flex flex-col gap-2">
        <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Subtarefas</label>

        {#if createSubtasks.length > 0}
          <ul class="flex flex-col gap-1.5 mb-1">
            {#each createSubtasks as st, i}
              <li class="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-10 group">
                <span class="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0"></span>
                <span class="flex-1 text-[13px] text-slate-700 truncate">{st}</span>
                <button
                  class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-slate-300 hover:text-red-400 text-[16px] leading-none px-0.5 md:px-1"
                  on:click={() => removeCreateSubtask(i)}
                  title="Remover subtarefa"
                >×</button>
              </li>
            {/each}
          </ul>
        {/if}

        <div class="flex gap-1.5 md:gap-2 mb-3 md:mb-4">
          <input
            type="text"
            bind:value={newSubtaskDraft}
            placeholder="Adicionar subtarefa..."
            on:keydown={handleSubtaskDraftKeydown}
            class="flex-1 px-2.5 md:px-3 py-1.5 md:py-2 rounded-10 text-[12px] md:text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            class="px-2 md:px-3 py-1.5 md:py-2 rounded-10 text-[12px] md:text-[13px] font-bold text-white transition-opacity flex-shrink-0"
            style="background:#004E98;opacity:{addingSubtask || !newSubtaskTitle.trim() ? 0.5 : 1};"
            disabled={addingSubtask || !newSubtaskTitle.trim()}
            on:click={addCreateSubtask}
          >{addingSubtask ? '...' : '+ Add'}</button>
        </div>

        <div class="flex justify-end pt-2 md:pt-3 border-t border-slate-100">
          <button
            class="px-3 md:px-4 py-1.5 md:py-2 rounded-10 text-[11px] md:text-[12px] font-bold text-red-400 hover:bg-red-50 transition-colors"
            disabled={creating}
            on:click={() => showCreate = false}
          >Cancelar</button>
        </div>
      </div>
   </div>
</Modal>

<Toast />

<!-- Quiz is now handled by the dedicated /s/quiz page (QuizPage.svelte) -->
