<!-- CalendarMonth.svelte — Calendário mensal com filtro por matéria -->
<script>
  import CalHeader from '../../components/ui/CalHeader.svelte';

  export let onViewChange = (view) => {};

  const weekDays = ['D','S','T','Q','Q','S','S'];

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

  const weeks = [
    [{d:30,o:1},{d:31,o:1},{d:1},{d:2},{d:3},{d:4},{d:5}],
    [{d:6},{d:7,dot:'#004E98',subj:'Matemática'},{d:8},{d:9,dot:'#FF6700',subj:'História'},{d:10},{d:11},{d:12}],
    [{d:13,dot:'#004E98',subj:'Matemática'},{d:14},{d:15,dot:'#FF2D5F',subj:'Física'},{d:16},{d:17},{d:18,today:true,dot:'#004E98',subj:'Matemática'},{d:19}],
    [{d:20,dot:'#FF6700',subj:'História'},{d:21,dot:'#004E98',subj:'Matemática'},{d:22},{d:23,dot:'#FF2D5F',subj:'Física'},{d:24},{d:25},{d:26}],
    [{d:27},{d:28},{d:29,dot:'#004E98',subj:'Matemática'},{d:30},{d:1,o:1},{d:2,o:1},{d:3,o:1}],
  ];

  const allEvents = [
    { t:'08:00', title:'Matemática',      tag:'Aula',   color:'#004E98', subj:'Matemática' },
    { t:'11:00', title:'Biologia',         tag:'Aula',   color:'#4CD964', subj:'Biologia'   },
    { t:'14:00', title:'Entrega redação', tag:'Tarefa', color:'#FF6700', subj:'História'   },
  ];

  $: filteredWeeks = selectedSubject === 'Todas'
    ? weeks
    : weeks.map(week =>
        week.map(cell => ({
          ...cell,
          dot: cell.subj === selectedSubject ? cell.dot : null,
        }))
      );

  $: filteredEvents = selectedSubject === 'Todas'
    ? allEvents
    : allEvents.filter(e => e.subj === selectedSubject);
</script>

<div class="w-full h-full bg-white flex flex-col">
  <CalHeader title="Abril 2026" viewTabs={['Ano','Mês','Semana','Dia']} activeView="Mês" {onViewChange} />

  <!-- Filtro por matéria -->
  <div class="flex gap-2 overflow-x-auto scrollbar-none px-4 pb-3 pt-1">
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

  <div class="px-4 pb-2">
    <div class="grid grid-cols-7 text-[11px] font-bold text-pe-text-sec uppercase tracking-wide text-center pb-2">
      {#each weekDays as d}<div>{d}</div>{/each}
    </div>
    <div class="flex flex-col gap-1">
      {#each filteredWeeks as week}
        <div class="grid grid-cols-7 gap-1">
          {#each week as cell}
            <div
              class="aspect-square rounded-10 flex flex-col items-center justify-center relative"
              style="
                background: {cell.today ? '#004E98' : 'transparent'};
                opacity: {cell.o ? 0.3 : 1};
              "
            >
              <span
                class="text-[15px] font-medium"
                style="
                  color: {cell.today ? '#FFFFFF' : '#14213D'};
                  font-weight: {cell.today ? 700 : 500};
                "
              >{cell.d}</span>
              {#if cell.dot}
                <div
                  class="w-1 h-1 rounded-full mt-0.5"
                  style="background:{cell.today ? '#FFFFFF' : cell.dot};"
                />
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>

  <!-- Eventos do dia selecionado -->
  <div class="mx-5 mt-2 p-3.5 bg-pe-bg-alt rounded-14 flex-1 overflow-auto scrollbar-none">
    <p class="text-[12px] font-semibold text-pe-text-sec uppercase tracking-wide mb-2.5">
      Sábado, 18 de abril
    </p>
    {#if filteredEvents.length === 0}
      <p class="text-[13px] text-pe-text-sec text-center pt-4">Nenhum evento nesta matéria</p>
    {:else}
      {#each filteredEvents as ev, i}
        <div
          class="flex gap-3 py-2.5 items-center"
          style="border-top:{i>0 ? '1px solid #E4E4E7' : 'none'};"
        >
          <span class="text-[12px] font-bold text-pe-text-sec w-10">{ev.t}</span>
          <div class="w-[3px] h-7 rounded-sm" style="background:{ev.color};" />
          <div>
            <p class="text-[14px] font-semibold text-pe-text">{ev.title}</p>
            <p class="text-[11px] font-bold uppercase tracking-wide" style="color:{ev.color};">{ev.tag}</p>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
