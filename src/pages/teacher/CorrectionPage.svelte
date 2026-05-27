<script>
  import { onMount } from 'svelte';
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import { api }   from '../../lib/api.js';
  import {
    AlertTriangle, Check, X, Clock, User, CheckCircle2, FileText
  } from 'lucide-svelte';

  export let onNavigate = (id) => {};
  export let id = null; // attempt ID passed as nav param

  let attempt = null;
  let loading  = true;
  let gradingForm = { answers: [] };
  let submitting  = false;
  let submitted   = false;
  let tabDetails  = [];
  let activeTab   = 'answers'; // 'answers' | 'tabswitches'

  onMount(async () => {
    if (!id) { onNavigate('teacher-corrections'); return; }
    await loadAttempt();
  });

  async function loadAttempt() {
    loading = true;
    try {
      attempt = await api.teacher.attempts.get(id);

      // Parse tab switch details
      if (attempt?.TabSwitchesDetails) {
        try {
          tabDetails = JSON.parse(attempt.TabSwitchesDetails) ?? [];
        } catch {
          tabDetails = [];
        }
      }

      // Build grading form for open / essay answers only
      gradingForm.answers = (attempt?.Answers ?? [])
        .filter(ans => {
          const t = ans.Question?.Type ?? ans.Question?.type;
          return t === 'open' || t === 'essay';
        })
        .map(ans => ({
          answer_id:       ans.ID ?? ans.id,
          grade:           ans.Grade !== null && ans.Grade !== undefined ? ans.Grade : 100,
          feedback:        ans.Feedback ?? ans.feedback ?? '',
          question_prompt: ans.Question?.Prompt ?? ans.Question?.prompt,
          question_type:   ans.Question?.Type  ?? ans.Question?.type,
          student_text:    (ans.Question?.Type ?? ans.Question?.type) === 'essay' ? ans.EssayText : ans.OpenAnswerText,
        }));
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar tentativa.');
      onNavigate('teacher-corrections');
    } finally {
      loading = false;
    }
  }

  async function submitGrades() {
    submitting = true;
    try {
      await api.teacher.attempts.grade(id, {
        answers: gradingForm.answers.map(a => ({
          answer_id: a.answer_id,
          grade:     Number(a.grade),
          feedback:  a.feedback,
        })),
      });
      submitted = true;
    } catch (err) {
      alert('Erro ao salvar notas. Tente novamente.');
    } finally {
      submitting = false;
    }
  }

  function formatTime(sec) {
    if (!sec) return '0s';
    if (sec < 60) return `${Math.round(sec)}s`;
    return `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`;
  }

  // Normalize option index for comparison - handles both capitalized and lowercase keys
  function getOptionIndex(opt) {
    const val = opt?.Index ?? opt?.index;
    return val !== null && val !== undefined ? Number(val) : null;
  }
  function getStudentSelection(ans) {
    const val = ans?.SelectedOptionIndex ?? ans?.selected_option_index;
    return val !== null && val !== undefined ? Number(val) : null;
  }
  function getCorrectIndex(q) {
    const val = q?.CorrectOptionIndex ?? q?.correct_option_index;
    return val !== null && val !== undefined ? Number(val) : null;
  }
</script>

<AppLayout
  title="Corrigir Tarefa"
  breadcrumbs={[{label:'Professor'},{label:'Correções'},{label:'Corrigir Tarefa'}]}
  active="teacher-corrections"
  {onNavigate}
>
  {#if loading}
    <div class="h-[50vh] flex items-center justify-center">
      <div class="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
    </div>
  {:else if submitted}
    <!-- Success screen -->
    <div class="max-w-[580px] mx-auto mt-10 bg-white border border-slate-200 rounded-24 p-10 shadow-xl flex flex-col items-center text-center gap-6">
      <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
        <CheckCircle2 size={36} />
      </div>
      <div>
        <h2 class="text-[24px] font-black text-slate-800 tracking-tight mb-2">Correção salva!</h2>
        <p class="text-slate-500 text-[14px]">As notas e feedbacks foram registrados e a tarefa do aluno foi marcada como concluída.</p>
      </div>
      <button
        class="w-full py-3 rounded-12 text-[14px] font-bold text-white"
        style="background:#004E98;"
        on:click={() => onNavigate('teacher-corrections')}
      >
        Voltar para Correções
      </button>
    </div>
  {:else if attempt}
    <div class="max-w-[860px] mx-auto flex flex-col gap-6">

      <!-- Header row -->
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-[24px] font-black text-slate-800 tracking-tight leading-tight">
            {attempt.Task?.Title || attempt.Task?.title || 'Tarefa sem título'}
          </h1>
          <p class="text-slate-500 text-[13px] mt-1">Corrigindo a submissão de <strong class="text-slate-700">{attempt.User?.Name ?? attempt.User?.name ?? 'Aluno'}</strong></p>
        </div>
        <button
          class="px-4 py-2 rounded-10 text-[12px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          on:click={() => onNavigate('teacher-corrections')}
        >
          ← Voltar
        </button>
      </div>

      <!-- Meta info cards -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white border border-slate-200 rounded-16 p-4 shadow-sm">
          <div class="flex items-center gap-2 mb-1.5 text-slate-500">
            <User size={14} /> <span class="text-[10px] font-bold uppercase tracking-wider">Aluno</span>
          </div>
          <p class="font-black text-slate-800 text-[14px]">{attempt.User?.Name ?? attempt.User?.name ?? '—'}</p>
        </div>
        <div class="bg-white border border-slate-200 rounded-16 p-4 shadow-sm">
          <div class="flex items-center gap-2 mb-1.5 text-slate-500">
            <Clock size={14} /> <span class="text-[10px] font-bold uppercase tracking-wider">Tempo Total</span>
          </div>
          <p class="font-black text-slate-800 text-[14px]">{formatTime(attempt.TotalTimeSeconds ?? attempt.total_time_seconds)}</p>
        </div>
        <div class="rounded-16 p-4 shadow-sm border {(attempt.TabSwitches ?? attempt.tab_switches) > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}">
          <div class="flex items-center gap-2 mb-1.5 {(attempt.TabSwitches ?? attempt.tab_switches) > 0 ? 'text-rose-600' : 'text-emerald-600'}">
            <AlertTriangle size={14} /> <span class="text-[10px] font-bold uppercase tracking-wider">Desvios de Aba</span>
          </div>
          <p class="font-black text-[14px] {(attempt.TabSwitches ?? attempt.tab_switches) > 0 ? 'text-rose-700' : 'text-emerald-700'}">
            {attempt.TabSwitches ?? attempt.tab_switches} desvio(s)
          </p>
        </div>
      </div>

      <!-- Tab Switch Log (if any) -->
      {#if tabDetails.length > 0}
        <div class="bg-white border border-slate-200 rounded-16 shadow-sm overflow-hidden">
          <div class="px-5 py-3 bg-rose-50 border-b border-rose-200 flex items-center gap-2">
            <AlertTriangle size={15} class="text-rose-600" />
            <h3 class="text-[13px] font-black text-rose-700">Log de Desvios de Aba</h3>
            <span class="ml-auto text-[11px] text-rose-500 font-semibold">{tabDetails.length} evento(s) registrado(s)</span>
          </div>
          <div class="divide-y divide-slate-100">
            {#each tabDetails as entry, i}
              <div class="flex items-start gap-3 px-5 py-3 text-[12.5px]">
                <span class="mt-0.5 font-black text-rose-500 shrink-0">#{i + 1}</span>
                <div class="flex-1">
                  <span class="font-bold text-slate-700">{entry.time}</span>
                  <span class="mx-2 text-slate-400">·</span>
                  <span class="text-slate-600">{entry.event}</span>
                  {#if entry.duration !== undefined}
                    <span class="ml-2 px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[11px]">
                      Fora por {entry.duration}s
                    </span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Tabs: Respostas and Desvios de Aba -->
      <div class="bg-white border border-slate-200 rounded-16 shadow-sm overflow-hidden">
        <!-- Tab navigation -->
        <div class="flex border-b border-slate-200">
          <button
            class="px-5 py-3 text-[13px] font-bold transition-colors {activeTab === 'answers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}"
            on:click={() => activeTab = 'answers'}
          >Respostas</button>
          <button
            class="px-5 py-3 text-[13px] font-bold transition-colors flex items-center gap-2 {activeTab === 'tabswitches' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}"
            on:click={() => activeTab = 'tabswitches'}
          >
            Desvios de Aba
            {#if tabDetails.length > 0}
              <span class="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-600">{tabDetails.length}</span>
            {/if}
          </button>
        </div>

        <!-- Answers tab content -->
        {#if activeTab === 'answers'}
          <div class="p-5">
            <!-- Multiple Choice results (read-only) -->
      {#each (attempt.Answers ?? []) as ans}
        {@const qType = ans.Question?.Type ?? ans.Question?.type}
        {#if qType === 'multiple_choice'}
          <div class="bg-white border border-slate-200 rounded-16 p-5 shadow-sm flex flex-col gap-3">
            <!-- Header -->
            <div class="flex justify-between items-center">
              <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">Múltipla Escolha</span>
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-slate-400">{formatTime(ans.TimeSpentSeconds)}</span>
                {#if (ans.Status ?? ans.status) === 'correct'}
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700">
                    <Check size={10}/> Correto
                  </span>
                {:else}
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700">
                    <X size={10}/> Incorreto
                  </span>
                {/if}
              </div>
            </div>

            <!-- Enunciado -->
            <p class="text-[14px] font-black text-slate-800 leading-snug">
              {ans.Question?.Prompt ?? ans.Question?.prompt}
            </p>

            <!-- Options -->
            <div class="flex flex-col gap-2">
              {#each (ans.Question?.Options ?? ans.Question?.options ?? []) as opt}
                {@const optIdx     = getOptionIndex(opt)}
                {@const studentSel = getStudentSelection(ans)}
                {@const correctIdx = getCorrectIndex(ans.Question)}
                {@const isStudent  = studentSel === optIdx}
                {@const isCorrect  = correctIdx === optIdx}
                <div class="flex items-center gap-2.5 px-3 py-2.5 rounded-12 border text-[13px] font-semibold
                  {isCorrect && isStudent ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : isStudent ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : isCorrect ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600'}">
                  <span class="w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] shrink-0
                    {isCorrect && isStudent ? 'bg-emerald-500 text-white'
                    : isStudent ? 'bg-rose-500 text-white'
                    : isCorrect ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-500'}">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span class="flex-1">{opt.Text ?? opt.text}</span>
                  {#if isStudent && isCorrect}
                    <span class="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800">✓ Marcado · Gabarito</span>
                  {:else if isStudent}
                    <span class="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-200 text-rose-800">Marcado pelo aluno</span>
                  {:else if isCorrect}
                    <span class="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800">Gabarito</span>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      {/each}

            <!-- Open / Essay grading -->
            {#if gradingForm.answers.length > 0}
              <div class="flex flex-col gap-4 mt-6 pt-6 border-t border-slate-200">
                <h3 class="text-[12px] font-extrabold text-slate-500 uppercase tracking-wider">Avaliação Manual — Questões Abertas/Redações</h3>
          {#each gradingForm.answers as ans, i}
            <div class="bg-white border border-slate-200 rounded-16 p-5 shadow-sm flex flex-col gap-4">
              <div class="flex justify-between items-center">
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded {ans.question_type === 'essay' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}">
                  {ans.question_type === 'essay' ? 'Redação' : 'Dissertativa'}
                </span>
              </div>

              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Enunciado</p>
                <p class="text-[13.5px] text-slate-800 font-bold bg-slate-50 px-3 py-2.5 rounded-10 border border-slate-200 leading-relaxed">{ans.question_prompt}</p>
              </div>

              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Resposta do Aluno</p>
                <div class="text-[13.5px] text-slate-700 bg-slate-50 p-4 rounded-12 border border-slate-200 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                  {ans.student_text || '(sem resposta)'}
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3 items-end pt-3 border-t border-slate-100">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nota (0–100)</label>
                  <input
                    type="number" min="0" max="100"
                    bind:value={gradingForm.answers[i].grade}
                    class="w-full px-3 py-2 rounded-8 text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500 bg-white font-bold text-slate-800"
                  />
                </div>
                <div class="flex flex-col gap-1 col-span-2">
                  <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Feedback do Professor</label>
                  <input
                    type="text"
                    bind:value={gradingForm.answers[i].feedback}
                    placeholder="Ótimo trabalho, mas poderia melhorar em..."
                    class="w-full px-3 py-2 rounded-8 text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>
          {/each}
              </div>
            {/if}
          </div>
        {:else if activeTab === 'tabswitches'}
          <div class="p-5">
            {#if tabDetails.length > 0}
              <div class="flex flex-col gap-3">
                {#each tabDetails as entry, i}
                  <div class="flex items-start gap-3 px-4 py-3 rounded-12 bg-rose-50 border border-rose-200 text-[12.5px]">
                    <span class="mt-0.5 font-black text-rose-500 shrink-0">#{i + 1}</span>
                    <div class="flex-1">
                      <span class="font-bold text-slate-700">{entry.time}</span>
                      <span class="mx-2 text-slate-400">·</span>
                      <span class="text-slate-600">{entry.event}</span>
                      {#if entry.duration !== undefined}
                        <span class="ml-2 px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[11px]">
                          Fora por {entry.duration}s
                        </span>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="text-center py-8 text-slate-400">
                <p class="text-[13px] font-semibold">Nenhum desvio de aba registrado.</p>
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Action buttons -->
      <div class="flex gap-3 pb-6">
        <button
          class="flex-1 py-3 rounded-12 text-[13px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          on:click={() => onNavigate('teacher-corrections')}
        >Cancelar</button>
        <button
          class="flex-1 py-3 rounded-12 text-[13px] font-bold text-white transition-opacity shadow-md"
          style="background:#004E98; opacity:{submitting ? 0.6 : 1};"
          disabled={submitting}
          on:click={submitGrades}
        >{submitting ? 'Salvando...' : 'Finalizar Correção'}</button>
      </div>

    </div>
  {/if}
</AppLayout>
