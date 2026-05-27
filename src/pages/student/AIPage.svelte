<script>
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';

  export let onNavigate = (id) => {};

  const suggestions = [
    { emoji:'📐', title:'Funções Quadráticas',   subj:'Matemática', why:'Tópico de prova · próximo da sua zona de estudo', time:'30 min', color:'#004E98', prio:'ALTA' },
    { emoji:'🧬', title:'Meiose e mitose',        subj:'Biologia',   why:'Você acertou só 60% do simulado anterior',       time:'25 min', color:'#4CD964' },
    { emoji:'✍️', title:'Estrutura dissertativa', subj:'Português',  why:'Redação em 3 dias · peso 2',                     time:'40 min', color:'#FF2D5F' },
    { emoji:'⚗️', title:'Revisão de ácidos',     subj:'Química',    why:'Conteúdo da aula de sexta',                      time:'20 min', color:'#004E98' },
    { emoji:'⚡', title:'MRUV – exercícios',      subj:'Física',     why:'Prova em 3 dias · média atual 6.4',              time:'45 min', color:'#FFB42E', prio:'URGENTE' },
    { emoji:'📜', title:'Dom Casmurro – análise', subj:'Português',  why:'Tema recorrente em provas',                      time:'35 min', color:'#FF2D5F' },
  ];

  const insights = [
    { icon:'🎯', text:'Você estuda melhor entre 19h–22h', sub:'Baseado nos últimos 30 dias' },
    { icon:'📈', text:'Matemática melhorou 12% no bimestre', sub:'Continue com esse ritmo!' },
    { icon:'⚠️', text:'Física em risco · abaixo de 7', sub:'Priorize esta semana' },
  ];
</script>

<AppLayout title="Edu IA" breadcrumbs={[{label:'Aluno'},{label:'Edu IA'}]} active="ai" {onNavigate}>
  <PageHeader
    title="Edu IA ✦"
    subtitle="Recomendações personalizadas · atualizado há 5 minutos"
    actions={[{ label:'Atualizar recomendações', variant:'primary' }]}
  />

  <div class="grid grid-cols-3 gap-5 mb-6">
    <!-- Priority card -->
    <div class="col-span-2 rounded-16 p-6 text-white relative overflow-hidden" style="background:linear-gradient(135deg,#004E98,#0066C7);">
      <div class="absolute rounded-full" style="top:-60px;right:-40px;width:200px;height:200px;background:rgba(255,103,0,0.2);" />
      <div class="relative">
        <div class="inline-block text-[11px] font-black uppercase tracking-wide px-3 py-1 rounded-full mb-4" style="background:#FF6700;">PRIORIDADE ALTA</div>
        <h2 class="text-[22px] font-black tracking-tight leading-snug mb-2">Revisar MRUV antes da prova de Física</h2>
        <p class="text-[14px] text-white/85 leading-relaxed mb-5">
          Você teve média 6.4 e a prova é em <strong>3 dias</strong>. A IA sugere 45 min hoje com foco em exercícios de fixação.
        </p>
        <div class="flex gap-6 p-4 rounded-14" style="background:rgba(255,255,255,0.12);">
          <div class="text-center">
            <p class="text-[22px] font-black">3</p>
            <p class="text-[11px] text-white/75 font-medium">dias até a prova</p>
          </div>
          <div class="w-px bg-white/20" />
          <div class="text-center">
            <p class="text-[22px] font-black">45min</p>
            <p class="text-[11px] text-white/75 font-medium">sugeridos hoje</p>
          </div>
          <div class="w-px bg-white/20" />
          <div class="text-center">
            <p class="text-[22px] font-black">4</p>
            <p class="text-[11px] text-white/75 font-medium">tópicos críticos</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Insights -->
    <div class="bg-white rounded-16 p-5 border border-slate-200 flex flex-col gap-3">
      <h3 class="text-[14px] font-black text-slate-900 mb-1">Insights da IA</h3>
      {#each insights as ins}
        <div class="flex items-start gap-3 p-3 rounded-12" style="background:#F8FAFC;">
          <span class="text-[20px]">{ins.icon}</span>
          <div>
            <p class="text-[13px] font-bold text-slate-800 leading-snug">{ins.text}</p>
            <p class="text-[11px] text-slate-500 mt-0.5">{ins.sub}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Suggestions grid -->
  <div>
    <h3 class="text-[15px] font-black text-slate-900 mb-4 tracking-tight">Outras sugestões para hoje</h3>
    <div class="grid grid-cols-3 gap-4">
      {#each suggestions as r}
        <div class="bg-white rounded-16 p-4 border border-slate-200 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3">
          <div class="flex items-start justify-between">
            <div class="w-12 h-12 rounded-14 flex items-center justify-center text-[24px]" style="background:{r.color}15;">{r.emoji}</div>
            {#if r.prio}
              <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full" style="background:{r.prio==='URGENTE'?'#FEF2F2':'#EFF6FF'}; color:{r.prio==='URGENTE'?'#EF4444':'#004E98'};">{r.prio}</span>
            {/if}
          </div>
          <div class="flex-1">
            <p class="text-[11px] font-black uppercase tracking-wide mb-0.5" style="color:{r.color};">{r.subj}</p>
            <p class="text-[15px] font-black text-slate-900 tracking-tight leading-snug">{r.title}</p>
            <p class="text-[12px] text-slate-500 mt-1 leading-snug">{r.why}</p>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-slate-100">
            <span class="text-[12px] font-bold text-slate-500">⏱ {r.time}</span>
            <button class="px-3 py-1.5 rounded-10 text-[12px] font-bold transition-all hover:opacity-90" style="background:{r.color}; color:#FFF;">Estudar agora</button>
          </div>
        </div>
      {/each}
    </div>
  </div>
</AppLayout>
