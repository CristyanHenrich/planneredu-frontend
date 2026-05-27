<!-- Ranking.svelte — Ranking da turma -->
<script>
  import TopNav from '../../components/ui/TopNav.svelte';

  export let onNavigate = (screen) => {};

  const podium = [
    { pos:2, name:'Lucas M.',   xp:2840, avatar:'LM', color:'#B8BEC9' },
    { pos:1, name:'Rafaela O.', xp:3120, avatar:'RO', color:'#FF6700', you:true },
    { pos:3, name:'Beatriz S.', xp:2710, avatar:'BS', color:'#CD7F3A' },
  ];
  const rest = [
    { pos:4, name:'Gabriel T.', xp:2480, avatar:'GT' },
    { pos:5, name:'Helena R.',  xp:2350, avatar:'HR' },
    { pos:6, name:'Pedro N.',   xp:2180, avatar:'PN' },
    { pos:7, name:'Sofia L.',   xp:2050, avatar:'SL' },
    { pos:8, name:'Thiago A.',  xp:1930, avatar:'TA' },
  ];

  const podiumH = { 1:100, 2:78, 3:60 };
</script>

<div class="w-full h-full bg-white flex flex-col">
  <TopNav>
    <div
      class="px-3 py-1.5 bg-pe-bg-alt rounded-14 text-[12px] font-bold text-pe-text flex items-center gap-1"
    >Semana ▾</div>
  </TopNav>

  <div class="px-6 pb-2">
    <p class="text-[12px] font-bold uppercase tracking-wide text-pe-secondary mb-1">🏆 Ranking · 9º ano A</p>
    <h1 class="text-[28px] font-extrabold text-pe-text tracking-tighter">Top da turma</h1>
  </div>

  <!-- Pódio -->
  <div class="flex items-end justify-center gap-3 px-5 py-6">
    {#each podium as p}
      {@const h = podiumH[p.pos]}
      <div class="flex-1 text-center">
        <div class="relative mb-2">
          <div
            class="rounded-full flex items-center justify-center text-white font-bold mx-auto"
            style="
              width:{p.pos===1?68:56}px;
              height:{p.pos===1?68:56}px;
              background:{p.color};
              font-size:{p.pos===1?18:15}px;
              border:3px solid {p.you?'#004E98':'#FFFFFF'};
              box-shadow:0 6px 16px rgba(0,0,0,0.12);
            "
          >{p.avatar}</div>
          {#if p.pos === 1}
            <div class="absolute -top-[18px] left-1/2 -translate-x-1/2 text-[26px]">👑</div>
          {/if}
        </div>
        <p class="text-[13px] font-bold text-pe-text tracking-tight mb-0.5">
          {p.you ? 'Você' : p.name}
        </p>
        <p class="text-[11px] text-pe-text-sec font-semibold mb-2">{p.xp} XP</p>
        <div
          class="rounded-t-12 flex items-start justify-center pt-3.5 text-[28px] font-black tracking-tighter"
          style="
            height:{h}px;
            background:{p.pos===1 ? 'linear-gradient(180deg,#FF6700,#004E98)' : p.pos===2 ? 'rgba(0,78,152,0.15)' : 'rgba(255,103,0,0.15)'};
            color:{p.pos===1?'#FFFFFF':'#14213D'};
          "
        >{p.pos}</div>
      </div>
    {/each}
  </div>

  <!-- Lista restante -->
  <div class="flex-1 overflow-auto px-5 pb-5 scrollbar-none">
    {#each rest as p}
      <div
        class="flex items-center gap-3 p-3 px-3.5 bg-white rounded-12 mb-2"
        style="border:1px solid #E4E4E7;"
      >
        <p class="w-7 text-center text-[14px] font-extrabold text-pe-text-sec">{p.pos}</p>
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[13px]"
          style="background:hsl({(p.pos*47)%360},50%,55%);"
        >{p.avatar}</div>
        <div class="flex-1">
          <p class="text-[14px] font-semibold text-pe-text tracking-tight">{p.name}</p>
          <p class="text-[11px] text-pe-text-sec">Nível {Math.floor(p.xp/500)}</p>
        </div>
        <p class="text-[13px] font-bold text-pe-primary">{p.xp} XP</p>
      </div>
    {/each}
  </div>
</div>
