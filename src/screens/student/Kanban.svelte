<!-- Kanban.svelte — Quadro Kanban de tarefas -->
<script>
  import TopNav from '../../components/ui/TopNav.svelte';
  import Icon   from '../../components/ui/Icon.svelte';

  export let onNavigate = (screen) => {};

  const columns = [
    { title:'A fazer',  color:'#6B7280', count:3, cards:[
      { title:'TCC · Revisão bibliográfica', subj:'TCC',      color:'#004E98', due:'22 abr', sub:[0,4] },
      { title:'Relatório de Biologia',       subj:'Biologia', color:'#4CD964', due:'28 abr', sub:[0,3] },
    ]},
    { title:'Fazendo',  color:'#004E98', count:2, cards:[
      { title:'Redação Brasil colônia',      subj:'História', color:'#FF6700', due:'Amanhã', sub:[2,4], active:true },
      { title:'Seminário Química',           subj:'Química',  color:'#004E98', due:'25 abr', sub:[1,5] },
    ]},
    { title:'Revisão',  color:'#FFB42E', count:1, cards:[
      { title:'Lista física MRUV',           subj:'Física',   color:'#FFB42E', due:'Hoje',   sub:[5,5] },
    ]},
    { title:'Entregue', color:'#4CD964', count:4, cards:[
      { title:'Exercícios cap. 3',           subj:'Matemática',color:'#004E98',due:'10 abr', done:true },
      { title:'Leitura Dom Casmurro',        subj:'Português', color:'#FF2D5F',done:true },
    ]},
  ];
</script>

<div class="w-full h-full flex flex-col" style="background:#F5F6F8;">
  <TopNav>
    <div class="flex gap-2">
      <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center">
        <Icon name="search" size={18} color="#14213D" />
      </div>
      <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background:#004E98;">
        <Icon name="plus" size={20} color="#FFFFFF" />
      </div>
    </div>
  </TopNav>

  <div class="px-6 pb-2">
    <p class="text-[12px] text-pe-text-sec font-semibold uppercase tracking-wide mb-1">Projetos</p>
    <h1 class="text-[30px] font-extrabold text-pe-text tracking-tighter">Kanban</h1>
  </div>

  <!-- Barra de progresso geral simplificada -->
  <div class="px-6 pb-6 flex items-center gap-4">
    <div class="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden flex">
      <div class="h-full bg-pe-success" style="width: 40%" />
      <div class="h-full bg-pe-warning" style="width: 20%" />
      <div class="h-full bg-pe-primary" style="width: 20%" />
    </div>
    <div class="text-right">
       <p class="text-[14px] font-black text-slate-900 leading-none">80%</p>
       <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Total</p>
    </div>
  </div>

  <!-- Colunas scrolláveis horizontalmente -->
  <div class="flex-1 overflow-auto flex gap-4 px-6 pb-8 scrollbar-none">
    {#each columns as col}
      <div class="w-[280px] flex-shrink-0 flex flex-col gap-4">
        <!-- Título da coluna elegante -->
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <p class="text-[15px] font-black text-slate-900 tracking-tight">{col.title}</p>
            <span class="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {col.count}
            </span>
          </div>
          <Icon name="more" size={16} color="#CBD5E1" />
        </div>

        <div class="flex flex-col gap-3">
          {#each col.cards as card}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              class="bg-white rounded-20 p-4 shadow-sm active:scale-[0.98] transition-all border border-transparent"
              style="
                {card.active ? 'border-color: #004E98; box-shadow: 0 10px 20px rgba(0,78,152,0.08);' : ''}
                opacity: {card.done ? 0.6 : 1};
              "
              on:click={() => onNavigate('kanban-detail')}
            >
              <div class="flex justify-between items-start mb-2">
                <span 
                   class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
                   style="background:{card.color}15; color:{card.color};"
                >
                  {card.subj}
                </span>
                {#if card.due}
                   <span class="text-[10px] font-bold {card.due==='Hoje'||card.due==='Amanhã'?'text-red-500':'text-slate-400'}">
                     {card.due}
                   </span>
                {/if}
              </div>
              
              <p
                class="text-[14px] font-bold text-slate-900 tracking-tight leading-snug mb-3"
                style="text-decoration:{card.done ? 'line-through' : 'none'};"
              >{card.title}</p>

              {#if card.sub}
                {@const pct = card.sub[0] / card.sub[1]}
                <div class="flex items-center gap-2">
                   <div class="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full rounded-full" style="width:{pct*100}%; background:{card.color};" />
                   </div>
                   <span class="text-[10px] font-bold text-slate-400">{card.sub[0]}/{card.sub[1]}</span>
                </div>
              {/if}

              {#if card.done}
                <div class="flex items-center gap-1.5 text-[11px] font-bold text-pe-success mt-1">
                  <Icon name="check" size={12} color="#4CD964" />
                  Concluído
                </div>
              {/if}
            </div>
          {/each}

          <button class="py-3 px-4 flex items-center justify-center gap-2 text-[13px] font-bold text-slate-400 bg-white/50 rounded-20 border-2 border-dashed border-slate-200">
            <Icon name="plus" size={16} color="#94A3B8" />
            Adicionar tarefa
          </button>
        </div>
      </div>
    {/each}
  </div>

</div>
