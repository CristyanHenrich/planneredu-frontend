<!-- CalendarWeek.svelte — Calendário semanal com filtro por matéria -->
<script>
  import CalHeader from '../../components/ui/CalHeader.svelte';

  export let onViewChange = (view) => {};

  const hours   = ['08','09','10','11','12','13','14'];
  const days    = ['SEG 13','TER 14','QUA 15','QUI 16','SEX 17','SÁB 18','DOM 19'];
  const todayIdx = 5;

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
    { d:0, h:0, dur:1, title:'Mat',       color:'#004E98', subj:'Matemática' },
    { d:0, h:2, dur:1, title:'Hist',      color:'#FF6700', subj:'História'   },
    { d:1, h:1, dur:2, title:'Bio Lab',   color:'#4CD964', subj:'Biologia'   },
    { d:2, h:0, dur:1, title:'Mat',       color:'#004E98', subj:'Matemática' },
    { d:2, h:3, dur:1, title:'Prova Fís', color:'#FF2D5F', subj:'Física'     },
    { d:3, h:1, dur:1, title:'Port',      color:'#FFB42E', subj:'Português'  },
    { d:4, h:2, dur:2, title:'Quím',      color:'#5856D6', subj:'Química'    },
    { d:5, h:0, dur:1, title:'Redação',   color:'#FF6700', subj:'História'   },
  ];

  $: events = selectedSubject === 'Todas'
    ? allEvents
    : allEvents.filter(e => e.subj === selectedSubject);
</script>

<div class="w-full h-full bg-white flex flex-col">
  <CalHeader title="13 – 19 abr" viewTabs={['Ano','Mês','Semana','Dia']} activeView="Semana" {onViewChange} />

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

  <div class="flex-1 overflow-auto scrollbar-none">
    <!-- Header dias -->
    <div class="flex pl-2">
      <div class="w-8" />
      {#each days as day, i}
        <div class="flex-1 text-center py-1 pb-2">
          <p class="text-[10px] font-bold text-pe-text-sec tracking-wider">{day.split(' ')[0]}</p>
          <div
            class="w-[26px] h-[26px] rounded-full flex items-center justify-center mx-auto mt-0.5 text-[14px] font-bold"
            style="
              background: {i === todayIdx ? '#004E98' : 'transparent'};
              color:      {i === todayIdx ? '#FFFFFF'  : '#14213D'};
            "
          >{day.split(' ')[1]}</div>
        </div>
      {/each}
    </div>

    <!-- Grid de horas + eventos -->
    <div class="relative px-2 pb-4">
      {#each hours as hour}
        <div class="flex h-[54px]" style="border-top:1px solid #E4E4E7;">
          <div class="w-8 text-[10px] text-pe-text-sec font-semibold pt-1">{hour}:00</div>
          <div class="flex-1" />
        </div>
      {/each}

      {#each events as ev}
        <div
          class="absolute rounded text-[10px] font-bold text-white px-1.5 py-1 overflow-hidden"
          style="
            top:    {54 * ev.h + 1}px;
            height: {54 * ev.dur - 2}px;
            left:   calc({40 + 8}px + (100% - {40 + 16}px) * {ev.d}/7);
            width:  calc((100% - {40 + 16}px) / 7 - 3px);
            background: {ev.color};
          "
        >{ev.title}</div>
      {/each}
    </div>
  </div>
</div>
