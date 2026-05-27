<!-- StudyPlan.svelte — Cronograma de estudos com modo recuperação -->
<script>
  import TopNav      from '../../components/ui/TopNav.svelte';
  import Badge       from '../../components/ui/Badge.svelte';
  import AlertBanner from '../../components/ui/AlertBanner.svelte';

  export let onNavigate = (screen) => {};

  const days = [
    { d:'Seg', n:13, topics:['Mat: Funções','Fís: MRU'],           hours:2,   done:true },
    { d:'Ter', n:14, topics:['Hist: Colônia','Bio: Genética'],      hours:2,   done:true },
    { d:'Qua', n:15, topics:['Quím: Ácidos','Port: Redação'],       hours:2.5, missed:true },
    { d:'Qui', n:16, topics:['Quím: Ácidos ⟲','Port: Redação ⟲','Fís: MRUV'], hours:3, recovery:true },
    { d:'Sex', n:17, topics:['Mat: Revisão','Bio: Revisão'],        hours:2.5, recovery:true },
    { d:'Sáb', n:18, topics:['Simulado Geral'],                     hours:3,   today:true },
    { d:'Dom', n:19, topics:['Revisão leve'],                       hours:1 },
  ];

  const cardBg = (d) => {
    if (d.today)  return '#004E98';
    if (d.missed) return 'rgba(255,45,95,0.06)';
    return '#FFFFFF';
  };
  const cardBorder = (d) => {
    if (d.today)    return '#004E98';
    if (d.recovery) return '#FF6700';
    if (d.missed)   return '#FF2D5F';
    return '#E4E4E7';
  };
</script>

<div class="w-full h-full bg-white flex flex-col">
  <TopNav onBack={() => onNavigate('kanban')} />

  <div class="px-6 pb-2">
    <p class="text-[12px] text-pe-secondary font-bold uppercase tracking-wide mb-1">
      Cronograma · gerado por IA
    </p>
    <h1 class="text-[28px] font-extrabold text-pe-text tracking-tighter">Esta semana</h1>
  </div>

  <!-- Banner de recuperação -->
  <div class="px-5 pb-4">
    <div
      class="rounded-14 p-3.5 text-white flex gap-3 items-center"
      style="background:linear-gradient(135deg,#004E98,#0066C7);"
    >
      <div
        class="w-10 h-10 rounded-10 flex items-center justify-center text-xl flex-shrink-0"
        style="background:rgba(255,255,255,0.18);"
      >⚡</div>
      <div>
        <p class="text-[13px] font-bold mb-0.5">Modo de Recuperação ativo</p>
        <p class="text-[12px] opacity-90 leading-snug">
          Você perdeu quarta. Redistribuímos <strong>2.5h</strong> entre qui e sex.
        </p>
      </div>
    </div>
  </div>

  <div class="flex-1 overflow-auto px-5 pb-5 scrollbar-none">
    <div class="flex flex-col gap-2">
      {#each days as d}
        <div
          class="rounded-12 p-3 flex gap-3 items-start"
          style="
            background:{cardBg(d)};
            border:1.5px solid {cardBorder(d)};
            color:{d.today ? '#FFFFFF' : '#14213D'};
            opacity:{d.done ? 0.6 : 1};
          "
        >
          <div class="w-11 text-center flex-shrink-0">
            <p class="text-[10px] font-bold uppercase tracking-wide opacity-70">{d.d}</p>
            <p class="text-[20px] font-extrabold tracking-tight">{d.n}</p>
          </div>
          <div class="flex-1">
            <div class="flex gap-1.5 flex-wrap mb-1.5">
              {#if d.done}     <Badge label="✓ Concluído"  color="#4CD964" /> {/if}
              {#if d.missed}   <Badge label="⤫ Perdido"    color="#FF2D5F" /> {/if}
              {#if d.recovery} <Badge label="↻ Recuperação" color="#FF6700" /> {/if}
              {#if d.today}    <Badge label="Hoje" color="#FFFFFF" textColor="#004E98" solid /> {/if}
            </div>
            <p class="text-[13px] leading-snug font-medium tracking-tight">
              {d.topics.join(' · ')}
            </p>
            <p class="text-[11px] font-semibold mt-1 opacity-60">{d.hours}h de estudo</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
