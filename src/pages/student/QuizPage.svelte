<script>
  import { onMount } from 'svelte';
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import { api }      from '../../lib/api.js';
  import {
    ArrowRight, ArrowLeft, Send, CheckCircle2
  } from 'lucide-svelte';

  export let onNavigate = (id) => {};
  export let taskId = null;

  let loading = true;
  let task = null;
  let questions = [];
  let currentQuestionIndex = 0;
  let answers = [];
  let tabSwitches = 0;
  let tabSwitchesLog = [];
  let currentBlurStart = null;
  let startTime = 0;
  let questionStartTime = 0;
  let submitting = false;
  let quizResult = null;
  let elapsedSeconds = 0;
  let timerInterval = null;

  let unsubscribeBlur = null;
  let unsubscribeFocus = null;

  onMount(async () => {
    if (!taskId) {
      alert('Nenhuma tarefa especificada.');
      onNavigate('kanban');
      return;
    }
    await loadQuiz();
    setupTabTracking();
    
    // Start timer
    startTime = Date.now();
    elapsedSeconds = 0;
    timerInterval = setInterval(() => {
      elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    }, 1000);
    
    return () => {
      cleanupTabTracking();
      if (timerInterval) clearInterval(timerInterval);
    };
  });

  async function loadQuiz() {
    loading = true;
    try {
      // Load task details first
      const allTasks = await api.tasks.list() ?? [];
      task = allTasks.find(t => t.id === Number(taskId));

      // Load quiz questions
      questions = await api.tasks.quiz.get(taskId) ?? [];
      if (questions.length === 0 && task?.assessment_method === 'essay') {
        questions = [{
          id: 0,
          type: 'essay',
          prompt: task.description || 'Tema da Redação: Desenvolva uma dissertação sobre os assuntos propostos na tarefa.'
        }];
      }

      answers = questions.map(q => ({
        question_id: q.id,
        selected_option_index: null,
        open_answer_text: '',
        essay_text: '',
        time_spent_seconds: 0
      }));

      startTime = performance.now();
      questionStartTime = performance.now();
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar a avaliação. Tente novamente.');
      onNavigate('kanban');
    } finally {
      loading = false;
    }
  }

  function setupTabTracking() {
    const handleBlur = () => {
      tabSwitches++;
      currentBlurStart = performance.now();
      const timeStr = new Date().toLocaleTimeString('pt-BR');
      tabSwitchesLog = [...tabSwitchesLog, {
        time: timeStr,
        event: 'Foco perdido (saiu da aba ou minimizou a janela)'
      }];
    };

    const handleFocus = () => {
      if (currentBlurStart !== null) {
        const duration = Math.round((performance.now() - currentBlurStart) / 1000);
        currentBlurStart = null;
        if (tabSwitchesLog.length > 0) {
          const last = tabSwitchesLog[tabSwitchesLog.length - 1];
          last.duration = duration;
          tabSwitchesLog = [...tabSwitchesLog];
        }
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    unsubscribeBlur = () => window.removeEventListener('blur', handleBlur);
    unsubscribeFocus = () => window.removeEventListener('focus', handleFocus);
  }

  function cleanupTabTracking() {
    if (unsubscribeBlur) unsubscribeBlur();
    if (unsubscribeFocus) unsubscribeFocus();
  }

  function saveQuestionTime() {
    const now = performance.now();
    const elapsed = (now - questionStartTime) / 1000;
    if (answers[currentQuestionIndex]) {
      answers[currentQuestionIndex].time_spent_seconds += elapsed;
    }
    questionStartTime = now;
  }

  function nextQuestion() {
    saveQuestionTime();
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
    } else {
      submitQuiz();
    }
  }

  function prevQuestion() {
    saveQuestionTime();
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
    }
  }

  async function submitQuiz() {
    saveQuestionTime();
    
    // Ensure last blur is closed if submitting from blur
    if (currentBlurStart !== null) {
      handleFocus();
    }

    submitting = true;
    try {
      const totalTime = (performance.now() - startTime) / 1000;
      const body = {
        tab_switches: tabSwitches,
        tab_switches_details: JSON.stringify(tabSwitchesLog),
        total_time_seconds: totalTime,
        answers: answers
      };

      const res = await api.tasks.quiz.submit(taskId, body);
      quizResult = res;
    } catch (err) {
      alert('Erro ao enviar quiz. Verifique suas respostas e tente novamente.');
    } finally {
      submitting = false;
    }
  }

  function formatTime(sec) {
    if (!sec) return '0s';
    if (sec < 60) return `${Math.round(sec)}s`;
    return `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`;
  }
</script>

<AppLayout
  title="Realizar Avaliação"
  breadcrumbs={[{label:'Estudante'},{label:'Kanban', id:'kanban'},{label:'Avaliação'}]}
  active="student-kanban"
  {onNavigate}
>
  {#if loading}
    <div class="h-[60vh] flex flex-col items-center justify-center gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      <p class="text-slate-500 font-semibold text-[14px]">Preparando seu ambiente de avaliação...</p>
    </div>
  {:else if quizResult}
    <!-- Success screen -->
      <div class="max-w-[620px] mx-auto mt-10 bg-white border border-slate-200 rounded-24 p-8 shadow-xl text-center flex flex-col items-center">
        <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6 animate-bounce">
          <CheckCircle2 size={36} />
        </div>
        <h2 class="text-[26px] font-black text-slate-800 tracking-tight mb-2">Avaliação Entregue!</h2>
        <p class="text-slate-500 text-[14px] leading-relaxed max-w-[480px] mb-8">
          Suas respostas foram gravadas com sucesso.
          {#if quizResult.has_reviews}
            Esta tarefa requer a correção manual das questões dissertativas pelo professor. Você receberá a nota assim que o professor finalizar a revisão.
          {:else}
            Sua nota foi calculada automaticamente.
          {/if}
        </p>

        <div class="grid grid-cols-2 gap-4 w-full mb-8">
          <div class="bg-slate-50 border border-slate-200 rounded-16 p-4">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status da Atividade</p>
            <span class="px-3 py-1 rounded-full text-[12px] font-extrabold uppercase {quizResult.has_reviews ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}">
              {quizResult.has_reviews ? 'Aguardando correção' : 'Concluído'}
            </span>
          </div>
          <div class="bg-slate-50 border border-slate-200 rounded-16 p-4">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nota Preliminar</p>
            <p class="text-[20px] font-black text-slate-800">{quizResult.score?.toFixed(1)}%</p>
          </div>
        </div>

        <button
          class="w-full py-3.5 rounded-12 text-[14px] font-bold text-white transition-all shadow-md hover:shadow-lg"
          style="background: #004E98;"
          on:click={() => onNavigate('kanban')}
        >
          Voltar para o Kanban
        </button>
      </div>
  {:else}
    <div class="max-w-[800px] mx-auto mt-4 flex flex-col gap-6">

      <!-- Quiz Card -->
      <div class="bg-white border border-slate-200 rounded-24 shadow-sm overflow-hidden">
        
        <!-- Header / Progress -->
        <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div>
            <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
              Questão {currentQuestionIndex + 1} de {questions.length}
            </span>
            <h2 class="text-[16px] font-black text-slate-800 tracking-tight mt-1 truncate max-w-[450px]">{task?.title ?? 'Avaliação'}</h2>
          </div>
          <div class="flex items-center gap-2 text-slate-500 text-[12px] font-bold">
            <Clock size={14} />
            <span>Tempo decorrido: {formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="h-1.5 bg-slate-100 w-full">
          <div class="h-full bg-blue-600 transition-all duration-300" style="width: {((currentQuestionIndex + 1) / questions.length) * 100}%"></div>
        </div>

        <!-- Question content -->
        <div class="p-8">
          {#if questions[currentQuestionIndex]}
            {@const q = questions[currentQuestionIndex]}
            <div class="flex flex-col gap-6">
              
              <!-- Question Genre and Sample Texts for Essays -->
              {#if q.Type === 'essay' || q.type === 'essay'}
                {#if q.TextGenre || q.text_genre}
                  <div class="inline-flex self-start px-3 py-1 rounded-full text-[11px] font-black bg-purple-50 text-purple-700 border border-purple-250">
                    Gênero Textual: {q.TextGenre || q.text_genre}
                  </div>
                {/if}
                
                {#if q.SampleText1 || q.sample_text_1 || q.SampleText2 || q.sample_text_2}
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-16 p-4 text-[13px] text-slate-600 italic">
                    {#if q.SampleText1 || q.sample_text_1}
                      <div class="flex flex-col gap-1">
                        <p class="text-[10px] font-bold uppercase text-slate-400 not-italic tracking-wider">Texto Motivador 1</p>
                        <div class="whitespace-pre-line leading-relaxed">{q.SampleText1 || q.sample_text_1}</div>
                      </div>
                    {/if}
                    {#if q.SampleText2 || q.sample_text_2}
                      <div class="flex flex-col gap-1 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
                        <p class="text-[10px] font-bold uppercase text-slate-400 not-italic tracking-wider">Texto Motivador 2</p>
                        <div class="whitespace-pre-line leading-relaxed">{q.SampleText2 || q.sample_text_2}</div>
                      </div>
                    {/if}
                  </div>
                {/if}
              {/if}

              <!-- Enunciado -->
              <p class="text-[16px] font-black text-slate-800 leading-snug whitespace-pre-line">
                {q.Prompt || q.prompt}
              </p>

              <!-- Answer Fields -->
              {#if q.Type === 'multiple_choice' || q.type === 'multiple_choice'}
                <!-- Multiple Choice -->
                <div class="flex flex-col gap-3">
                  {#each (q.Options ?? q.options ?? []) as opt}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div
                      class="flex items-center gap-3.5 px-4 py-3.5 rounded-16 border-2 text-[14px] font-bold cursor-pointer transition-all hover:border-blue-500
                        {answers[currentQuestionIndex].selected_option_index === opt.Index || answers[currentQuestionIndex].selected_option_index === opt.index
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900' : 'border-slate-200 bg-white text-slate-700'}"
                      on:click={() => answers[currentQuestionIndex].selected_option_index = opt.Index ?? opt.index}
                    >
                      <span class="w-7 h-7 rounded-full flex items-center justify-center font-black text-[12px] shrink-0
                        {answers[currentQuestionIndex].selected_option_index === opt.Index || answers[currentQuestionIndex].selected_option_index === opt.index
                          ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}">
                        {String.fromCharCode(65 + (opt.Index ?? opt.index))}
                      </span>
                      <span class="flex-1 leading-snug">{opt.Text ?? opt.text}</span>
                    </div>
                  {/each}
                </div>
              {:else if q.Type === 'essay' || q.type === 'essay'}
                <!-- Essay (Redação) -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sua Redação (mínimo 100 caracteres)</label>
                  <textarea
                    bind:value={answers[currentQuestionIndex].essay_text}
                    placeholder="Escreva sua dissertação aqui..."
                    rows="12"
                    class="w-full px-4 py-3 rounded-16 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 font-system leading-relaxed resize-y"
                  />
                  <div class="text-right text-[11px] font-semibold text-slate-400">
                    {answers[currentQuestionIndex].essay_text?.length || 0} caracteres
                  </div>
                </div>
              {:else}
                <!-- Open Question (Dissertativa) -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sua Resposta</label>
                  <textarea
                    bind:value={answers[currentQuestionIndex].open_answer_text}
                    placeholder="Digite sua resposta explicativa aqui..."
                    rows="6"
                    class="w-full px-4 py-3 rounded-16 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 font-system leading-relaxed resize-none"
                  />
                </div>
              {/if}

            </div>
          {/if}
        </div>

        <!-- Footer / Navigation -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between">
          <button
            class="px-5 py-2.5 rounded-12 text-[13px] font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5 disabled:opacity-40"
            disabled={currentQuestionIndex === 0}
            on:click={prevQuestion}
          >
            <ArrowLeft size={16} /> Anterior
          </button>

          {#if currentQuestionIndex < questions.length - 1}
            <button
              class="px-5 py-2.5 rounded-12 text-[13px] font-bold text-white transition-colors flex items-center gap-1.5"
              style="background: #004E98;"
              on:click={nextQuestion}
            >
              Próxima <ArrowRight size={16} />
            </button>
          {:else}
            <button
              class="px-6 py-2.5 rounded-12 text-[13px] font-bold text-white transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60"
              style="background: #10B981;"
              disabled={submitting}
              on:click={submitQuiz}
            >
              <Send size={16} /> {submitting ? 'Enviando...' : 'Finalizar e Enviar'}
            </button>
          {/if}
        </div>

      </div>

    </div>
  {/if}
</AppLayout>
