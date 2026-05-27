<script>
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';

  export let onNavigate = (id) => {};

  const podium = [
    { pos:2, name:'Lucas M.',   xp:2840, avatar:'LM', color:'#B8BEC9' },
    { pos:1, name:'Rafaela O.', xp:3120, avatar:'RO', color:'#FF6700', you:true },
    { pos:3, name:'Beatriz S.', xp:2710, avatar:'BS', color:'#CD7F3A' },
  ];

  const leaderboard = [
    { pos:1, name:'Rafaela O.', xp:3120, avatar:'RO', color:'#FF6700', you:true,  streak:12, level:6 },
    { pos:2, name:'Lucas M.',   xp:2840, avatar:'LM', color:'#B8BEC9', streak:8,   level:5 },
    { pos:3, name:'Beatriz S.', xp:2710, avatar:'BS', color:'#CD7F3A', streak:5,   level:5 },
    { pos:4, name:'Gabriel T.', xp:2480, avatar:'GT', color:'#60A5FA', streak:3,   level:4 },
    { pos:5, name:'Helena R.',  xp:2350, avatar:'HR', color:'#A78BFA', streak:2,   level:4 },
    { pos:6, name:'Pedro N.',   xp:2180, avatar:'PN', color:'#34D399', streak:1,   level:4 },
    { pos:7, name:'Sofia L.',   xp:2050, avatar:'SL', color:'#F472B6', streak:7,   level:3 },
    { pos:8, name:'Thiago A.',  xp:1930, avatar:'TA', color:'#FB923C', streak:0,   level:3 },
  ];

  const periods = ['Semana', 'Mês', 'Bimestre', 'Ano'];
  let activePeriod = 'Semana';

  const podiumH = { 1:120, 2:90, 3:70 };
</script>

<AppLayout title="Ranking" breadcrumbs={[{label:'Aluno'},{label:'Ranking'}]} active="ranking" {onNavigate}>
  <PageHeader
    title="Ranking da Turma 🏆"
    subtitle="9º ano A · 28 alunos"
  />

  <!-- Period tabs -->
  <div class="flex gap-1 p-1 rounded-xl mb-6 w-fit" style="background:#F1F5F9;">
    {#each periods as p}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="px-5 py-2 rounded-lg text-[13px] font-bold cursor-pointer transition-all"
        style="background:{activePeriod===p?'#FFFFFF':'transparent'}; color:{activePeriod===p?'#0F172A':'#64748B'}; box-shadow:{activePeriod===p?'0 1px 4px rgba(0,0,0,0.08)':'none'};"
        on:click={() => (activePeriod = p)}
      >{p}</div>
    {/each}
  </div>

  <div class="grid grid-cols-3 gap-5">
    <!-- Podium visual -->
    <div class="bg-white rounded-16 p-6 border border-slate-200 flex flex-col items-center">
      <h3 class="text-[14px] font-black text-slate-900 mb-8 self-start">Pódio</h3>
      <div class="flex items-end justify-center gap-4 w-full">
        {#each podium as p}
          <div class="flex-1 flex flex-col items-center">
            <div class="relative mb-3">
              {#if p.pos === 1}
                <div class="absolute -top-7 left-1/2 -translate-x-1/2 text-[28px]">👑</div>
              {/if}
              <div
                class="rounded-full flex items-center justify-center text-white font-black mx-auto"
                style="
                  width:{p.pos===1?76:60}px;
                  height:{p.pos===1?76:60}px;
                  font-size:{p.pos===1?22:16}px;
                  background:{p.color};
                  border:3px solid {p.you?'#004E98':'#FFF'};
                  box-shadow:0 8px 24px rgba(0,0,0,0.15);
                "
              >{p.avatar}</div>
            </div>
            <p class="text-[13px] font-black text-slate-900 text-center">{p.you?'Você':p.name.split(' ')[0]}</p>
            <p class="text-[11px] text-slate-500 font-semibold mb-2">{p.xp.toLocaleString()} XP</p>
            <div
              class="w-full rounded-t-12 flex items-start justify-center pt-3 text-[24px] font-black"
              style="height:{podiumH[p.pos]}px; background:{p.pos===1?'linear-gradient(180deg,#FF6700,#004E98)':p.pos===2?'rgba(0,78,152,0.12)':'rgba(205,127,58,0.15)'}; color:{p.pos===1?'#FFF':'#14213D'};"
            >{p.pos}</div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Leaderboard table -->
    <div class="col-span-2 bg-white rounded-16 border border-slate-200 overflow-hidden">
      <div class="p-4 border-b border-slate-100">
        <h3 class="text-[14px] font-black text-slate-900">Classificação completa</h3>
      </div>
      <div class="divide-y divide-slate-50">
        {#each leaderboard as p}
          <div
            class="flex items-center gap-4 px-5 py-3.5 transition-colors {p.you ? '' : 'hover:bg-slate-50'}"
            style="background:{p.you?'rgba(0,78,152,0.04)':'transparent'};"
          >
            <div class="w-8 text-center">
              <span class="text-[15px] font-black" style="color:{p.pos<=3?['#FF6700','#B8BEC9','#CD7F3A'][p.pos-1]:'#94A3B8'};">
                {p.pos <= 3 ? ['🥇','🥈','🥉'][p.pos-1] : p.pos}
              </span>
            </div>
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-[13px] flex-shrink-0" style="background:{p.color};">
              {p.avatar}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[14px] font-bold text-slate-900 truncate">{p.you ? `${p.name} (você)` : p.name}</p>
              <p class="text-[11px] text-slate-500">Nível {p.level}</p>
            </div>
            <div class="text-right">
              <p class="text-[14px] font-black text-slate-900">{p.xp.toLocaleString()} <span class="text-[11px] text-slate-400">XP</span></p>
              {#if p.streak > 0}
                <p class="text-[11px] font-bold" style="color:#FF6700;">🔥 {p.streak}d</p>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</AppLayout>
