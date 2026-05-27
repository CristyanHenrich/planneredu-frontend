<script>
  import { onMount } from 'svelte';
  import { findRoute, routeGroups } from './config/routes.js';
  import { authStore } from './stores/auth.js';
  import { navParams } from './stores/navParams.js';

  let currentId = 'login';
  let initialized = false;
  let PageComponent = null;
  let loadToken = 0;

  const AUTH_ROUTES = new Set(['welcome', 'login', 'signup', 'otp', 'study-mode', 'school', 'success']);
  const ROLE_HOME   = { student: 'home', teacher: 't-dashboard', coordinator: 'c-dashboard', admin: 'a-dashboard' };

  function findRouteByPath(path) {
    for (const g of routeGroups) {
      const item = (g.items ?? []).find(r => r.path === path);
      if (item) return item;
    }
    return null;
  }

  // Subscribe to auth changes and redirect if needed
  authStore.subscribe(s => {
    if (!s.initialized) return;
    initialized = true;
    const onAuth = AUTH_ROUTES.has(currentId);
    if (s.token && onAuth) {
      const nextId = ROLE_HOME[s.user?.role] || 'home';
      const r = findRoute(nextId);
      if (r) {
        currentId = nextId;
        window.history.replaceState({ id: nextId, params: {} }, '', r.path);
      }
    } else if (!s.token && !onAuth) {
      currentId = 'login';
      const r = findRoute('login');
      if (r) window.history.replaceState({ id: 'login', params: {} }, '', r.path);
    }
  });

  function handlePopState(event) {
    const state = event.state;
    if (state && state.id) {
      navParams.set(state.params || {});
      currentId = state.id;
    } else {
      const path = window.location.pathname;
      const matched = findRouteByPath(path);
      if (matched) {
        const params = {};
        const urlParams = new URLSearchParams(window.location.search);
        for (const [key, value] of urlParams.entries()) {
          params[key] = value;
        }
        navParams.set(params);
        currentId = matched.id;
      }
    }
  }

  onMount(() => {
    authStore.init();

    // Load initial route based on browser URL pathname
    const path = window.location.pathname;
    const matched = findRouteByPath(path);
    if (matched) {
      const params = {};
      const urlParams = new URLSearchParams(window.location.search);
      for (const [key, value] of urlParams.entries()) {
        params[key] = value;
      }
      navParams.set(params);
      currentId = matched.id;
    }

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  });

  function navigate(id, params = {}) {
    const r = findRoute(id);
    if (r) {
      navParams.set(params);
      currentId = id;
      const pathWithQuery = r.path + (Object.keys(params).length > 0 ? '?' + new URLSearchParams(params).toString() : '');
      if (window.location.pathname !== r.path || window.location.search !== (pathWithQuery.split('?')[1] || '')) {
        window.history.pushState({ id, params }, '', pathWithQuery);
      }
    }
  }

  $: route = findRoute(currentId) ?? findRoute('login');

  // Lazy load: each route change loads only its page component
  function loadRoute(r) {
    if (!r?.loader) { PageComponent = null; return; }
    const token = ++loadToken;
    PageComponent = null;
    r.loader().then(mod => {
      if (loadToken === token) PageComponent = mod.default;
    });
  }

  $: loadRoute(route);
</script>

<div class="h-screen overflow-hidden font-system">
  {#if !initialized}
    <div class="h-screen flex items-center justify-center bg-slate-950">
      <div class="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
    </div>
  {:else if PageComponent}
    <svelte:component this={PageComponent} onNavigate={navigate} {...$navParams} />
  {:else}
    <div class="h-screen flex items-center justify-center bg-slate-50">
      <div class="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin"></div>
    </div>
  {/if}
</div>
