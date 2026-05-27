<!-- SubjectDetail.svelte — Detalhe de uma matéria -->
<script>
  import Icon         from '../../components/ui/Icon.svelte';
  import SectionLabel from '../../components/ui/SectionLabel.svelte';
  import AlertBanner  from '../../components/ui/AlertBanner.svelte';

  export let onNavigate = (screen) => {};

  const stats  = [
    { label:'Média', value:'6.4', accent:'#FF6700' },
    { label:'Faltas',value:'4/15' },
    { label:'Aulas', value:'18/30' },
  ];
  const docs = [
    { icon:'book',     title:'Ementa 2º bimestre',     sub:'PDF · 2.1 MB' },
    { icon:'calendar', title:'Cronograma de aulas',     sub:'Atualizado há 3 dias' },
    { icon:'mail',     title:'Lista de exercícios',     sub:'12 exercícios · 4 concluídos' },
  ];
</script>

<div class="w-full h-full bg-white flex flex-col">
  <!-- Header colorido -->
  <div class="text-white px-5 pb-6 relative" style="background:#004E98; padding-top:56px;">
    <div class="flex items-center gap-3 mb-4">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
        style="background:rgba(255,255,255,0.2);"
        on:click={() => onNavigate('subjects')}
      >
        <Icon name="chevL" size={22} color="#FFFFFF" />
      </div>
      <div class="flex-1" />
      <Icon name="dots" size={24} color="#FFFFFF" />
    </div>

    <p class="text-[12px] font-bold uppercase tracking-wider opacity-80">MATÉRIA</p>
    <h1 class="text-[30px] font-extrabold tracking-tighter mt-1">Física</h1>
    <p class="text-[14px] opacity-85 mt-1">Prof. Ricardo Sá · ricardo.sa@escola.edu.br</p>

    <!-- Stats -->
    <div class="flex gap-3 mt-4">
      {#each stats as s}
        <div class="flex-1 rounded-10 p-3" style="background:rgba(255,255,255,0.12);">
          <p class="text-[10px] opacity-75 font-bold uppercase tracking-wide">{s.label}</p>
          <p class="text-[18px] font-extrabold mt-0.5" style="color:{s.accent ?? '#FFFFFF'};">{s.value}</p>
        </div>
      {/each}
    </div>
  </div>

  <div class="flex-1 overflow-auto px-5 py-4 scrollbar-none">
    <SectionLabel text="Plano de ensino" />
    {#each docs as d}
      <div class="bg-white rounded-12 p-3 mb-2 flex items-center gap-3" style="border:1px solid #E4E4E7;">
        <div class="w-9 h-9 rounded-lg bg-pe-bg-alt flex items-center justify-center">
          <Icon name={d.icon} size={18} color="#004E98" />
        </div>
        <div class="flex-1">
          <p class="text-[14px] font-semibold text-pe-text tracking-tight">{d.title}</p>
          <p class="text-[12px] text-pe-text-sec">{d.sub}</p>
        </div>
        <Icon name="chevR" size={16} color="#6B7280" />
      </div>
    {/each}

    <SectionLabel text="Frequência" />
    <AlertBanner type="warning">
      Você pode faltar mais <strong>11 aulas</strong> sem ser reprovado por frequência.
    </AlertBanner>
  </div>
</div>
