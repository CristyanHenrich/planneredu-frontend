<script>
  import { AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-svelte';
  import { toasts } from '../../stores/toast.js';
  import { fly } from 'svelte/transition';

  const typeConfig = {
    warning: { icon: AlertTriangle, color: '#FFB42E', border: '#FFB42E' },
    error:   { icon: XCircle,       color: '#FF2D5F', border: '#FF2D5F' },
    success: { icon: CheckCircle2,  color: '#4CD964', border: '#4CD964' },
    info:    { icon: Info,           color: '#004E98', border: '#004E98' },
  };
</script>

<div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-[380px]">
  {#each $toasts as toast (toast.id)}
    <div
      transition:fly={{ x: 20, duration: 300, opacity: 0 }}
      class="flex items-start gap-3 px-5 py-4 rounded-20 shadow-xl border border-slate-100 bg-white"
    >
      <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style="background:{typeConfig[toast.type].color}16;">
        <svelte:component this={typeConfig[toast.type].icon} size={18} color={typeConfig[toast.type].color} />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[13px] font-bold text-slate-900 leading-snug">{toast.message}</p>
      </div>
    </div>
  {/each}
</div>
