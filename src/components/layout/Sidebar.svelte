<script>
  import Icon from '../ui/Icon.svelte';
  import { currentRole, currentUser } from '../../stores/auth.js';
  import { getRoutesForRole } from '../../config/routes.js';

  export let active = '';
  export let onSelect = (id) => {};
  export let collapsed = false;

  $: initials = $currentUser?.name
    ? $currentUser.name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  $: groups = getRoutesForRole($currentRole)
    .filter(g => g.id !== 'global')
    .map(g => ({ ...g, items: (g.items ?? []).filter(i => !i.sidebarHidden) }));

  let openSections = {};
  $: {
    groups.forEach(g => { if (!(g.id in openSections)) openSections[g.id] = true; });
  }
</script>

<aside
  class="flex flex-col h-full transition-all duration-300 flex-shrink-0"
  style="
    width: {collapsed ? '72px' : '240px'};
    background: #0F172A;
    border-right: 1px solid rgba(255,255,255,0.06);
  "
>
  <div class="flex items-center gap-3 px-5 flex-shrink-0" style="height:72px; border-bottom:1px solid rgba(255,255,255,0.04);">
    <!-- PlannerEdu logo -->
    {#if collapsed}
      <img src="/assets/logo-icon.svg" alt="PlannerEdu" class="h-8 w-8 flex-shrink-0 mx-auto" />
    {:else}
      <img src="/assets/logo-icon.svg" alt="PlannerEdu" class="h-9 w-9 flex-shrink-0" />
      <div class="min-w-0">
        <div class="flex items-baseline gap-0 text-[18px] font-black tracking-tighter leading-none">
          <span style="color:#60A5FA;">Planner</span><span style="color:#FB923C;">Edu</span>
        </div>
        <p class="text-[10px] font-bold uppercase tracking-[0.15em] mt-0.5" style="color:#334155;">Portal Aluno</p>
      </div>
    {/if}
  </div>

  <nav class="flex-1 overflow-y-auto py-4 px-3 scrollbar-none space-y-6">
    {#each groups as group}
      {#if group.items?.length > 0}
        <div class="space-y-1">
          {#if !collapsed}
            <div class="flex items-center justify-between px-3 mb-2">
              <span class="text-[10px] font-black uppercase tracking-[0.2em]" style="color:#334155;">{group.label}</span>
            </div>
          {/if}

          <div class="space-y-0.5">
            {#each group.items as item}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative"
                style="
                  background:{active === item.id ? 'rgba(59,130,246,0.08)' : 'transparent'};
                "
                on:click={() => onSelect(item.id)}
                title={collapsed ? item.label : ''}
              >
                {#if active === item.id}
                  <div class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-500" />
                {/if}

                <div
                  class="flex items-center justify-center flex-shrink-0 transition-transform duration-200 {active === item.id ? 'scale-110' : 'group-hover:scale-105'}"
                  style="color:{active === item.id ? '#60A5FA' : '#475569'};"
                >
                  <Icon name={item.icon || 'book'} size={18} color={active === item.id ? '#60A5FA' : '#475569'} />
                </div>

                {#if !collapsed}
                  <span
                    class="text-[14px] font-semibold truncate flex-1 transition-colors"
                    style="color:{active === item.id ? '#E2E8F0' : '#64748B'};"
                  >{item.label}</span>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  </nav>

  <div class="p-4 flex-shrink-0" style="border-top:1px solid rgba(255,255,255,0.04);">
    <div class="flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer hover:bg-white/5">
      <div
        class="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-black flex-shrink-0 shadow-lg"
        style="background:linear-gradient(135deg,#004E98,#3B82F6);"
      >{initials}</div>
      {#if !collapsed}
        <div class="min-w-0 flex-1">
          <p class="text-[13px] font-bold text-slate-200 truncate">{$currentUser?.name || 'Usuário'}</p>
          <p class="text-[11px] text-slate-500 truncate">{$currentUser?.email || ''}</p>
        </div>
      {/if}
    </div>
  </div>
</aside>
