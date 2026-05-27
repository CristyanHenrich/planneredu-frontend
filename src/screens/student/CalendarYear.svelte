<!-- CalendarYear.svelte — Calendário anual com mini-grades mensais scrolláveis -->
<script>
  import CalHeader from '../../components/ui/CalHeader.svelte';

  export let onNavigate = (screen) => {};
  export let onViewChange = (view) => {};

  const year = 2026;
  const currentMonthIdx = 3; // Abril
  const todayDay = 18;

  const weekDays = ['D','S','T','Q','Q','S','S'];
  const monthNames = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];

  const monthEventDays = [
    { 7:'#004E98', 14:'#FF6700', 21:'#FF2D5F' },
    { 4:'#004E98', 11:'#4CD964', 18:'#FF2D5F', 25:'#FF6700' },
    { 5:'#FF6700', 12:'#004E98', 19:'#FF2D5F', 26:'#4CD964' },
    { 7:'#004E98', 9:'#FF6700', 15:'#FF2D5F', 18:'#004E98', 20:'#FF6700', 21:'#004E98', 23:'#FF2D5F', 29:'#004E98' },
    { 3:'#004E98', 10:'#FF6700', 17:'#FF2D5F' },
    { 2:'#4CD964', 9:'#004E98', 16:'#FF6700' },
    {},
    {},
    { 1:'#FF2D5F', 8:'#004E98', 15:'#FF6700', 22:'#4CD964' },
    { 6:'#004E98', 13:'#FF6700', 20:'#FF2D5F' },
    { 3:'#004E98', 10:'#4CD964' },
    { 1:'#FF6700' },
  ];

  function getMonthCells(yr, monthIdx) {
    const firstDay = new Date(yr, monthIdx, 1).getDay();
    const daysInMonth = new Date(yr, monthIdx + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ d, dot: monthEventDays[monthIdx][d] || null });
    }
    return cells;
  }

  const allMonths = monthNames.map((name, i) => ({
    name,
    cells: getMonthCells(year, i),
    isCurrent: i === currentMonthIdx,
  }));
</script>

<div class="w-full h-full bg-white flex flex-col">
  <CalHeader title="2026" viewTabs={['Ano','Mês','Semana','Dia']} activeView="Ano" {onViewChange} />

  <div class="flex-1 overflow-auto px-4 pb-6 scrollbar-none">
    {#each allMonths as month}
      <div
        class="mb-4 rounded-16 p-3.5 pt-3"
        style="
          background: {month.isCurrent ? '#EEF4FF' : '#F8FAFC'};
          border: 1.5px solid {month.isCurrent ? '#004E98' : '#F1F5F9'};
        "
      >
        <p
          class="text-[15px] font-extrabold text-center mb-2.5"
          style="color:{month.isCurrent ? '#004E98' : '#14213D'};"
        >{month.name}</p>

        <div class="grid grid-cols-7 text-[9px] font-bold text-pe-text-sec uppercase tracking-wide text-center mb-1">
          {#each weekDays as d}<div>{d}</div>{/each}
        </div>

        <div class="grid grid-cols-7 gap-0.5">
          {#each month.cells as cell}
            {#if cell === null}
              <div class="aspect-square" />
            {:else}
              {@const isToday = month.isCurrent && cell.d === todayDay}
              <div
                class="aspect-square rounded-md flex flex-col items-center justify-center"
                style="background:{isToday ? '#004E98' : 'transparent'};"
              >
                <span
                  class="text-[11px] leading-none"
                  style="
                    font-weight: {isToday || cell.dot ? 600 : 400};
                    color: {isToday ? '#FFFFFF' : '#14213D'};
                  "
                >{cell.d}</span>
                {#if cell.dot}
                  <div
                    class="w-1 h-1 rounded-full mt-0.5"
                    style="background:{isToday ? '#FFFFFF' : cell.dot};"
                  />
                {/if}
              </div>
            {/if}
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
