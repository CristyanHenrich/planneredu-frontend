<script>
  import AuthLayout from '../../layouts/AuthLayout.svelte';
  import { authStore } from '../../stores/auth.js';

  export let onNavigate = (id) => {};

  const modes = [
    {
      id: 'school',
      label: 'Ensino Básico / Médio',
      description: 'Estou cursando o ensino fundamental ou médio',
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="14" fill="#EEF4FF"/>
        <path d="M10 22l14-8 14 8-14 8-14-8z" stroke="#004E98" stroke-width="2" stroke-linejoin="round" fill="none"/>
        <path d="M16 25v7c0 2 4 3 8 3s8-1 8-3v-7" stroke="#004E98" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <line x1="38" y1="22" x2="38" y2="30" stroke="#004E98" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
    },
    {
      id: 'university',
      label: 'Ensino Superior',
      description: 'Sou estudante de graduação ou pós-graduação',
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="14" fill="#FFF3E8"/>
        <path d="M14 20l10-6 10 6-10 6-10-6z" stroke="#FF6700" stroke-width="2" stroke-linejoin="round" fill="none"/>
        <path d="M20 23v5c0 2 2 3 4 3s4-1 4-3v-5" stroke="#FF6700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <circle cx="34" cy="32" r="4" stroke="#FF6700" stroke-width="2" fill="none"/>
        <path d="M32 32l1.5 1.5L36 30" stroke="#FF6700" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`,
    },
    {
      id: 'individual',
      label: 'Concurseiro',
      description: 'Estou me preparando para concursos públicos ou vestibular',
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="14" fill="#FFF0F4"/>
        <path d="M24 14l2.47 7.6H34l-6.18 4.49 2.36 7.26L24 28.8l-6.18 4.55 2.36-7.26L14 21.6h7.53L24 14z" stroke="#FF2D5F" stroke-width="2" stroke-linejoin="round" fill="none"/>
      </svg>`,
    },
    {
      id: 'individual',
      label: 'Autodidata',
      description: 'Aprendo por conta própria, sem vínculo com instituição',
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="14" fill="#EDFFF2"/>
        <path d="M14 16a3 3 0 013-3h14v22H17a3 3 0 01-3-3V16z" stroke="#22C55E" stroke-width="2" fill="none"/>
        <path d="M31 13h2a2 2 0 012 2v16a2 2 0 01-2 2h-2" stroke="#22C55E" stroke-width="2" fill="none"/>
        <path d="M19 20h8M19 24h6" stroke="#22C55E" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
    },
  ];

  let selected = null;
  let loading = false;
  let error = "";

  async function proceed() {
    if (!selected) return;
    error = "";
    loading = true;
    try {
      await authStore.updateMe({ study_mode: selected.id });
      if (selected.id === 'individual') {
        onNavigate('success');
      } else {
        onNavigate('school');
      }
    } catch (_) {
      error = 'Ocorreu um erro. Tente novamente.';
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
    <div class="lg:hidden mb-8">
      <img src="/assets/logo-horizontal.svg" alt="PlannerEdu" class="h-8" />
    </div>
    <h1 class="text-[32px] font-black text-slate-900 tracking-tighter mb-2">Como você estuda?</h1>
    <p class="text-[15px] text-slate-500 font-medium">Selecione o perfil que melhor te descreve para personalizar sua experiência.</p>
  </div>

  <div class="space-y-3">
    {#each modes as mode}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="flex items-center gap-4 p-4 rounded-18 border-2 cursor-pointer transition-all duration-150"
        style="
          border-color: {selected === mode ? '#004E98' : '#E4E4E7'};
          background: {selected === mode ? 'rgba(0,78,152,0.04)' : '#FAFAFA'};
        "
        on:click={() => selected = mode}
      >
        <div class="w-12 h-12 flex-shrink-0">
          {@html mode.icon}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[15px] font-bold text-slate-900">{mode.label}</p>
          <p class="text-[13px] text-slate-500 mt-0.5 leading-snug">{mode.description}</p>
        </div>
        <div
          class="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
          style="
            border-color: {selected === mode ? '#004E98' : '#CBD5E1'};
            background: {selected === mode ? '#004E98' : 'transparent'};
          "
        >
          {#if selected === mode}
            <svg class="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          {/if}
        </div>
      </div>
    {/each}

    {#if error}
      <p class="text-[13px] font-medium text-red-600 text-center">{error}</p>
    {/if}

    <div class="pt-2">
      <button
        type="button"
        disabled={!selected || loading}
        class="w-full py-4 text-white rounded-18 text-[16px] font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        style="background:#004E98;"
        on:click={proceed}
      >
        {#if loading}
          <span class="flex items-center justify-center gap-2">
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
            Salvando...
          </span>
        {:else}
          Continuar
        {/if}
      </button>
    </div>
  </div>
</AuthLayout>
