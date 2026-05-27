<script>
  import Icon from '../ui/Icon.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { currentUser, authStore } from '../../stores/auth.js';
  import { notificationStore, unreadCount, recentNotifications } from '../../stores/notifications.js';

  export let title = '';
  export let breadcrumbs = [];
  export let onToggleSidebar = () => {};
  export let onNavigate = (id) => {};

  let showNotifs = false;
  let showUserMenu = false;

  $: initials = $currentUser?.name
    ? $currentUser.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  onMount(() => {
    notificationStore.startPolling();
    
    return () => {
      notificationStore.stopPolling();
    };
  });

  async function handleLogout() {
    showUserMenu = false;
    await authStore.logout();
    onNavigate('login');
  }

  async function handleNotificationClick(notification) {
    if (!notification.read) {
      await notificationStore.markAsRead(notification.id);
    }
    
    // Navigate to the notification's link or route
    if (notification.link) {
      showNotifs = false;
      
      // Parse the link to determine navigation target
      const url = new URL(notification.link, window.location.origin);
      const path = url.pathname;
      
      // Map paths to route IDs
      const routeMap = {
        '/s/kanban': 'kanban',
        '/s/calendar': 'calendar',
        '/s/ai': 'ai',
        '/s/profile': 'profile',
        '/s/settings': 'settings',
      };
      
      const routeId = routeMap[path] || path.replace('/s/', '');
      if (routeId) {
        onNavigate(routeId);
      } else {
        // Fallback: try to navigate directly
        window.location.href = notification.link;
      }
    } else {
      showNotifs = false;
      onNavigate('notifications');
    }
  }

  async function handleMarkAllRead() {
    await notificationStore.markAllAsRead();
  }

  $: displayNotifications = $recentNotifications || [];

  function formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'agora';
    if (diffMin < 60) return `${diffMin}min`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d`;
  }
</script>

<header class="flex items-center gap-4 px-5 flex-shrink-0" style="height: 64px; background: #FFFFFF; border-bottom: 1px solid #E4E4E7;">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <button class="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:bg-slate-100" on:click={onToggleSidebar}>
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><rect width="16" height="2" rx="1" fill="#64748B"/><rect y="5" width="11" height="2" rx="1" fill="#64748B"/><rect y="10" width="16" height="2" rx="1" fill="#64748B"/></svg>
  </button>

  <div class="flex items-center gap-1.5 flex-1 min-w-0">
    {#if breadcrumbs.length > 0}
      {#each breadcrumbs as crumb, i}
        <span class="text-[13px] text-slate-500 font-medium truncate">{crumb.label}</span>
        <span class="text-[13px] text-slate-300">/</span>
      {/each}
      <span class="text-[13px] font-bold text-slate-900 truncate">{title}</span>
    {:else if title}
      <span class="text-[16px] font-black text-slate-900 tracking-tight">{title}</span>
    {/if}
  </div>

  <div class="flex items-center gap-3 relative">
    <!-- Notificações -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div 
      class="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors relative" 
      on:click={() => { showNotifs = !showNotifs; showUserMenu = false; }}
    >
      <Icon name="bell" size={20} color="#64748B" />
      {#if $unreadCount > 0}
        <div class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
      {/if}
    </div>

    {#if showNotifs}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="fixed inset-0 z-40" on:click={() => showNotifs = false} />

      <div class="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animation-fade-in">
        <!-- Header -->
        <div class="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <span class="text-[14px] font-bold text-slate-800">Notificações</span>
          {#if displayNotifications.length > 0}
            <button 
              class="text-[10px] text-blue-600 font-bold uppercase cursor-pointer hover:text-blue-700 transition-colors"
              on:click={handleMarkAllRead}
            >Marcar lidas</button>
          {/if}
        </div>

        <!-- Content -->
        <div class="max-h-80 overflow-y-auto">
          {#if $notificationStore.loading && displayNotifications.length === 0}
            <div class="p-6 text-center">
              <div class="inline-block w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
              <p class="text-[12px] text-slate-400 mt-2">Carregando...</p>
            </div>
          {:else if $notificationStore.error}
            <div class="p-6 text-center">
              <Icon name="alert" size={24} color="#EF4444" />
              <p class="text-[13px] text-slate-600 mt-2 font-medium">Erro ao carregar</p>
              <button 
                class="mt-3 px-4 py-2 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-colors"
                on:click={() => notificationStore.fetch()}
              >Tentar novamente</button>
            </div>
          {:else if displayNotifications.length === 0}
            <div class="p-8 text-center">
              <Icon name="bell" size={32} color="#CBD5E1" />
              <p class="text-[13px] text-slate-400 mt-3 font-medium">Nenhuma notificação</p>
            </div>
          {:else}
            {#each displayNotifications as n}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div 
                class="p-4 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                on:click={() => handleNotificationClick(n)}
              >
                <div class="flex gap-3">
                  <div class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 {n.read ? 'bg-slate-200' : 'bg-blue-600'}" />
                  <div class="flex-1 min-w-0">
                    <p class="text-[13px] font-semibold text-slate-700 leading-tight mb-0.5 truncate">{n.title}</p>
                    {#if !n.read}
                      <p class="text-[12px] text-slate-500 line-clamp-2 leading-snug">{n.content || ''}</p>
                    {/if}
                    <p class="text-[11px] text-slate-400 mt-1">{formatTimeAgo(n.created_at || n.CreatedAt)}</p>
                  </div>
                </div>
              </div>
            {/each}
          {/if}
        </div>

        <!-- Footer -->
        <div class="p-3 bg-white border-t border-slate-100">
          <button
            class="w-full py-2.5 rounded-xl bg-slate-900 text-white text-[12px] font-bold hover:bg-slate-800 transition-colors"
            on:click={() => {
              showNotifs = false;
              onNavigate('notifications');
            }}
          >
            Ver todas as notificações
          </button>
        </div>
      </div>
    {/if}

    <!-- Avatar + dropdown -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-black cursor-pointer shadow-md select-none"
      style="background:#004E98;"
      on:click={() => { showUserMenu = !showUserMenu; showNotifs = false; }}
    >
      {initials}
    </div>

    {#if showUserMenu}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="fixed inset-0 z-40" on:click={() => showUserMenu = false} />

      <div class="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animation-fade-in">
        <div class="p-4 border-b border-slate-100 bg-slate-50/50">
          <p class="text-[13px] font-bold text-slate-800 truncate">{$currentUser?.name}</p>
          <p class="text-[11px] text-slate-400 truncate mt-0.5">{$currentUser?.email}</p>
        </div>
        <div class="p-1.5">
          <button
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
            on:click={handleLogout}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sair
          </button>
        </div>
      </div>
    {/if}
  </div>
</header>

<style>
  .animation-fade-in {
    animation: fadeIn 0.2s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
