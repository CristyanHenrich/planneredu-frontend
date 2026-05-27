<script>
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';

  export let onNavigate = (id) => {};

  const days = [
    { d:'Seg', n:13, topics:['Mat: Funções','Fís: MRU'],                hours:2,   done:true },
    { d:'Ter', n:14, topics:['Hist: Colônia','Bio: Genética'],           hours:2,   done:true },
    { d:'Qua', n:15, topics:['Quím: Ácidos','Port: Redação'],            hours:2.5, missed:true },
    { d:'Qui', n:16, topics:['Quím: Ácidos ↺','Port: Redação ↺','Fís: MRUV'], hours:3, recovery:true },
    { d:'Sex', n:17, topics:['Mat: Revisão','Bio: Revisão'],             hours:2.5, recovery:true },
    { d:'Sáb', n:18, topics:['Simulado Geral'],                          hours:3,   today:true },
    { d:'Dom', n:19, topics:['Revisão leve'],                            hours:1 },
  ];

  const totalHours = days.reduce((a, d) => a + d.hours, 0);
  const doneHours  = days.filter(d => d.done).reduce((a, d) => a + d.hours, 0);

  const statusColor  = (d) => d.today ? '#004E98' : d.missed ? '#EF4444' : d.recovery ? '#F97316' : d.done ? '#10B981' : '#94A3B8';
  const statusLabel  = (d) => d.today ? 'Hoje' : d.missed ? 'Perdido' : d.recovery ? 'Recuperação' : d.done ? 'Concluído' : 'Pendente';
  const statusBg     = (d) => d.today ? 'rgba(0,78,152,0.07)' : d.missed ? 'rgba(239,68,68,0.07)' : d.recovery ? 'rgba(249,115,22,0.07)' : 'transparent';
</script>

<AppLayout title="Cronograma" breadcrumbs={[{label:'Aluno'},{label:'Cronograma'}]} active="study-plan" {onNavigate}>
  <PageHeader
    title="Cronograma de Estudos"
    subtitle="Gerado por IA · Semana 13–19 abr"
    actions={[{ label:'Regenerar com IA ✦', variant:'primary' }]}
  />

  <!-- Stats row -->
  <div class="grid grid-cols-4 gap-4 mb-6">
    {#each [
      { label:'Total da semana',  value:`${totalHours}h`,  color:'#004E98', sub:'planejado'    },
      { label:'Concluído',        value:`${doneHours}h`,   color:'#10B981', sub:'até agora'    },
      { label:'Modo Recuperação', value:'Ativo',           color:'#F97316', sub:'+2.5h redistribuídas' },
      { label:'Simulado',         value:'Hoje',            color:'#FF2D5F', sub:'às 08:00 · Sáb 18'   },
    ] as s}
      <div class="bg-white rounded-14 p-4 border border-slate-200">
        <p class="text-[12px] text-slate-500 font-medium mb-1">{s.label}</p>
        <p class="text-[24px] font-black tracking-tight" style="color:{s.color};">{s.value}</p>
        <p class="text-[11px] font-bold mt-0.5" style="color:{s.color};">{s.sub}</p>
      </div>
    {/each}
  </div>

  <!-- Recovery banner -->
  <div class="rounded-16 p-5 mb-6 flex items-center gap-4" style="background:linear-gradient(135deg,#004E98,#0066C7);">
    <div class="w-12 h-12 rounded-14 flex items-center justify-center text-2xl flex-shrink-0" style="background:rgba(255,255,255,0.15);">⚡</div>
    <div class="flex-1">
      <p class="text-[15px] font-black text-white mb-0.5">Modo de Recuperação ativo</p>
      <p class="text-[13px] text-white/90">Você perdeu quarta-feira. Redistribuímos <strong>2.5h</strong> entre quinta e sexta para manter o cronograma.</p>
    </div>
    <button class="px-4 py-2 rounded-12 text-[13px] font-bold transition-all hover:opacity-90 flex-shrink-0" style="background:rgba(255,255,255,0.2); color:#FFF;">Ver detalhes</button>
  </div>

  <!-- Days list -->
  <div class="bg-white rounded-16 border border-slate-200 overflow-hidden">
    {#each days as d, i}
      <div
        class="flex items-center gap-4 p-4 transition-colors {i < days.length-1 ? 'border-b border-slate-100' : ''}"
        style="background:{statusBg(d)};"
      >
        <!-- Day indicator -->
        <div class="w-16 flex-shrink-0 text-center">
          <p class="text-[11px] font-black uppercase tracking-wide text-slate-400">{d.d}</p>
          <p class="text-[26px] font-black tracking-tight" style="color:{d.today?'#004E98':d.done?'#CBD5E1':'#14213D'};">{d.n}</p>
        </div>

        <!-- Status badge -->
        <div class="w-28 flex-shrink-0">
          <span class="inline-block px-3 py-1 rounded-full text-[11px] font-black" style="background:{statusColor(d)}20; color:{statusColor(d)};">
            {statusLabel(d)}
          </span>
        </div>

        <!-- Topics -->
        <div class="flex-1 flex flex-wrap gap-2">
          {#each d.topics as topic}
            <span class="px-3 py-1 rounded-10 text-[12px] font-semibold text-slate-700" style="background:#F1F5F9;">{topic}</span>
          {/each}
        </div>

        <!-- Hours -->
        <div class="text-right flex-shrink-0">
          <p class="text-[18px] font-black" style="color:{d.today?'#004E98':'#14213D'};">{d.hours}h</p>
          <p class="text-[11px] text-slate-500 font-medium">de estudo</p>
        </div>
      </div>
    {/each}
  </div>
</AppLayout>
