<!-- KanbanDetail.svelte — Detalhe de um card Kanban -->
<script>
  import TopNav       from '../../components/ui/TopNav.svelte';
  import SectionLabel from '../../components/ui/SectionLabel.svelte';
  import Icon         from '../../components/ui/Icon.svelte';

  export let onNavigate = (screen) => {};

  const subtasks = [
    { title:'Ler capítulo 4 do livro',  done:true },
    { title:'Fazer fichamento',          done:true },
    { title:'Escrever introdução',       done:false, active:true },
    { title:'Desenvolvimento e análise', done:false },
  ];
</script>

<div class="w-full h-full bg-white flex flex-col">
  <TopNav onBack={() => onNavigate('kanban')} />

  <div class="flex-1 overflow-auto px-6 pb-5 scrollbar-none">
    <p class="text-[10px] font-bold uppercase tracking-wide text-pe-secondary mb-2">HISTÓRIA · TRABALHO</p>
    <h1 class="text-[26px] font-extrabold text-pe-text tracking-tighter mb-3">
      Redação: Brasil colônia
    </h1>

    <!-- Status badges -->
    <div class="flex gap-2 mb-4">
      <div
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-14 text-[12px] font-bold text-white"
        style="background:#004E98;"
      >
        <div class="w-1.5 h-1.5 rounded-full bg-white" />
        Fazendo
      </div>
      <div
        class="px-3 py-1.5 rounded-14 text-[12px] font-bold"
        style="background:rgba(255,45,95,0.1); color:#FF2D5F;"
      >⏰ Entrega amanhã · 14:00</div>
    </div>

    <!-- Progresso -->
    <div class="bg-pe-bg-alt rounded-12 p-3.5 mb-5">
      <div class="flex justify-between mb-2">
        <p class="text-[13px] font-bold text-pe-text">Progresso</p>
        <p class="text-[13px] font-bold text-pe-primary">50%</p>
      </div>
      <div class="h-2 bg-white rounded overflow-hidden">
        <div class="w-1/2 h-full bg-pe-primary rounded" />
      </div>
    </div>

    <SectionLabel text="Subtarefas" right="+ Adicionar" />

    {#each subtasks as st, i}
      <div
        class="flex items-center gap-3 py-2.5"
        style="border-bottom:{i < subtasks.length-1 ? '1px solid #E4E4E7' : 'none'};"
      >
        <div
          class="w-5.5 h-5.5 rounded-full flex items-center justify-center flex-shrink-0"
          style="
            width:22px;height:22px;
            border:2px solid {st.done ? '#4CD964' : '#E4E4E7'};
            background:{st.done ? '#4CD964' : 'transparent'};
          "
        >
          {#if st.done}
            <Icon name="check" size={12} color="#FFFFFF" />
          {/if}
        </div>
        <p
          class="flex-1 text-[14px]"
          style="
            color:{st.done ? '#6B7280' : '#14213D'};
            text-decoration:{st.done ? 'line-through' : 'none'};
            font-weight:{st.active ? 600 : 500};
          "
        >{st.title}</p>
      </div>
    {/each}
  </div>
</div>
