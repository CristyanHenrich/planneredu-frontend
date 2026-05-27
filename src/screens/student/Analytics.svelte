<!-- Analytics.svelte — Painel de desempenho -->
<script>
  import TopNav       from '../../components/ui/TopNav.svelte';
  import SectionLabel from '../../components/ui/SectionLabel.svelte';

  export let onNavigate = (screen) => {};

  const subjects = [
    { name:'Matemática', pct:85, color:'#004E98' },
    { name:'Biologia',   pct:92, color:'#4CD964' },
    { name:'Português',  pct:78, color:'#FF2D5F' },
    { name:'Física',     pct:45, color:'#FFB42E' },
  ];
  const weeks = [50,65,70,55,80,75,90,72];
  const stats = [
    { l:'Tarefas',   v:'34/42', sub:'81%',       color:'#4CD964' },
    { l:'Projetos',  v:'4/6',   sub:'67%',        color:'#004E98' },
    { l:'Sequência', v:'12d',   sub:'🔥 recorde', color:'#FF6700' },
  ];
</script>

<div class="w-full h-full bg-white flex flex-col">
  <TopNav />

  <div class="flex-1 overflow-auto px-5 pb-5 scrollbar-none">
    <div class="px-1 pb-3">
      <p class="text-[12px] text-pe-text-sec font-semibold uppercase tracking-wide mb-1">Painel</p>
      <h1 class="text-[30px] font-extrabold text-pe-text tracking-tighter">Desempenho</h1>
    </div>

    <!-- Hero: progresso geral -->
    <div class="text-white rounded-18 p-5 mb-4" style="background:#004E98;">
      <div class="flex gap-4 items-center">
        <!-- Radial progress: container position:relative, SVG exibe, texto em absolute sobre o SVG -->
        <div style="position:relative; width:96px; height:96px; flex-shrink:0;">
          <svg width="96" height="96" viewBox="0 0 96 96" style="display:block;">
            <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.2)" stroke-width="9" fill="none"/>
            <circle cx="48" cy="48" r="40" stroke="#FF6700" stroke-width="9" fill="none"
              stroke-linecap="round"
              stroke-dasharray={2 * Math.PI * 40}
              stroke-dashoffset={2 * Math.PI * 40 * (1 - 0.72)}
              transform="rotate(-90 48 48)"
            />
          </svg>
          <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <p style="font-size:22px; font-weight:800; line-height:1; letter-spacing:-0.5px; color:#fff;">72%</p>
            <p style="font-size:8px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; opacity:0.75; color:#fff; margin-top:2px;">Geral</p>
          </div>
        </div>
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-wide opacity-80 mb-1">2º Bimestre</p>
          <p class="text-[15px] font-bold tracking-tight leading-snug mb-2">
            Adiantada em relação à turma
          </p>
          <p class="text-[12px] opacity-90">
            <strong class="text-[16px]">58 dias</strong> restantes
          </p>
        </div>
      </div>
    </div>

    <!-- Mini stats -->
    <div class="flex gap-2 mb-4">
      {#each stats as s}
        <div class="flex-1 bg-white rounded-12 p-3" style="border:1px solid #E4E4E7;">
          <p class="text-[10px] font-bold text-pe-text-sec uppercase tracking-wide">{s.l}</p>
          <p class="text-[18px] font-extrabold text-pe-text tracking-tight mt-0.5">{s.v}</p>
          <p class="text-[11px] font-semibold mt-0.5" style="color:{s.color};">{s.sub}</p>
        </div>
      {/each}
    </div>

    <!-- Gráfico de barras semanal — container com altura fixa, barras crescem de baixo -->
    <div class="bg-white rounded-14 p-4 mb-4" style="border:1px solid #E4E4E7;">
      <div class="flex justify-between items-baseline mb-3">
        <p class="text-[14px] font-bold text-pe-text tracking-tight">Horas de estudo</p>
        <p class="text-[11px] text-pe-text-sec">8 semanas</p>
      </div>
      <div style="display:flex; align-items:flex-end; gap:4px; height:72px;">
        {#each weeks as w, i}
          <div style="flex:1; height:100%; display:flex; align-items:flex-end;">
            <div style="
              width:100%;
              height:{w}%;
              background:{i===6?'#FF6700':'rgba(0,78,152,0.22)'};
              border-radius:4px 4px 0 0;
              position:relative;
            ">
              {#if i === 6}
                <span style="position:absolute; top:-16px; left:50%; transform:translateX(-50%); font-size:9px; font-weight:800; color:#14213D; white-space:nowrap;">14h</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
      <div style="display:flex; gap:4px; margin-top:4px;">
        {#each ['S8','S9','S10','S11','S12','S13','S14','S15'] as lbl, i}
          <div style="flex:1; text-align:center; font-size:9px; color:{i===6?'#14213D':'#9CA3AF'}; font-weight:{i===6?700:500};">{lbl}</div>
        {/each}
      </div>
    </div>

    <SectionLabel text="Por matéria" />
    {#each subjects as s}
      <div class="bg-white rounded-12 p-3 px-3.5 mb-2" style="border:1px solid #E4E4E7;">
        <div class="flex justify-between mb-1.5">
          <p class="text-[13px] font-semibold text-pe-text">{s.name}</p>
          <p class="text-[13px] font-bold" style="color:{s.pct<50?'#FF2D5F':s.color};">{s.pct}%</p>
        </div>
        <div class="h-1.5 bg-pe-bg-alt rounded-sm overflow-hidden">
          <div
            class="h-full rounded-sm"
            style="width:{s.pct}%;background:{s.pct<50?'#FF2D5F':s.color};"
          />
        </div>
      </div>
    {/each}
  </div>
</div>
