<!-- SchoolInfo.svelte — Tela 5: Modo de estudo (etapa 3/4) -->
<script>
  import { onMount } from 'svelte';
  import TopNav          from '../../components/ui/TopNav.svelte';
  import ProgressStepper from '../../components/ui/ProgressStepper.svelte';
  import Chip            from '../../components/ui/Chip.svelte';
  import AlertBanner     from '../../components/ui/AlertBanner.svelte';
  import Button          from '../../components/ui/Button.svelte';
  import { authStore } from '../../stores/auth.js';
  import { api } from '../../lib/api.js';

  export let onNavigate = (screen) => {};

  let studyMode      = 'school';
  let selectedYear   = '9º ano';
  let selectedShift  = 'Manhã';
  let schools        = [];
  let selectedSchool = null;
  let loading        = false;
  let error          = '';

  const modes = [
    { value: 'school',     label: 'Escola Regular',      icon: '🏫', desc: 'Ensino fundamental ou médio' },
    { value: 'individual', label: 'Cursinho / Concurso', icon: '📚', desc: 'Estudante autônomo' },
    { value: 'university', label: 'Faculdade',           icon: '🎓', desc: 'Ensino superior' },
  ];

  const years  = ['6º ano','7º ano','8º ano','9º ano','1º EM','2º EM','3º EM'];
  const shifts = ['Manhã','Tarde','Noite'];

  onMount(async () => {
    try { schools = await api.schools.list(); } catch (_) {}
  });

  async function handleContinue() {
    loading = true; error = '';
    try {
      await authStore.updateMe({ study_mode: studyMode });
      if (studyMode === 'school' && selectedSchool) {
        try {
          await api.schools.enroll({
            school_id:   selectedSchool.id,
            grade_level: selectedYear,
            class_group: selectedShift,
          });
        } catch (_) {}
      }
      onNavigate('success');
    } catch (e) {
      error = 'Erro ao salvar. Tente novamente.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="w-full h-full bg-white flex flex-col">
  <TopNav onBack={() => onNavigate('otp')}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span
      class="text-[15px] text-pe-primary font-semibold px-3 py-2 cursor-pointer"
      on:click={() => onNavigate('success')}
    >Pular</span>
  </TopNav>
  <ProgressStepper step={3} />

  <div class="px-6 flex-1 overflow-y-auto">
    <h1 class="text-[28px] font-extrabold text-pe-text tracking-tighter mb-2">
      Como você estuda?
    </h1>
    <p class="text-[15px] text-pe-text-sec mb-6 tracking-tight leading-snug">
      Isso nos ajuda a personalizar sua experiência.
    </p>

    <!-- Seleção de modo -->
    <div class="mb-6 space-y-2">
      {#each modes as mode}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors"
          class:border-pe-primary={studyMode === mode.value}
          class:bg-blue-50={studyMode === mode.value}
          class:border-transparent={studyMode !== mode.value}
          class:bg-pe-bg-alt={studyMode !== mode.value}
          on:click={() => { studyMode = mode.value; selectedSchool = null; }}
        >
          <span class="text-2xl">{mode.icon}</span>
          <div class="flex-1">
            <p class="text-[14px] font-semibold text-pe-text">{mode.label}</p>
            <p class="text-[12px] text-pe-text-sec">{mode.desc}</p>
          </div>
          <div
            class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
            class:border-pe-primary={studyMode === mode.value}
            class:border-gray-300={studyMode !== mode.value}
          >
            {#if studyMode === mode.value}
              <div class="w-2.5 h-2.5 rounded-full bg-pe-primary" />
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <!-- Campos adicionais para escola regular -->
    {#if studyMode === 'school'}
      {#if schools.length > 0}
        <div class="mb-4">
          <p class="text-[13px] font-semibold text-pe-text mb-2.5 tracking-tight">Sua escola</p>
          <div class="flex flex-wrap gap-2">
            {#each schools as school}
              <Chip
                label={school.name}
                selected={selectedSchool?.id === school.id}
                on:click={() => (selectedSchool = school)}
              />
            {/each}
          </div>
        </div>
      {/if}

      <div class="mb-4">
        <p class="text-[13px] font-semibold text-pe-text mb-2.5 tracking-tight">Ano/Série</p>
        <div class="flex flex-wrap gap-2">
          {#each years as year}
            <Chip
              label={year}
              selected={selectedYear === year}
              on:click={() => (selectedYear = year)}
            />
          {/each}
        </div>
      </div>

      <div class="mb-4">
        <p class="text-[13px] font-semibold text-pe-text mb-2.5 tracking-tight">Turno</p>
        <div class="flex gap-2">
          {#each shifts as shift}
            <div class="flex-1">
              <Chip
                label={shift}
                selected={selectedShift === shift}
                on:click={() => (selectedShift = shift)}
              />
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if studyMode === 'university'}
      <AlertBanner type="info">
        Universitários têm acesso ao planejador de estudos e organização de matérias, sem ranking ou conquistas.
      </AlertBanner>
    {/if}

    {#if error}
      <p class="text-[13px] text-red-500 mt-2">{error}</p>
    {/if}

    <AlertBanner type="warning">
      Você poderá editar essas informações a qualquer momento em Configurações.
    </AlertBanner>
  </div>

  <div class="px-5 pb-7 pt-4">
    <Button on:click={handleContinue} disabled={loading}>
      {loading ? 'Salvando…' : 'Continuar'}
    </Button>
  </div>
</div>
