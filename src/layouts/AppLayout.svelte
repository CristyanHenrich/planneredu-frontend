<script>
  import Sidebar from '../components/layout/Sidebar.svelte';
  import Topbar  from '../components/layout/Topbar.svelte';

  export let title       = '';
  export let breadcrumbs = [];
  export let active      = '';
  export let onNavigate  = (id) => {};

  let sidebarCollapsed = false;
</script>

<div class="flex h-full overflow-hidden" style="background:#F8FAFC;">
  <Sidebar
    {active}
    collapsed={sidebarCollapsed}
    onSelect={(id) => onNavigate(id)}
  />

  <div class="flex-1 flex flex-col overflow-hidden min-w-0">
    <Topbar
      {title}
      {breadcrumbs}
      {onNavigate}
      onToggleSidebar={() => (sidebarCollapsed = !sidebarCollapsed)}
    />

    <main class="flex-1 overflow-auto p-4 md:p-6 scrollbar-none">
      <slot />
    </main>
  </div>
</div>
