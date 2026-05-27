<script>
  import { onMount } from 'svelte';
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import { api }     from '../../lib/api.js';

  export let onNavigate = (id) => {};

  const subjects = [
    { name:'Matemática', pct:85, color:'#004E98', grade:8.5, exams:3, done:2 },
    { name:'Biologia',   pct:92, color:'#4CD964', grade:9.2, exams:2, done:2 },
    { name:'Português',  pct:78, color:'#FF2D5F', grade:8.0, exams:4, done:3 },
    { name:'História',   pct:70, color:'#FF6700', grade:7.8, exams:3, done:2 },
    { name:'Química',    pct:62, color:'#004E98', grade:7.1, exams:3, done:1 },
    { name:'Física',     pct:45, color:'#FFB42E', grade:6.4, exams:4, done:1 },
  ];

  const weeks = [50,65,70,55,80,75,90,72];

  let statsData = {
    total_tasks: 0,
    done_tasks: 0,
    total_hours: 0,
    study_plan_count: 0
  };
  let loadingStats = true;

  onMount(async () => {
    try {
      statsData = await api.students.stats();
    } catch (err) {
      console.error(err);
    } finally {
      loadingStats = false;
    }
  });

  $: completionPct = statsData.total_tasks > 0 ? Math.round((statsData.done_tasks / statsData.total_tasks) * 100) : 0;

  $: stats = [
    { l:'Tarefas',   v:`${statsData.done_tasks}/${statsData.total_tasks}`, sub:`${completionPct}% concluídas`, color:'#4CD964' },
    { l:'Sessões de Foco',  v:`${statsData.study_plan_count}`,   sub:'planejadas realizadas', color:'#004E98' },
    { l:'Horas de Foco', v:`${statsData.total_hours.toFixed(1)}h`,   sub:'🔥 horas de estudo', color:'#FF6700' },
    { l:'Média Geral', v:'7.8', sub:'↑ 0.3 vs. bimestre', color:'#10B981' },
  ];
</script>

<AppLayout title="Desempenho" breadcrumbs={[{label:'Aluno'},{label:'Desempenho'}]} active="analytics" {onNavigate}>
  <PageHeader
    title="Desempenho"
    subtitle="2º bimestre · atualizado agora"
    actions={[{ label:'Exportar relatório', variant:'secondary' }]}
  />

  <!-- KPI cards -->
  <div class="grid grid-cols-4 gap-4 mb-6">
    {#each stats as s}
      <div class="bg-white rounded-14 p-4 border border-slate-200">
        <p class="text-[12px] text-slate-500 font-medium mb-1">{s.l}</p>
        <p class="text-[26px] font-black tracking-tight" style="color:{s.color};">{s.v}</p>
        <p class="text-[11px] font-bold mt-0.5" style="color:{s.color};">{s.sub}</p>
      </div>
    {/each}
  </div>

  <!-- Hero row: radial progress + bar chart -->
  <div class="grid grid-cols-3 gap-5 mb-5">
    <!-- Radial progress (blue card) -->
    <div class="rounded-16 p-6 border border-blue-900 flex flex-col items-center justify-center" style="background:linear-gradient(135deg,#004E98,#0066C7);">
      <div style="position:relative; width:140px; height:140px; flex-shrink:0;">
        <svg width="140" height="140" viewBox="0 0 140 140" style="display:block;">
          <circle cx="70" cy="70" r="58" stroke="rgba(255,255,255,0.2)" stroke-width="12" fill="none"/>
          <circle cx="70" cy="70" r="58" stroke="#FF6700" stroke-width="12" fill="none"
            stroke-linecap="round"
            stroke-dasharray={2 * Math.PI * 58}
            stroke-dashoffset={2 * Math.PI * 58 * (1 - 0.72)}
            transform="rotate(-90 70 70)"
          />
        </svg>
        <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
          <p style="font-size:34px; font-weight:900; line-height:1; color:#fff; letter-spacing:-1px;">72%</p>
          <p style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:rgba(255,255,255,0.7); margin-top:3px;">Completude</p>
        </div>
      </div>
      <p class="text-[14px] font-bold text-white mt-5 text-center leading-snug">Adiantada em relação à turma</p>
      <p class="text-[12px] mt-1" style="color:rgba(255,255,255,0.75);"><strong class="text-[17px] text-white">58 dias</strong> restantes</p>
    </div>

    <!-- Bar chart (takes 2 cols) -->
    <div class="col-span-2 bg-white rounded-16 p-5 border border-slate-200">
      <div class="flex justify-between items-baseline mb-5">
        <h2 class="text-[15px] font-black text-slate-900 tracking-tight">Horas de estudo</h2>
        <span class="text-[12px] text-slate-500">últimas 8 semanas</span>
      </div>
      <div style="display:flex; align-items:flex-end; gap:10px; height:120px; margin-bottom:8px;">
        {#each weeks as w, i}
          <div style="flex:1; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; gap:4px;">
            <span style="font-size:11px; font-weight:800; color:{i===6?'#14213D':'transparent'};">14h</span>
            <div style="
              width:100%;
              height:{w}%;
              background:{i===6?'#FF6700':'rgba(0,78,152,0.2)'};
              border-radius:6px 6px 0 0;
            "/>
          </div>
        {/each}
      </div>
      <div style="display:flex; gap:10px;">
        {#each ['S8','S9','S10','S11','S12','S13','S14','S15'] as label, i}
          <div style="flex:1; text-align:center; font-size:11px; font-weight:700; color:{i===6?'#14213D':'#94A3B8'};">{label}</div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Subject performance -->
  <div class="bg-white rounded-16 p-5 border border-slate-200">
    <div class="flex justify-between items-baseline mb-5">
      <h2 class="text-[15px] font-black text-slate-900 tracking-tight">Desempenho por matéria</h2>
      <span class="text-[12px] text-slate-500">média das avaliações</span>
    </div>
    <div class="grid grid-cols-2 gap-4">
      {#each subjects as s}
        <div class="flex items-center gap-4">
          <div class="w-32 flex-shrink-0">
            <p class="text-[13px] font-bold text-slate-700 truncate">{s.name}</p>
            <p class="text-[11px] text-slate-500">{s.exams} avaliações</p>
          </div>
          <div class="flex-1">
            <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-1">
              <div class="h-full rounded-full transition-all duration-700" style="width:{s.pct}%;background:{s.pct<50?'#EF4444':s.color};" />
            </div>
          </div>
          <div class="w-12 text-right flex-shrink-0">
            <span class="text-[14px] font-black" style="color:{s.grade<7?'#EF4444':s.color};">{s.grade.toFixed(1)}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</AppLayout>
