<!-- CalendarDay.svelte — Calendário diário com filtro por matéria -->
<script>
  import CalHeader from '../../components/ui/CalHeader.svelte';

  export let onViewChange = (view) => {};

  const subjects = [
    { name:'Todas',      color:'#14213D' },
    { name:'Matemática', color:'#004E98' },
    { name:'História',   color:'#FF6700' },
    { name:'Biologia',   color:'#4CD964' },
    { name:'Física',     color:'#FF2D5F' },
    { name:'Química',    color:'#5856D6' },
    { name:'Português',  color:'#FFB42E' },
  ];

  let selectedSubject = 'Todas';

  const allEvents = [
    { t:'08:00', dur:60, title:'Matemática · Funções',  tag:'Aula',   color:'#004E98', room:'Sala 204',  subj:'Matemática' },
    { t:'10:30', dur:50, title:'História',               tag:'Aula',   color:'#FF6700', room:'Sala 112',  subj:'História'   },
    { t:'14:00', dur:30, title:'Redação Brasil colônia', tag:'Tarefa', color:'#FF6700',                   subj:'História'   },
    { t:'16:00', dur:90, title:'Prova de Física',         tag:'Prova',  color:'#FF2D5F', room:'Auditório', subj:'Física'     },
    { t:'19:00', dur:60, title:'Estudo cronograma',       tag:'Estudo', color:'#4CD964',                   subj:'Biologia'   },
  ];

  $: events = selectedSubject === 'Todas'
    ? allEvents
    : allEvents.filter(e => e.subj === selectedSubject);
</script>

<div class="w-full h-full bg-white flex flex-col">
  <CalHeader title="Sáb, 18 abr" viewTabs={['Ano','Mês','Semana','Dia']} activeView="Dia" {onViewChange} />

  <!-- Filtro por matéria -->
  <div class="flex gap-2 overflow-x-auto scrollbar-none px-4 pb-2 pt-1">
    {#each subjects as s}
      <button
        class="flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-bold border transition-all"
        style="
          background: {selectedSubject === s.name ? s.color : '#FFFFFF'};
          border-color: {selectedSubject === s.name ? s.color : '#E4E4E7'};
          color: {selectedSubject === s.name ? '#FFFFFF' : '#6B7280'};
        "
        on:click={() => selectedSubject = s.name}
      >{s.name}</button>
    {/each}
  </div>

  <div class="flex-1 overflow-auto px-5 pb-5 scrollbar-none">
    {#if events.length === 0}
      <p class="text-[13px] text-pe-text-sec text-center pt-8">Nenhum evento nesta matéria</p>
    {:else}
      <div class="flex flex-col gap-2.5">
        {#each events as ev}
          <div class="flex gap-3">
            <div class="pt-0.5" style="width:52px;">
              <p class="text-[13px] font-bold text-pe-text">{ev.t}</p>
              <p class="text-[10px] text-pe-text-sec">{ev.dur}min</p>
            </div>
            <div
              class="flex-1 rounded-10 p-3 px-3.5"
              style="
                border: 1px solid #E4E4E7;
                border-left: 4px solid {ev.color};
                background: #FFFFFF;
              "
            >
              <p
                class="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                style="color:{ev.color};"
              >{ev.tag}</p>
              <p class="text-[15px] font-bold text-pe-text tracking-tight">{ev.title}</p>
              {#if ev.room}
                <p class="text-[12px] text-pe-text-sec mt-0.5">{ev.room}</p>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
