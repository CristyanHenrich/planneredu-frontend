<!-- AIRecommendations.svelte — Recomendações da IA -->
<script>
  import TopNav       from '../../components/ui/TopNav.svelte';
  import SectionLabel from '../../components/ui/SectionLabel.svelte';
  import Icon         from '../../components/ui/Icon.svelte';

  export let onNavigate = (screen) => {};

  const suggestions = [
    { emoji:'📐', title:'Funções Quadráticas',   subj:'Matemática', why:'Tópico de prova · próximo da sua zona de estudo', time:'30 min', color:'#004E98' },
    { emoji:'🧬', title:'Meiose e mitose',        subj:'Biologia',   why:'Você acertou só 60% do simulado anterior',       time:'25 min', color:'#4CD964' },
    { emoji:'✍️', title:'Estrutura dissertativa', subj:'Português',  why:'Redação em 3 dias · peso 2',                     time:'40 min', color:'#FF2D5F' },
    { emoji:'⚗️', title:'Revisão de ácidos',     subj:'Química',    why:'Conteúdo da aula de sexta',                      time:'20 min', color:'#004E98' },
  ];
</script>

<div class="w-full h-full bg-white flex flex-col">
  <TopNav />

  <div class="px-6 pb-2">
    <div class="flex items-center gap-2 mb-1">
      <div
        class="w-6 h-6 rounded flex items-center justify-center text-white text-[13px] font-extrabold"
        style="background:linear-gradient(135deg,#004E98,#FF6700);"
      >✦</div>
      <p class="text-[12px] font-bold uppercase tracking-wide text-pe-primary">
        Edu IA · Recomendações
      </p>
    </div>
    <h1 class="text-[26px] font-extrabold text-pe-text tracking-tighter mb-1.5">Priorize hoje</h1>
    <p class="text-[14px] text-pe-text-sec leading-snug">
      Com base nas suas provas dos próximos 14 dias.
    </p>
  </div>

  <div class="flex-1 overflow-auto px-5 pb-5 scrollbar-none">
    <!-- Card prioritário -->
    <div
      class="text-white rounded-2xl p-[18px] mb-4 relative overflow-hidden"
      style="background:linear-gradient(135deg,#004E98,#0066C7);"
    >
      <div
        class="absolute rounded-full"
        style="top:-40px;right:-30px;width:140px;height:140px;background:rgba(255,103,0,0.25);"
      />
      <div class="relative">
        <div
          class="inline-block text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-10 mb-2.5"
          style="background:#FF6700;"
        >PRIORIDADE ALTA</div>
        <p class="text-[20px] font-extrabold tracking-tight leading-snug mb-1.5">
          Revisar MRUV antes da prova de Física
        </p>
        <p class="text-[13px] opacity-90 leading-snug mb-3.5">
          Você teve média 6.4 e a prova é em 3 dias. Sugiro 45 min hoje com foco em exercícios.
        </p>
        <div
          class="rounded-10 p-2.5 px-3 text-[12px] flex gap-4"
          style="background:rgba(255,255,255,0.15);"
        >
          <span><strong>3 dias</strong> até a prova</span>
          <span><strong>45 min</strong> sugeridos</span>
          <span><strong>4</strong> tópicos</span>
        </div>
      </div>
    </div>

    <SectionLabel text="Outras sugestões" />
    {#each suggestions as r}
      <div
        class="bg-white rounded-14 p-3.5 mb-2.5 flex gap-3"
        style="border:1px solid #E4E4E7;"
      >
        <div
          class="w-12 h-12 rounded-12 flex items-center justify-center text-[22px] flex-shrink-0"
          style="background:{r.color}15;"
        >{r.emoji}</div>
        <div class="flex-1">
          <p class="text-[10px] font-bold uppercase tracking-wide mb-0.5" style="color:{r.color};">{r.subj}</p>
          <p class="text-[14px] font-bold text-pe-text tracking-tight mt-0.5">{r.title}</p>
          <p class="text-[12px] text-pe-text-sec mt-0.5 leading-snug">{r.why}</p>
          <div
            class="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-10 bg-pe-bg-alt text-[11px] font-bold text-pe-text"
          >
            <Icon name="clock" size={11} color="#6B7280" />
            {r.time}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
