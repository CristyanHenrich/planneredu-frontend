<script>
  import { Bell, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-svelte';
  import AppLayout from '../../layouts/AppLayout.svelte';
  import { notificationStore } from '../../stores/notifications.js';
  import { onMount, onDestroy } from 'svelte';

  export let onNavigate = () => {};

  let hasError = false;
  let errorRetryCount = 0;

  onMount(() => {
    if ($notificationStore.items.length === 0) {
      notificationStore.fetch().catch(() => {
        hasError = true;
      });
    }

    return () => {
      notificationStore.stopPolling();
    };
  });

  function groupByTime(notifications) {
    const now = new Date();
    const groups = [];
    let currentGroup = null;

    for (const n of notifications) {
      const date = new Date(n.created_at || n.CreatedAt);
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      let label;
      if (diffDays === 0) {
        label = 'Hoje';
      } else if (diffDays === 1) {
        label = 'Ontem';
      } else {
        label = `${diffDays} dias atrás`;
      }

      const lastGroupLabel = currentGroup?.label;
      if (lastGroupLabel !== label) {
        currentGroup = { label, items: [n] };
        groups.push(currentGroup);
      } else {
        currentGroup.items.push(n);
      }
    }

    return groups;
  }

  $: filteredGroups = (() => {
    const allNotifications = $notificationStore.items || [];
    return groupByTime(allNotifications);
  })();

  $: filteredUnreadCount = (() => {
    const allNotifications = $notificationStore.items || [];
    return allNotifications.filter(n => !n.read).length;
  })();

  async function handleMarkAllRead() {
    await notificationStore.markAllAsRead();
  }

  async function handleNotificationClick(notification) {
    if (!notification.read) {
      await notificationStore.markAsRead(notification.id);
    }
    
    if (notification.link) {
      const url = new URL(notification.link, window.location.origin);
      const path = url.pathname;
      
      const routeMap = {
        '/s/kanban': 'kanban',
        '/s/calendar': 'calendar',
        '/s/ai': 'ai',
        '/s/profile': 'profile',
        '/s/settings': 'settings',
      };
      
      const routeId = routeMap[path] || path.replace('/s/', '');
      if (routeId) {
        window.location.hash = `#/s/${routeId}`;
      } else {
        window.location.href = notification.link;
      }
    }
  }

  async function handleRetry() {
    hasError = false;
    errorRetryCount++;
    await notificationStore.fetch();
  }

  function formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'agora';
    if (diffMin < 60) return `${diffMin}min atrás`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h atrás`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d atrás`;
  }
</script>

<AppLayout title="Notificações" breadcrumbs={[{label:'Aluno'},{label:'Notificações'}]} active="notifications" {onNavigate}>
<div class="px-6 py-4">
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-3">
      <h1 class="text-[22px] font-extrabold text-slate-900 tracking-tight">Notificações</h1>
      {#if filteredUnreadCount > 0}
        <span class="text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-red-500">{filteredUnreadCount}</span>
      {/if}
    </div>
    {#if filteredUnreadCount > 0}
      <button
        class="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider"
        on:click={handleMarkAllRead}
      >Marcar todas lidas</button>
    {/if}
  </div>

  <div>
    {#if $notificationStore.loading && filteredGroups.length === 0}
      <div class="space-y-3">
        {#each [1,2,3] as i (i)}
          <div class="rounded-xl p-4 flex gap-3 animate-pulse bg-slate-50">
            <div class="w-10 h-10 rounded-lg bg-slate-200 flex-shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-slate-200 rounded w-3/4" />
              <div class="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        {/each}
      </div>

    {:else if $notificationStore.error || hasError}
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle size={32} color="#EF4444" />
        </div>
        <p class="text-[15px] font-bold text-slate-700">Ops! Algo deu errado</p>
        <p class="text-[13px] text-slate-400 mt-1 max-w-xs">
          {$notificationStore.error || 'Não foi possível carregar suas notificações'}
        </p>
        <button
          class="mt-6 px-6 py-2.5 bg-blue-600 text-white text-[13px] font-bold rounded-xl hover:bg-blue-700 transition-all"
          on:click={handleRetry}
        >
          Tentar novamente
        </button>
      </div>

    {:else if filteredGroups.length === 0}
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
          <Bell size={32} color="#CBD5E1" />
        </div>
        <p class="text-[15px] font-bold text-slate-700">Nenhuma notificação</p>
        <p class="text-[13px] text-slate-400 mt-1">
          Você está em dia! Nenhuma notificação por enquanto.
        </p>
      </div>

    {:else}
      {#each filteredGroups as group}
        <div class="flex items-center gap-2 mb-3 mt-5 first:mt-0">
          {#if group.label === 'Hoje'}
            <Calendar size={14} color="#004E98" />
          {:else}
            <Clock size={14} color="#94A3B8" />
          {/if}
          <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{group.label}</span>
          <div class="flex-1 h-px bg-slate-100" />
        </div>

        {#each group.items as n}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="rounded-xl p-4 mb-3 flex gap-3 items-start relative cursor-pointer transition-all hover:shadow-md bg-white border border-slate-200"
            on:click={() => handleNotificationClick(n)}
          >
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              class:bg-blue-50={!n.read}
              class:bg-slate-50={n.read}
            >
              <Bell size={18} color={n.read ? '#94A3B8' : '#004E98'} />
            </div>
            
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-semibold text-slate-800 leading-snug" class:font-bold={!n.read}>{n.title}</p>
              
              {#if !n.read && n.content}
                <p class="text-[12px] text-slate-500 leading-snug mt-1 line-clamp-2">{n.content}</p>
              {/if}
              
              <p class="text-[11px] text-slate-400 mt-1.5">{formatTimeAgo(n.created_at || n.CreatedAt)}</p>
            </div>

            {#if !n.read}
              <div class="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
            {/if}
          </div>
        {/each}
      {/each}
    {/if}
  </div>
</div>
</AppLayout>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
