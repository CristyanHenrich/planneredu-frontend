<script>
  import Icon from '../components/ui/Icon.svelte';
  export let image = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80";
  export let title = "PlannerEdu";
  export let quote = "O segredo do sucesso é a constância do propósito.";
  export let author = "Benjamin Disraeli";
</script>

<div class="flex min-h-screen w-full bg-white font-system">
  <!-- Left Side: Visual/Quote (Hidden on small screens, though this is for web view) -->
  <div class="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900">
    <img 
      src={image} 
      alt="Auth visual" 
      class="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
    
    <div class="relative z-10 w-full h-full flex flex-col p-12 justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-16 bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
          <img src="/assets/logo-icon.svg" alt="Logo" class="w-7 h-7" />
        </div>
        <span class="text-[20px] font-black text-white tracking-tighter">{title}</span>
      </div>

      <div class="max-w-md">
        <div class="w-10 h-px bg-blue-500 mb-6" />
        <p class="text-[28px] font-bold text-white tracking-tight leading-tight mb-4">
          “{quote}”
        </p>
        <p class="text-[15px] font-semibold text-slate-400">— {author}</p>
      </div>

      <div class="text-slate-500 text-[12px] font-medium">
        © 2026 PlannerEdu · Transformando a educação através da organização.
      </div>
    </div>
  </div>

  <!-- Right Side: Form Content -->
  <div class="w-full lg:w-1/2 flex flex-col items-center bg-white overflow-y-auto scrollbar-none">
    <div class="w-full max-w-[420px] py-12 px-6 lg:py-20 flex-1 flex flex-col justify-center">
      <slot />
    </div>
  </div>
</div>
