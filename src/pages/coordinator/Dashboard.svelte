<script>
  import { onMount } from 'svelte';
  import AppLayout from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import { api } from '../../lib/api.js';
  import { currentUser } from '../../stores/auth.js';

  export let onNavigate = (id) => {};

  let pendingCount = 0;
  let totalRooms = 0;
  let loading = true;

  onMount(async () => {
    try {
      const [enrollments, rooms] = await Promise.all([
        api.enrollments.list({ status: 'pending' }).catch(() => []),
        api.enrollments.list().catch(() => []),
      ]);
      pendingCount = Array.isArray(enrollments) ? enrollments.length : 0;
      totalRooms = 0;
    } catch (_) {}
    loading = false;
  });

  const cards = [
    { label: 'Matrículas Pendentes', icon: 'clock', routeId: 'c-enrollments', color: '#FF6700', bg: 'rgba(255,103,0,0.08)' },
    { label: 'Gerenciar Turmas',     icon: 'school',routeId: 'c-classrooms',  color: '#004E98', bg: 'rgba(0,78,152,0.08)' },
    { label: 'Professores',          icon: 'user',  routeId: 'c-teachers',    color: '#4CD964', bg: 'rgba(76,217,100,0.08)' },
  ];
</script>

<AppLayout title="Painel do Coordenador" active="c-dashboard" {onNavigate}>
  <PageHeader
    title="Olá, {$currentUser?.name?.split(' ')[0] ?? 'Coordenador'}!"
    subtitle="Gerencie sua instituição abaixo."
  />

  {#if loading}
    <div class="flex items-center justify-center h-40">
      <span class="w-7 h-7 border-2 border-slate-200 border-t-pe-primary rounded-full animate-spin"></span>
    </div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
      {#each cards as card}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow"
          on:click={() => onNavigate(card.routeId)}
        >
          <div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background:{card.bg};">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={card.color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              {#if card.icon === 'clock'}
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              {:else if card.icon === 'school'}
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              {:else}
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              {/if}
            </svg>
          </div>
          <p class="text-[15px] font-bold text-slate-800">{card.label}</p>
        </div>
      {/each}
    </div>

    {#if pendingCount > 0}
      <div class="bg-white rounded-2xl border border-orange-200 p-5 flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style="background:rgba(255,103,0,0.1);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6700" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-[14px] font-bold text-slate-800">
            {pendingCount} matrícula{pendingCount > 1 ? 's' : ''} aguardando aprovação
          </p>
          <p class="text-[12px] text-slate-500 mt-0.5">Clique em "Matrículas Pendentes" para revisar.</p>
        </div>
      </div>
    {/if}
  {/if}
</AppLayout>
