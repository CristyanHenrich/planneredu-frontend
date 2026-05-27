<script>
  import { onMount } from 'svelte';
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import Modal      from '../../components/ui/Modal.svelte';
  import { api }   from '../../lib/api.js';

  export let onNavigate = (id) => {};

  let events  = [];
  let loading = true;
  let error   = null;

  onMount(async () => {
    try {
      events = await api.calendar.list() ?? [];
    } catch {
      error = 'Erro ao carregar eventos.';
    } finally {
      loading = false;
    }
  });

  const MONTH_NAMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const WEEK_DAYS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const TYPE_LABEL  = { exam: 'Prova', work: 'Trabalho', activity: 'Atividade', personal: 'Pessoal' };
  const TYPE_COLOR  = { exam: '#FF2D5F', work: '#004E98', activity: '#FF6700', personal: '#7C3AED' };
  const TYPE_MAP    = { 'Prova': 'exam', 'Trabalho': 'work', 'Atividade': 'activity', 'Pessoal': 'personal' };

  let activeView = 'Mês';
  const VIEWS    = ['Mês', 'Dia', 'Ano'];
  let filterType = 'Todos';
  const FILTERS  = ['Todos', 'Prova', 'Trabalho', 'Atividade', 'Pessoal'];

  $: filteredEvents = filterType === 'Todos'
    ? events
    : events.filter(e => e.type === TYPE_MAP[filterType]);

  const today   = new Date();
  let viewYear  = today.getFullYear();
  let viewMonth = today.getMonth() + 1;
  let selectedDay = today.getDate();

  function prevMonth() {
    if (viewMonth === 1) { viewYear--; viewMonth = 12; } else viewMonth--;
    selectedDay = null;
  }
  function nextMonth() {
    if (viewMonth === 12) { viewYear++; viewMonth = 1; } else viewMonth++;
    selectedDay = null;
  }

  let calendarCells = [];
  $: {
    const firstDow  = new Date(viewYear, viewMonth - 1, 1).getDay();
    const daysInMon = new Date(viewYear, viewMonth, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMon; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    calendarCells = cells;
  }

  function eventsForDay(day) {
    if (!day) return [];
    return filteredEvents.filter(e => {
      const d = new Date(e.date);
      return d.getUTCFullYear() === viewYear && d.getUTCMonth() + 1 === viewMonth && d.getUTCDate() === day;
    });
  }

  function isToday(day) {
    return day === today.getDate() && viewMonth === today.getMonth() + 1 && viewYear === today.getFullYear();
  }

  $: sidebarEvents = selectedDay ? eventsForDay(selectedDay) : [];
  $: todayEventCount = filteredEvents.filter(e => {
    const d = new Date(e.date);
    return d.getUTCFullYear() === today.getFullYear() && d.getUTCMonth() + 1 === today.getMonth() + 1 && d.getUTCDate() === today.getDate();
  }).length;

  let showCreate  = false;
  let createForm  = { title: '', date: '', description: '' };
  let creating    = false;
  let createError = null;

  function openCreate() {
    const pad = n => String(n).padStart(2, '0');
    const d = selectedDay ?? today.getDate();
    const m = selectedDay ? viewMonth : today.getMonth() + 1;
    const y = selectedDay ? viewYear  : today.getFullYear();
    createForm  = { title: '', date: `${y}-${pad(m)}-${pad(d)}`, description: '' };
    createError = null;
    showCreate  = true;
  }

  async function submitCreate() {
    if (!createForm.title.trim()) { createError = 'O título é obrigatório'; return; }
    if (!createForm.date)         { createError = 'A data é obrigatória'; return; }
    creating    = true;
    createError = null;
    try {
      const ev = await api.calendar.create({
        title:       createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        date:        createForm.date,
        type:        'personal',
      });
      events     = [...events, ev];
      showCreate = false;
    } catch {
      createError = 'Erro ao criar evento.';
    } finally {
      creating = false;
    }
  }

  async function deleteEvent(ev) {
    if (!ev.can_delete) return;
    try {
      await api.calendar.delete(ev.id);
      events = events.filter(e => e.id !== ev.id);
    } catch {}
  }

  function eventsForMonth(month) {
    return events.filter(e => {
      const d = new Date(e.date);
      return d.getUTCFullYear() === viewYear && d.getUTCMonth() + 1 === month;
    });
  }

  function heatColor(n) {
    if (n >= 6) return '#FF2D5F';
    if (n >= 3) return '#FF6700';
    return '#004E98';
  }

  function eventColor(ev) {
    return ev.color || TYPE_COLOR[ev.type] || '#6B7280';
  }

  function formatSidebarDate(day) {
    if (!day) return '';
    return new Date(viewYear, viewMonth - 1, day)
      .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  async function reload() {
    loading = true; error = null;
    try { events = await api.calendar.list() ?? []; }
    catch { error = 'Erro ao carregar eventos.'; }
    finally { loading = false; }
  }
</script>

<AppLayout title="Calendário" active="calendar" {onNavigate}>
  <PageHeader
    title="Calendário"
    subtitle="{MONTH_NAMES[viewMonth-1]} {viewYear} · {todayEventCount} {todayEventCount === 1 ? 'evento hoje' : 'eventos hoje'}"
    actions={[{ label:'+ Novo evento', variant:'primary', onClick: openCreate }]}
  />

  <!-- View tabs + type filter -->
  <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
    <div class="flex gap-1 p-1 rounded-xl" style="background:#F1F5F9;">
      {#each VIEWS as v}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="px-5 py-2 rounded-lg text-[13px] font-bold cursor-pointer transition-all"
          style="background:{activeView===v?'#FFFFFF':'transparent'};color:{activeView===v?'#0F172A':'#64748B'};box-shadow:{activeView===v?'0 1px 4px rgba(0,0,0,0.08)':'none'};"
          on:click={() => activeView = v}
        >{v}</div>
      {/each}
    </div>

    {#if activeView !== 'Ano'}
      <div class="flex gap-2 flex-wrap">
        {#each FILTERS as f}
          {@const col = f === 'Todos' ? '#14213D' : TYPE_COLOR[TYPE_MAP[f]]}
          <button
            class="rounded-full px-3.5 py-1.5 text-[12px] font-bold border transition-all"
            style="background:{filterType===f?col:'#FFFFFF'};border-color:{filterType===f?col:'#E2E8F0'};color:{filterType===f?'#FFFFFF':'#64748B'};"
            on:click={() => filterType = f}
          >{f}</button>
        {/each}
      </div>
    {/if}
  </div>

  {#if loading}
    <div class="flex items-center justify-center h-64">
      <span class="w-7 h-7 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></span>
    </div>

  {:else if error}
    <div class="flex flex-col items-center justify-center h-64 gap-3">
      <p class="text-slate-500 text-[14px]">{error}</p>
      <button class="px-4 py-2 bg-blue-600 text-white text-[13px] font-semibold rounded-10" on:click={reload}>Tentar novamente</button>
    </div>

  {:else if activeView === 'Mês'}
    <!-- ═══════════ MÊS ═══════════ -->
    <div class="grid grid-cols-3 gap-5">

      <!-- Calendar grid -->
      <div class="col-span-2 bg-white rounded-16 p-5 border border-slate-200">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-[17px] font-black text-slate-900 tracking-tight">{MONTH_NAMES[viewMonth-1]} {viewYear}</h2>
          <div class="flex gap-1">
            <button class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold" on:click={prevMonth}>‹</button>
            <button class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold" on:click={nextMonth}>›</button>
          </div>
        </div>

        <div class="grid grid-cols-7 text-[11px] font-black uppercase tracking-wide text-slate-400 text-center mb-2">
          {#each WEEK_DAYS as d}<div>{d}</div>{/each}
        </div>

        <div class="grid grid-cols-7 gap-1">
          {#each calendarCells as cell}
            {@const dayEvs = eventsForDay(cell)}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              class="aspect-square rounded-12 flex flex-col items-center justify-center cursor-pointer transition-colors"
              style="background:{cell && selectedDay===cell ? '#EEF4FF' : cell && isToday(cell) ? '#004E98' : 'transparent'};"
              on:click={() => { if (cell) selectedDay = cell; }}
            >
              {#if cell}
                <span class="text-[13px] font-semibold leading-none"
                  style="color:{isToday(cell)?'#FFFFFF':selectedDay===cell?'#004E98':'#14213D'};"
                >{cell}</span>
                {#if dayEvs.length > 0}
                  <div class="flex gap-0.5 mt-1 justify-center">
                    {#each dayEvs.slice(0, 3) as ev}
                      <div class="w-1.5 h-1.5 rounded-full" style="background:{isToday(cell)?'rgba(255,255,255,0.8)':eventColor(ev)};"></div>
                    {/each}
                  </div>
                {/if}
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <!-- Sidebar -->
      <div class="bg-white rounded-16 p-5 border border-slate-200 flex flex-col">
        <div class="mb-4">
          <h3 class="text-[14px] font-black text-slate-900 capitalize">
            {selectedDay ? formatSidebarDate(selectedDay) : 'Selecione um dia'}
          </h3>
          {#if selectedDay}
            <p class="text-[11px] text-slate-400 font-semibold mt-0.5">
              {sidebarEvents.length} {sidebarEvents.length === 1 ? 'evento' : 'eventos'}
            </p>
          {/if}
        </div>

        <div class="flex flex-col gap-2 flex-1 overflow-y-auto min-h-0">
          {#if !selectedDay}
            <p class="text-[13px] text-slate-400 text-center pt-6">Clique em um dia para ver os eventos</p>
          {:else if sidebarEvents.length === 0}
            <p class="text-[13px] text-slate-400 text-center pt-6">Nenhum evento neste dia</p>
          {:else}
            {#each sidebarEvents as ev}
              <div class="flex gap-3 items-start p-3 rounded-12 border border-slate-100 hover:bg-slate-50 transition-colors group">
                <div class="w-1 self-stretch rounded-full flex-shrink-0" style="background:{eventColor(ev)};"></div>
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] font-black uppercase tracking-wide mb-0.5" style="color:{eventColor(ev)};">
                    {TYPE_LABEL[ev.type] || ev.type}{#if ev.subject_name} · {ev.subject_name}{/if}
                  </p>
                  <p class="text-[13px] font-bold text-slate-800 leading-tight truncate">{ev.title}</p>
                  {#if ev.description}<p class="text-[11px] text-slate-500 mt-0.5 truncate">{ev.description}</p>{/if}
                  {#if !ev.is_personal && ev.created_by_name}
                    <p class="text-[10px] text-slate-400 mt-0.5">Prof. {ev.created_by_name}</p>
                  {/if}
                </div>
                {#if ev.can_delete}
                  <button
                    class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all text-[18px] leading-none flex-shrink-0"
                    on:click={() => deleteEvent(ev)}
                  >×</button>
                {/if}
              </div>
            {/each}
          {/if}
        </div>

        <button
          class="mt-4 w-full py-2.5 rounded-12 text-[13px] font-bold text-white hover:opacity-90 transition-opacity"
          style="background:#004E98;"
          on:click={openCreate}
        >+ Novo evento pessoal</button>
      </div>
    </div>

  {:else if activeView === 'Dia'}
    <!-- ═══════════ DIA ═══════════ -->
    <div class="bg-white rounded-16 p-6 border border-slate-200">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-[20px] font-black text-slate-900 capitalize">
            {formatSidebarDate(selectedDay ?? today.getDate())}
          </h2>
          <p class="text-[13px] text-slate-500 mt-0.5">
            {eventsForDay(selectedDay ?? today.getDate()).length} {eventsForDay(selectedDay ?? today.getDate()).length === 1 ? 'evento' : 'eventos'}
          </p>
        </div>
        <div class="flex gap-1">
          <button class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold" on:click={prevMonth}>‹</button>
          <button class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold" on:click={nextMonth}>›</button>
        </div>
      </div>

      {#each [eventsForDay(selectedDay ?? today.getDate())] as dayEvs}
        {#if dayEvs.length === 0}
          <div class="flex flex-col items-center py-16 gap-3 text-slate-400">
            <p class="text-[14px] font-semibold">Nenhum evento neste dia</p>
            <button class="px-4 py-2 rounded-10 text-[13px] font-bold text-white" style="background:#004E98;" on:click={openCreate}>+ Criar evento</button>
          </div>
        {:else}
          <div class="flex flex-col gap-3">
            {#each dayEvs as ev}
              <div class="flex gap-4 items-start p-4 rounded-14 border border-slate-200 hover:shadow-sm transition-all group">
                <div class="w-10 h-10 rounded-12 flex items-center justify-center flex-shrink-0" style="background:{eventColor(ev)}20;">
                  <div class="w-2.5 h-2.5 rounded-full" style="background:{eventColor(ev)};"></div>
                </div>
                <div class="flex-1">
                  <p class="text-[11px] font-black uppercase tracking-wide mb-0.5" style="color:{eventColor(ev)};">
                    {TYPE_LABEL[ev.type] || ev.type}{#if ev.subject_name} · {ev.subject_name}{/if}
                  </p>
                  <p class="text-[15px] font-bold text-slate-900">{ev.title}</p>
                  {#if ev.description}<p class="text-[13px] text-slate-500 mt-1">{ev.description}</p>{/if}
                  {#if !ev.is_personal && ev.created_by_name}
                    <p class="text-[11px] text-slate-400 mt-1">Prof. {ev.created_by_name}</p>
                  {/if}
                </div>
                {#if ev.can_delete}
                  <button class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all text-[20px] leading-none" on:click={() => deleteEvent(ev)}>×</button>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      {/each}
    </div>

  {:else}
    <!-- ═══════════ ANO ═══════════ -->
    <div class="bg-white rounded-16 p-6 border border-slate-200">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-[17px] font-black text-slate-900 tracking-tight">Visão do Ano — {viewYear}</h2>
        <div class="flex gap-1">
          <button class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold" on:click={() => viewYear--}>‹</button>
          <button class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold" on:click={() => viewYear++}>›</button>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-3">
        {#each MONTH_NAMES as month, i}
          {@const mEvs = eventsForMonth(i + 1)}
          {@const isCurrent = i + 1 === today.getMonth() + 1 && viewYear === today.getFullYear()}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="rounded-14 p-4 cursor-pointer hover:shadow-md transition-all"
            style="background:{isCurrent?'#EEF4FF':'#F8FAFC'};border:1.5px solid {isCurrent?'#004E98':'#E2E8F0'};"
            on:click={() => { viewMonth = i+1; activeView = 'Mês'; selectedDay = null; }}
          >
            <div class="flex items-center justify-between mb-3">
              <span class="text-[15px] font-black tracking-tight" style="color:{isCurrent?'#004E98':'#14213D'};">{month}</span>
              {#if mEvs.length > 0}
                <span class="text-[11px] font-black text-white px-2 py-0.5 rounded-full" style="background:{heatColor(mEvs.length)};">{mEvs.length}</span>
              {:else}
                <span class="text-[11px] text-slate-300 font-semibold">—</span>
              {/if}
            </div>
            <div class="flex flex-wrap gap-0.5">
              {#each {length: 28} as _, d}
                {@const hasEv = mEvs.some(e => { const day = new Date(e.date).getUTCDate(); return Math.abs(day - (d + 1)) < 2; })}
                <div class="w-2 h-2 rounded-sm" style="background:{hasEv?heatColor(mEvs.length):'#E2E8F0'};opacity:{hasEv?0.8:0.4};"></div>
              {/each}
            </div>
            {#if isCurrent}<p class="text-[10px] font-bold text-blue-600 mt-2 uppercase tracking-wide">Mês atual</p>{/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</AppLayout>

<!-- ═══════════ CREATE PERSONAL EVENT MODAL ═══════════ -->
<Modal open={showCreate} title="Novo evento pessoal" onClose={() => showCreate = false} width="440px">
  <div class="px-6 py-5 flex flex-col gap-4">

    <div class="flex flex-col gap-1">
      <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Título *</label>
      <input
        type="text"
        bind:value={createForm.title}
        placeholder="Nome do evento..."
        class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Data *</label>
      <input type="date" bind:value={createForm.date}
        class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500"
      />
    </div>

    <div class="flex flex-col gap-1">
      <label class="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Descrição</label>
      <textarea
        bind:value={createForm.description}
        placeholder="Detalhes opcionais..."
        rows="2"
        class="w-full px-3 py-2.5 rounded-10 text-[14px] border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
      />
    </div>

    {#if createError}
      <p class="text-[13px] text-red-500 font-semibold">{createError}</p>
    {/if}

    <div class="flex gap-2 pt-1">
      <button
        class="flex-1 py-2.5 rounded-10 text-[13px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        on:click={() => showCreate = false}
      >Cancelar</button>
      <button
        class="flex-1 py-2.5 rounded-10 text-[13px] font-bold text-white transition-opacity"
        style="background:#004E98; opacity:{creating?0.6:1};"
        disabled={creating}
        on:click={submitCreate}
      >{creating ? 'Salvando...' : 'Criar evento'}</button>
    </div>
  </div>
</Modal>
