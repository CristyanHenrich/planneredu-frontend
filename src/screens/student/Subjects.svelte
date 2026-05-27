<!-- Subjects.svelte — Lista de matérias -->
<script>
  import TopNav      from '../../components/ui/TopNav.svelte';
  import Icon        from '../../components/ui/Icon.svelte';
  import PillTab     from '../../components/ui/PillTab.svelte';

  export let onNavigate = (screen) => {};

  let activeFilter = 'Todas';
  const filters = ['Todas','Com falta','Provas próximas','Média < 7'];

  const subjects = [
    { name:'Matemática', teacher:'Prof. Beatriz Lopes',  color:'#004E98', absences:2,  limit:15, grade:8.5, next:'Funções quadráticas · Seg' },
    { name:'História',   teacher:'Prof. Mário Castro',   color:'#FF6700', absences:1,  limit:15, grade:7.8, next:'Brasil colônia · Ter' },
    { name:'Biologia',   teacher:'Profa. Ana Clara',     color:'#4CD964', absences:0,  limit:15, grade:9.2, next:'Genética · Qua' },
    { name:'Física',     teacher:'Prof. Ricardo Sá',     color:'#FFB42E', absences:4,  limit:15, grade:6.4, next:'Prova · Qui 16:00' },
    { name:'Química',    teacher:'Profa. Luísa Martins', color:'#004E98', absences:3,  limit:15, grade:7.1, next:'Lab ácidos · Sex' },
    { name:'Português',  teacher:'Prof. Henrique Dias',  color:'#FF2D5F', absences:12, limit:15, grade:8.0, next:'Redação · Dom' },
  ];

  const barColor = (pct) => pct >= 0.8 ? '#FF2D5F' : pct >= 0.5 ? '#FFB42E' : '#4CD964';
</script>

<div class="w-full h-full bg-white flex flex-col">
  <TopNav onBack={() => {}}>
    <div class="w-10 h-10 rounded-full bg-pe-bg-alt flex items-center justify-center cursor-pointer">
      <Icon name="plus" size={20} color="#14213D" />
    </div>
  </TopNav>

  <div class="px-6 pb-3">
    <h1 class="text-[32px] font-extrabold text-pe-text tracking-tighter mb-1">Matérias</h1>
    <p class="text-[14px] text-pe-text-sec tracking-tight">6 disciplinas · 2º bimestre</p>
  </div>

  <!-- Filtros -->
  <div class="flex gap-2 px-6 pb-4 overflow-x-auto scrollbar-none">
    {#each filters as f}
      <PillTab label={f} active={activeFilter === f} on:click={() => (activeFilter = f)} />
    {/each}
  </div>

  <div class="flex-1 overflow-auto px-5 pb-5 scrollbar-none">
    <div class="flex flex-col gap-3">
      {#each subjects as s}
        {@const pct = s.absences / s.limit}
        {@const warn = pct >= 0.5}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="bg-white rounded-20 p-4 border border-slate-100 shadow-sm active:scale-[0.98] transition-all"
          on:click={() => onNavigate('subject-detail')}
        >
          <div class="flex items-center gap-4 mb-4">
            <div
              class="w-12 h-12 rounded-16 flex items-center justify-center flex-shrink-0"
              style="background:{s.color}15;"
            >
              <Icon name="book" size={24} color={s.color} />
            </div>
            <div class="flex-1">
              <p class="text-[17px] font-extrabold text-slate-900 tracking-tight leading-tight">{s.name}</p>
              <p class="text-[12px] text-slate-400 font-medium">{s.teacher}</p>
            </div>
            <div class="text-right">
              <div class="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100">
                 <p class="text-[16px] font-black tracking-tight" style="color:{s.grade < 7 ? '#EF4444' : '#14213D'};">
                   {s.grade.toFixed(1)}
                 </p>
              </div>
            </div>
          </div>

          <!-- Progresso de faltas simplificado -->
          <div class="flex items-center gap-3 mb-4">
             <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                   class="h-full rounded-full transition-all" 
                   style="width:{Math.min(pct*100,100)}%; background:{barColor(pct)};"
                />
             </div>
             <span class="text-[11px] font-bold text-slate-500 whitespace-nowrap">
               {s.absences} faltas
             </span>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-slate-50 text-[12px]">
             <div class="flex items-center gap-1.5 text-slate-400 font-medium">
                <Icon name="clock" size={13} color="#94A3B8" />
                <span>{s.next}</span>
             </div>
             <Icon name="chevron-right" size={14} color="#CBD5E1" />
          </div>
        </div>
      {/each}
    </div>
  </div>

</div>
