<script>
  import { onMount } from 'svelte';
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import Modal      from '../../components/ui/Modal.svelte';
  import { api }   from '../../lib/api.js';
  import {
    Search, SlidersHorizontal, BookOpen, Plus, ChevronDown,
    CircleDot, FileText, NotebookPen, CheckCircle2, X, Tag,
    GraduationCap, BookMarked, Hash, Layers
  } from 'lucide-svelte';

  export let onNavigate = (id) => {};

  // ── State ──────────────────────────────────────────────
  let questions   = [];
  let subjects    = [];
  let loading     = true;
  let showCreate  = false;
  let creating    = false;
  let expandedId  = null;

  // Active filters
  let filters = {
    type:        '',
    difficulty:  '',
    grade_level: '',
    subject_id:  '',
    topic:       '',
    bncc_code:   '',
  };

  // Create form
  let form = resetForm();

  function resetForm() {
    return {
      type:               'multiple_choice',
      prompt:             '',
      options:            ['', '', '', ''],
      correct_option_index: 0,
      difficulty:         '',
      grade_level:        '',
      subject_id:         '',
      topic:              '',
      bncc_code:          '',
      text_genre:         '',
      sample_text_1:      '',
      sample_text_2:      '',
    };
  }

  const GRADE_LEVELS = [
    '1º Ano EF', '2º Ano EF', '3º Ano EF', '4º Ano EF', '5º Ano EF',
    '6º Ano EF', '7º Ano EF', '8º Ano EF', '9º Ano EF',
    '1ª Série EM', '2ª Série EM', '3ª Série EM',
  ];
  const DIFFICULTIES = [
    { value: 'facil',   label: 'Fácil',   ring: 'ring-emerald-400', activeBg: 'bg-emerald-600 text-white ring-emerald-600' },
    { value: 'medio',   label: 'Médio',   ring: 'ring-amber-400',   activeBg: 'bg-amber-50 text-white ring-amber-500'     },
    { value: 'dificil', label: 'Difícil', ring: 'ring-rose-400',    activeBg: 'bg-rose-600 text-white ring-rose-600'       },
  ];

  // ── Lifecycle ──────────────────────────────────────────
  onMount(async () => {
    try { subjects = await api.teacher.subjects() ?? []; } catch {}
    await load();
  });

  async function load() {
    loading = true;
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      questions = await api.teacher.questions.list(params) ?? [];
    } catch (err) { console.error(err); }
    finally { loading = false; }
  }

  function applyFilters() { load(); }
  function clearFilters() {
    filters = { type: '', difficulty: '', grade_level: '', subject_id: '', topic: '', bncc_code: '' };
    load();
  }

  $: activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  // ── Create question ────────────────────────────────────
  function openCreate() { form = resetForm(); showCreate = true; }
  function addOption() { form.options = [...form.options, '']; }
  function removeOption(i) {
    if (form.options.length <= 2) return;
    form.options = form.options.filter((_, idx) => idx !== i);
    if (form.correct_option_index >= form.options.length)
      form.correct_option_index = form.options.length - 1;
  }

  async function submitCreate() {
    if (!form.prompt.trim()) { alert('O enunciado é obrigatório.'); return; }
    creating = true;
    try {
      const body = {
        type: form.type, prompt: form.prompt.trim(),
        difficulty: form.difficulty, grade_level: form.grade_level,
        topic: form.topic.trim(), bncc_code: form.bncc_code.trim(),
      };
      if (form.subject_id) body.subject_id = Number(form.subject_id);
      if (form.type === 'multiple_choice') {
        body.options              = form.options.map(o => o.trim()).filter(Boolean);
        body.correct_option_index = Number(form.correct_option_index);
      } else if (form.type === 'essay') {
        body.text_genre      = form.text_genre.trim();
        body.sample_text_1   = form.sample_text_1.trim();
        body.sample_text_2   = form.sample_text_2.trim();
      }
      await api.teacher.questions.create(body);
      showCreate = false;
      load();
    } catch { alert('Erro ao criar questão.'); }
    finally  { creating = false; }
  }

  // ── Helpers ────────────────────────────────────────────
  const TYPE_META = {
    multiple_choice: { label: 'Múltipla Escolha', bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100'   },
    open:            { label: 'Dissertativa',      bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-100'  },
    essay:           { label: 'Redação',           bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  };
  const DIFF_META = {
    facil:   { label: 'Fácil',   bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    medio:   { label: 'Médio',   bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400'   },
    dificil: { label: 'Difícil', bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-400'    },
  };

  function diffMeta(d) { return DIFF_META[d] ?? null; }
  function typeMeta(t) { return TYPE_META[t] ?? { label: t, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' }; }
  function toggleExpand(id) { expandedId = expandedId === id ? null : id; }
</script>

<!-- ══════════════════════════════════════════════════════════════════ -->
<AppLayout
  title="Banco de Questões"
  breadcrumbs={[{label:'Professor'},{label:'Banco de Questões'}]}
  active="teacher-questions"
  {onNavigate}
>
  <PageHeader
    title="Banco de Questões"
    subtitle="Crie, filtre e gerencie questões para usar em avaliações e quizzes."
    actions={[{ label: '+ Nova Questão', variant: 'primary', onClick: openCreate }]}
  />

  <!-- ── Filter Panel ──────────────────────────────────────────── -->
  <div class="bg-white border border-slate-200 rounded-20 shadow-sm mb-6 overflow-hidden">
    <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
      <div class="flex items-center gap-2 text-slate-700">
        <SlidersHorizontal size={16} />
        <span class="text-[14px] font-bold">Filtros</span>
        {#if activeFilterCount > 0}
          <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-blue-600 text-white">{activeFilterCount}</span>
        {/if}
      </div>
      {#if activeFilterCount > 0}
        <button class="flex items-center gap-1 text-[12px] font-bold text-slate-400 hover:text-rose-500 transition-colors" on:click={clearFilters}>
          <X size={13} /> Limpar tudo
        </button>
      {/if}
    </div>

    <div class="p-5 grid grid-cols-2 gap-4 md:grid-cols-3">

      <!-- Dificuldade -->
      <div class="flex flex-col gap-1.5">
        <label class="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <Layers size={11} /> Dificuldade
        </label>
        <div class="flex gap-2 flex-wrap">
          <button
            class="px-3 py-1.5 rounded-10 text-[12px] font-bold border transition-all {filters.difficulty === '' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}"
            on:click={() => { filters.difficulty = ''; load(); }}
          >Todas</button>
          {#each DIFFICULTIES as d}
            <button
              class="px-3 py-1.5 rounded-10 text-[12px] font-bold border ring-0 transition-all {filters.difficulty === d.value ? d.activeBg : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}"
              on:click={() => { filters.difficulty = d.value; load(); }}
            >{d.label}</button>
          {/each}
        </div>
      </div>

      <!-- Série / Turma -->
      <div class="flex flex-col gap-1.5">
        <label class="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <GraduationCap size={11} /> Série / Turma
        </label>
        <select
          class="px-3 py-2 rounded-10 text-[13px] border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          bind:value={filters.grade_level} on:change={applyFilters}
        >
          <option value="">Todas as séries</option>
          {#each GRADE_LEVELS as g}<option value={g}>{g}</option>{/each}
        </select>
      </div>

      <!-- Disciplina -->
      <div class="flex flex-col gap-1.5">
        <label class="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <BookMarked size={11} /> Disciplina
        </label>
        <select
          class="px-3 py-2 rounded-10 text-[13px] border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          bind:value={filters.subject_id} on:change={applyFilters}
        >
          <option value="">Todas</option>
          {#each subjects as s (s.ID ?? s.id)}
            <option value={s.ID ?? s.id}>{s.Name ?? s.name}</option>
          {/each}
        </select>
      </div>

      <!-- Tipo -->
      <div class="flex flex-col gap-1.5">
        <label class="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <FileText size={11} /> Tipo de Questão
        </label>
        <select
          class="px-3 py-2 rounded-10 text-[13px] border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          bind:value={filters.type} on:change={applyFilters}
        >
          <option value="">Todos os tipos</option>
          <option value="multiple_choice">Múltipla Escolha</option>
          <option value="open">Dissertativa</option>
          <option value="essay">Redação</option>
        </select>
      </div>

      <!-- Tópico -->
      <div class="flex flex-col gap-1.5">
        <label class="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <Tag size={11} /> Matéria / Tópico
        </label>
        <div class="relative">
          <Search size={13} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="ex: Funções, Porcentagem..."
            class="w-full pl-8 pr-3 py-2 rounded-10 text-[13px] border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            bind:value={filters.topic} on:input={applyFilters}
          />
        </div>
      </div>

      <!-- BNCC -->
      <div class="flex flex-col gap-1.5">
        <label class="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <Hash size={11} /> Código BNCC
        </label>
        <div class="relative">
          <Hash size={13} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="ex: EF09MA12"
            class="w-full pl-8 pr-3 py-2 rounded-10 text-[13px] border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors uppercase"
            bind:value={filters.bncc_code} on:input={applyFilters}
          />
        </div>
      </div>
    </div>
  </div>

  <!-- ── Results header ───────────────────────────────────────── -->
  <div class="flex items-center justify-between mb-3 px-1">
    <p class="text-[13px] font-bold text-slate-500">
      {loading ? 'Carregando...' : `${questions.length} questão${questions.length !== 1 ? 'ões' : ''} encontrada${questions.length !== 1 ? 's' : ''}`}
    </p>
  </div>

  <!-- ── Question List ─────────────────────────────────────────── -->
  {#if loading}
    <div class="flex justify-center py-24">
      <div class="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
    </div>

  {:else if questions.length === 0}
    <div class="bg-white border border-dashed border-slate-200 rounded-20 py-24 text-center shadow-sm">
      <div class="flex justify-center mb-4 text-slate-300">
        <BookOpen size={52} strokeWidth={1.5} />
      </div>
      <p class="text-slate-600 text-[15px] font-bold mb-1">Nenhuma questão encontrada</p>
      <p class="text-slate-400 text-[13px] mb-6">
        {activeFilterCount > 0 ? 'Tente remover alguns filtros ou crie uma nova questão.' : 'Comece criando a primeira questão do banco.'}
      </p>
      <button
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-10 text-[13px] font-bold transition-colors"
        on:click={openCreate}
      >
        <Plus size={14} /> Criar questão
      </button>
    </div>

  {:else}
    <div class="flex flex-col gap-3">
      {#each questions as q (q.ID)}
        {@const tm = typeMeta(q.Type)}
        {@const dm = diffMeta(q.Difficulty)}
        <div class="bg-white border border-slate-200 rounded-20 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

          <!-- Card header -->
          <button class="w-full text-left px-6 py-4 flex items-start gap-4" on:click={() => toggleExpand(q.ID)}>

            <!-- Type icon bubble -->
            <div class="shrink-0 mt-0.5 w-9 h-9 rounded-12 flex items-center justify-center
              {q.Type === 'multiple_choice' ? 'bg-blue-50 text-blue-500' : q.Type === 'open' ? 'bg-amber-50 text-amber-500' : 'bg-purple-50 text-purple-500'}">
              {#if q.Type === 'multiple_choice'}
                <CircleDot size={18} />
              {:else if q.Type === 'open'}
                <FileText size={18} />
              {:else}
                <NotebookPen size={18} />
              {/if}
            </div>

            <div class="flex-1 min-w-0">
              <!-- Tags row -->
              <div class="flex flex-wrap items-center gap-1.5 mb-2">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase {tm.bg} {tm.text} border {tm.border}">
                  {tm.label}
                </span>
                {#if dm}
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase {dm.bg} {dm.text}">
                    <span class="w-1.5 h-1.5 rounded-full {dm.dot}"></span>{dm.label}
                  </span>
                {/if}
                {#if q.GradeLevel}
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <GraduationCap size={9} />{q.GradeLevel}
                  </span>
                {/if}
                {#if q.Subject?.Name}
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100">
                    <BookMarked size={9} />{q.Subject.Name}
                  </span>
                {/if}
                {#if q.Topic}
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    <Tag size={9} />{q.Topic}
                  </span>
                {/if}
                {#if q.BnccCode}
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-800 text-white tracking-widest">
                    <Hash size={9} />{q.BnccCode}
                  </span>
                {/if}
              </div>

              <!-- Prompt -->
              <p class="text-[14px] font-semibold text-slate-800 leading-snug line-clamp-2">{q.Prompt}</p>
            </div>

            <!-- Expand icon -->
            <div class="shrink-0 text-slate-400 transition-transform {expandedId === q.ID ? 'rotate-180' : ''}">
              <ChevronDown size={18} />
            </div>
          </button>

          <!-- Expanded options -->
          {#if expandedId === q.ID}
            {#if q.Type === 'multiple_choice' && q.Options?.length}
              <div class="px-6 pb-5 border-t border-slate-100 pt-4 bg-slate-50/50">
                <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Alternativas</p>
                <div class="grid grid-cols-2 gap-2.5">
                  {#each q.Options as opt, idx}
                    <div class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-12 border transition-all
                      {idx === q.CorrectOptionIndex ? 'bg-emerald-50 border-emerald-300 shadow-sm' : 'bg-white border-slate-200'}">
                      <span class="w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] shrink-0
                        {idx === q.CorrectOptionIndex ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span class="text-[13px] font-medium flex-1 {idx === q.CorrectOptionIndex ? 'text-emerald-800 font-bold' : 'text-slate-700'}">
                        {opt.Text}
                      </span>
                      {#if idx === q.CorrectOptionIndex}
                        <CheckCircle2 size={15} class="text-emerald-500 shrink-0" />
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {:else if q.Type === 'essay'}
              <div class="px-6 pb-5 border-t border-slate-100 pt-4 bg-purple-50/20 flex flex-col gap-4">
                {#if q.TextGenre}
                  <div>
                    <span class="text-[11px] font-black text-purple-600 uppercase tracking-wider block mb-1">Gênero Textual</span>
                    <p class="text-[13px] font-bold text-slate-700 bg-white border border-slate-200 rounded-10 px-3 py-1.5 inline-block">{q.TextGenre}</p>
                  </div>
                {/if}
                {#if q.SampleText1}
                  <div>
                    <span class="text-[11px] font-black text-purple-600 uppercase tracking-wider block mb-1">Texto Motivador 1</span>
                    <div class="text-[13px] text-slate-600 bg-white border border-slate-200 rounded-12 p-3 leading-relaxed whitespace-pre-wrap">{q.SampleText1}</div>
                  </div>
                {/if}
                {#if q.SampleText2}
                  <div>
                    <span class="text-[11px] font-black text-purple-600 uppercase tracking-wider block mb-1">Texto Motivador 2</span>
                    <div class="text-[13px] text-slate-600 bg-white border border-slate-200 rounded-12 p-3 leading-relaxed whitespace-pre-wrap">{q.SampleText2}</div>
                  </div>
                {/if}
              </div>
            {/if}
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</AppLayout>

<!-- ══════════════════════════ CREATE MODAL ══════════════════════════ -->
<Modal open={showCreate} title="Nova Questão no Banco" onClose={() => showCreate = false} width="680px">
  <div class="px-6 py-5 flex flex-col gap-5">

    <!-- Tipo + Dificuldade -->
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-1.5">
        <label class="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          <FileText size={11} /> Tipo da Questão *
        </label>
        <select bind:value={form.type} class="px-3 py-2.5 rounded-10 text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
          <option value="multiple_choice">Múltipla Escolha</option>
          <option value="open">Dissertativa / Aberta</option>
          <option value="essay">Redação</option>
        </select>
      </div>
      <div class="flex flex-col gap-1.5">
        <label class="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          <Layers size={11} /> Dificuldade
        </label>
        <select bind:value={form.difficulty} class="px-3 py-2.5 rounded-10 text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
          <option value="">Selecionar...</option>
          <option value="facil">Fácil</option>
          <option value="medio">Médio</option>
          <option value="dificil">Difícil</option>
        </select>
      </div>
    </div>

    <!-- Série + Disciplina -->
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-1.5">
        <label for="form-grade-level" class="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          <GraduationCap size={11} /> Série / Turma
        </label>
        <select id="form-grade-level" bind:value={form.grade_level} class="px-3 py-2.5 rounded-10 text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
          <option value="">Selecionar...</option>
          {#each GRADE_LEVELS as g}<option value={g}>{g}</option>{/each}
        </select>
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="form-subject-id" class="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          <BookMarked size={11} /> Disciplina
        </label>
        <select id="form-subject-id" bind:value={form.subject_id} class="px-3 py-2.5 rounded-10 text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500 bg-white">
          <option value="">Selecionar...</option>
          {#each subjects as s (s.ID ?? s.id)}
            <option value={s.ID ?? s.id}>{s.Name ?? s.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Tópico + BNCC -->
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-1.5">
        <label for="form-topic" class="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          <Tag size={11} /> Matéria / Tópico
        </label>
        <input id="form-topic" type="text" bind:value={form.topic} placeholder="ex: Funções, Porcentagem..."
          class="px-3 py-2.5 rounded-10 text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors" />
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="form-bncc-code" class="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          <Hash size={11} /> Código BNCC
        </label>
        <input id="form-bncc-code" type="text" bind:value={form.bncc_code} placeholder="ex: EF09MA12"
          class="px-3 py-2.5 rounded-10 text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors uppercase" />
      </div>
    </div>

    <div class="border-t border-slate-100"></div>

    <!-- Enunciado -->
    <div class="flex flex-col gap-1.5">
      <label for="form-prompt" class="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
        <NotebookPen size={11} /> Enunciado / Pergunta *
      </label>
      <textarea id="form-prompt" bind:value={form.prompt} placeholder="Escreva a pergunta, comando da redação ou enunciado..."
        rows="4" class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed" />
    </div>

    <!-- Alternativas -->
    {#if form.type === 'multiple_choice'}
      <div class="flex flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            <CircleDot size={11} /> Alternativas
          </label>
          <span class="text-[11px] text-slate-400">Clique no radio para marcar a correta</span>
        </div>
        {#each form.options as opt, i}
          <div class="flex items-center gap-2.5">
            <input type="radio" name="correct_opt"
              checked={form.correct_option_index === i}
              on:change={() => form.correct_option_index = i}
              class="w-4 h-4 accent-blue-600 shrink-0" />
            <span class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-600 shrink-0">
              {String.fromCharCode(65 + i)}
            </span>
            <input type="text" bind:value={form.options[i]}
              placeholder="Alternativa {String.fromCharCode(65 + i)}..."
              class="flex-1 px-3 py-2 rounded-10 text-[13px] border focus:outline-none focus:border-blue-500 transition-colors {form.correct_option_index === i ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200'}" />
            <button type="button" on:click={() => removeOption(i)} disabled={form.options.length <= 2}
              class="text-slate-300 hover:text-rose-500 transition-colors disabled:opacity-30">
              <X size={16} />
            </button>
          </div>
        {/each}
        <button type="button" on:click={addOption}
          class="flex items-center justify-center gap-2 mt-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[12px] font-bold rounded-10 transition-colors border border-dashed border-slate-200 w-full">
          <Plus size={13} /> Adicionar alternativa
        </button>
      </div>
    {:else if form.type === 'essay'}
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label for="form-text-genre" class="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Gênero Textual (ex: Artigo de Opinião, Dissertativo, Carta)
          </label>
          <input id="form-text-genre" type="text" bind:value={form.text_genre} placeholder="ex: Dissertativo-Argumentativo"
            class="px-3 py-2.5 rounded-10 text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="form-sample-text-1" class="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Texto Motivador 1
          </label>
          <textarea id="form-sample-text-1" bind:value={form.sample_text_1} placeholder="Cole aqui o primeiro texto de apoio/motivador..."
            rows="3" class="w-full px-3 py-2.5 rounded-10 text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="form-sample-text-2" class="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Texto Motivador 2 (Opcional)
          </label>
          <textarea id="form-sample-text-2" bind:value={form.sample_text_2} placeholder="Cole aqui o segundo texto de apoio/motivador..."
            rows="3" class="w-full px-3 py-2.5 rounded-10 text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed" />
        </div>
      </div>
    {/if}

    <!-- Actions -->
    <div class="flex gap-3 pt-2 border-t border-slate-100">
      <button on:click={() => showCreate = false}
        class="flex-1 py-2.5 rounded-10 text-[13px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
        Cancelar
      </button>
      <button on:click={submitCreate} disabled={creating}
        class="flex-1 py-2.5 rounded-10 text-[13px] font-bold text-white transition-opacity"
        style="background:#004E98; opacity:{creating ? 0.6 : 1};">
        {creating ? 'Salvando...' : 'Adicionar Questão'}
      </button>
    </div>
  </div>
</Modal>
