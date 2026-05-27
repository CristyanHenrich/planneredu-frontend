<script>
  import { onDestroy } from 'svelte';
  import AuthLayout from '../../layouts/AuthLayout.svelte';
  import Icon from '../../components/ui/Icon.svelte';
  import { api } from '../../lib/api.js';
  import { currentUser } from '../../stores/auth.js';

  export let onNavigate = (id) => {};

  $: isUniversity = $currentUser?.study_mode === 'university';
  $: institutionType = isUniversity ? 'university' : 'school';
  $: labels = isUniversity
    ? { title: 'Sua faculdade', period: 'Semestre', group: 'Curso' }
    : { title: 'Sua escola', period: 'Série / Ano', group: 'Turma' };

  let query = "";
  let results = [];
  let selectedInstitution = null;
  let showDropdown = false;
  let classRooms = [];
  let selectedClassRoom = null;
  let gradeLevel = "";
  let classGroup = "";
  let loading = false;
  let searching = false;
  let error = "";
  let timer;

  const gradeLevels = isUniversity
    ? ['1º Semestre', '2º Semestre', '3º Semestre', '4º Semestre', '5º Semestre', '6º Semestre', '7º Semestre', '8º Semestre']
    : ['6º Ano - Fundamental', '7º Ano - Fundamental', '8º Ano - Fundamental', '9º Ano - Fundamental',
       '1º Ano - Médio', '2º Ano - Médio', '3º Ano - Médio'];

  onDestroy(() => clearTimeout(timer));

  async function doSearch() {
    if (query.length < 2) { results = []; showDropdown = false; return; }
    searching = true;
    try {
      results = await api.institutions.search(query, institutionType);
      showDropdown = results.length > 0;
    } catch (_) {
      results = [];
    } finally {
      searching = false;
    }
  }

  function handleInput() {
    selectedInstitution = null;
    classRooms = [];
    selectedClassRoom = null;
    clearTimeout(timer);
    timer = setTimeout(doSearch, 280);
  }

  async function selectInstitution(inst) {
    selectedInstitution = inst;
    query = inst.name;
    showDropdown = false;
    classRooms = [];
    selectedClassRoom = null;
    try {
      classRooms = await api.classrooms.list(inst.id);
    } catch (_) {
      classRooms = [];
    }
  }

  function handleBlur() {
    setTimeout(() => { showDropdown = false; }, 150);
  }

  async function submit() {
    error = "";
    if (!selectedInstitution) { error = 'Selecione uma instituição da lista.'; return; }
    if (classRooms.length > 0 && !selectedClassRoom) { error = 'Selecione sua turma.'; return; }
    loading = true;
    try {
      const payload = { institution_id: selectedInstitution.id };
      if (selectedClassRoom) {
        payload.class_room_id = selectedClassRoom.id;
      } else {
        payload.grade_level = gradeLevel;
        payload.class_group = classGroup;
      }
      await api.institutions.enroll(payload);
      onNavigate('success');
    } catch (err) {
      const msg = err?.errors?.[0]?.message;
      error = msg || 'Erro ao salvar. Tente novamente.';
    } finally {
      loading = false;
    }
  }
</script>

<AuthLayout
  quote="O aprendizado é um tesouro que seguirá seu dono em qualquer lugar."
  author="Provérbio Chinês"
  image="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80"
>
  <div class="mb-8">
    <h1 class="text-[32px] font-black text-slate-900 tracking-tighter mb-2">{labels.title}</h1>
    <p class="text-[15px] text-slate-500 font-medium leading-relaxed">
      Quase lá! Informe sua instituição de ensino para personalizar sua experiência.
    </p>
  </div>

  <div class="space-y-5">
    <!-- Busca em tempo real -->
    <div>
      <label class="text-[13px] font-bold text-slate-700 block mb-2" for="institution">
        Nome da instituição
      </label>
      <div class="relative">
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pe-primary transition-colors">
            <Icon name="school" size={18} />
          </div>
          <input
            id="institution"
            type="text"
            bind:value={query}
            on:input={handleInput}
            on:blur={handleBlur}
            placeholder={isUniversity ? 'Ex: Universidade de São Paulo' : 'Ex: Escola Estadual Prof. João Lima'}
            autocomplete="off"
            class="w-full pl-11 pr-10 py-3.5 bg-slate-50 border rounded-16 text-[15px] focus:bg-white outline-none transition-all placeholder:text-slate-400
              {selectedInstitution ? 'border-green-400 focus:border-green-400 focus:ring-4 focus:ring-green-400/5' : 'border-slate-200 focus:border-pe-primary focus:ring-4 focus:ring-pe-primary/5'}"
          />
          <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            {#if searching}
              <span class="w-4 h-4 border-2 border-slate-300 border-t-pe-primary rounded-full animate-spin"></span>
            {:else if selectedInstitution}
              <Icon name="check" size={18} color="#22C55E" />
            {/if}
          </div>
        </div>

        {#if showDropdown}
          <div class="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-16 border border-slate-200 shadow-lg z-50 overflow-hidden">
            {#each results as inst}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div
                class="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0"
                on:mousedown={() => selectInstitution(inst)}
              >
                <div class="w-8 h-8 rounded-10 flex items-center justify-center flex-shrink-0" style="background:rgba(0,78,152,0.08);">
                  <Icon name="school" size={16} color="#004E98" />
                </div>
                <div class="min-w-0">
                  <p class="text-[14px] font-semibold text-slate-800 truncate">{inst.name}</p>
                  {#if inst.city || inst.state}
                    <p class="text-[12px] text-slate-400">{[inst.city, inst.state].filter(Boolean).join(' · ')}</p>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
      {#if query.length >= 2 && !searching && results.length === 0 && !selectedInstitution}
        <p class="mt-1.5 text-[12px] text-slate-400">Nenhuma instituição encontrada. Verifique o nome digitado.</p>
      {/if}
    </div>

    <!-- Turmas cadastradas (se houver) -->
    {#if selectedInstitution && classRooms.length > 0}
      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2">Selecione sua turma</label>
        <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
          {#each classRooms as room}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              class="flex items-center gap-3 px-4 py-3 rounded-16 border cursor-pointer transition-all"
              style={selectedClassRoom?.id === room.id
                ? 'border-color:#004E98;background:rgba(0,78,152,0.05);'
                : 'border-color:#E4E4E7;background:#F8FAFC;'}
              on:click={() => selectedClassRoom = room}
            >
              <div class="w-8 h-8 rounded-10 flex items-center justify-center flex-shrink-0"
                style={selectedClassRoom?.id === room.id ? 'background:#004E98;' : 'background:#E4E4E7;'}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={selectedClassRoom?.id === room.id ? '#fff' : '#888'} stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[14px] font-semibold text-slate-800">{room.name}</p>
                {#if room.grade_level}
                  <p class="text-[12px] text-slate-400">{room.grade_level}</p>
                {/if}
              </div>
              {#if selectedClassRoom?.id === room.id}
                <Icon name="check" size={16} color="#004E98" />
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {:else if selectedInstitution && classRooms.length === 0}
      <!-- Fallback manual quando não há turmas cadastradas -->
      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2" for="gradeLevel">{labels.period}</label>
        <select
          id="gradeLevel"
          bind:value={gradeLevel}
          class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-16 text-[15px] focus:bg-white focus:border-pe-primary focus:ring-4 focus:ring-pe-primary/5 outline-none transition-all text-slate-700"
        >
          <option value="">Selecionar...</option>
          {#each gradeLevels as level}
            <option value={level}>{level}</option>
          {/each}
        </select>
      </div>

      <div>
        <label class="text-[13px] font-bold text-slate-700 block mb-2" for="classGroup">
          {labels.group} <span class="text-slate-400 font-medium">(opcional)</span>
        </label>
        <input
          id="classGroup"
          type="text"
          bind:value={classGroup}
          placeholder={isUniversity ? 'Ex: Ciência da Computação' : 'Ex: Turma A'}
          class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-16 text-[15px] focus:bg-white focus:border-pe-primary focus:ring-4 focus:ring-pe-primary/5 outline-none transition-all placeholder:text-slate-400"
        />
      </div>
    {/if}

    {#if error}
      <p class="text-[13px] font-medium text-red-600">{error}</p>
    {/if}

    <button
      type="button"
      disabled={loading || !selectedInstitution}
      class="w-full py-4 text-white rounded-18 text-[16px] font-bold transition-all mt-2 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
      style="background:#004E98;"
      on:click={submit}
    >
      {#if loading}
        <span class="flex items-center justify-center gap-2">
          <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
          Salvando...
        </span>
      {:else}
        Finalizar Cadastro
      {/if}
    </button>

    <button
      type="button"
      class="w-full py-2 text-[14px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
      on:click={() => onNavigate('success')}
    >
      Pular por agora
    </button>
  </div>
</AuthLayout>
