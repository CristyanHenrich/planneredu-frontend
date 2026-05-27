<script>
  import AuthLayout from '../../layouts/AuthLayout.svelte';
  import Icon from '../../components/ui/Icon.svelte';
  import { authStore } from '../../stores/auth.js';

  export let onNavigate = (id) => {};

  let email = "";
  let password = "";
  let remember = false;
  let showPass = false;
  let loading = false;
  let errors = {};
  let serverError = "";

  async function submit() {
    errors = {};
    serverError = "";
    if (!email.trim()) { errors.email = 'Informe seu e-mail'; return; }
    if (!password) { errors.password = 'Informe sua senha'; return; }
    loading = true;
    try {
      const data = await authStore.login(email.trim(), password, remember);
      if (data?.mfa_required) {
        onNavigate('otp');
      }
    } catch (err) {
      const apiErrors = err?.errors;
      if (apiErrors) {
        const e = {};
        for (const { field, message } of apiErrors) {
          if (field === 'server') serverError = message;
          else e[field] = message;
        }
        errors = e;
      } else {
        serverError = 'Ocorreu um erro inesperado. Tente novamente.';
      }
    } finally {
      loading = false;
    }
  }
</script>

<AuthLayout 
  quote="O sucesso é a soma de pequenos esforços repetidos dia após dia."
  author="Robert Collier"
>
  <div class="mb-10">
    <div class="lg:hidden mb-8">
       <img src="/assets/logo-horizontal.svg" alt="PlannerEdu" class="h-8" />
    </div>
    <h1 class="text-[32px] font-black text-slate-900 tracking-tighter mb-2">Bem-vindo de volta!</h1>
    <p class="text-[15px] text-slate-500 font-medium">Acesse sua conta para continuar sua jornada de estudos.</p>
  </div>

  <div class="space-y-5">
    <div>
      <label class="text-[13px] font-bold text-slate-700 block mb-2" for="email">E-mail corporativo ou educacional</label>
      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Icon name="mail" size={18} />
        </div>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="exemplo@escola.edu.br"
          class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-16 text-[15px] focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all placeholder:text-slate-400 {errors.email ? 'border-red-400' : 'border-slate-200'}"
        />
      </div>
      {#if errors.email}<p class="mt-1.5 text-[12px] font-medium text-red-600">{errors.email}</p>{/if}
    </div>

    <div>
      <div class="flex justify-between items-center mb-2">
        <label class="text-[13px] font-bold text-slate-700" for="password">Sua senha</label>
        <button type="button" class="text-[13px] font-bold text-blue-600 hover:underline">Esqueceu a senha?</button>
      </div>
      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Icon name="lock" size={18} />
        </div>
        {#if showPass}
          <input
            id="password"
            type="text"
            bind:value={password}
            placeholder="Digite sua senha"
            class="w-full pl-11 pr-12 py-3.5 bg-slate-50 border rounded-16 text-[15px] focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all placeholder:text-slate-400 {errors.password ? 'border-red-400' : 'border-slate-200'}"
          />
        {:else}
          <input
            id="password"
            type="password"
            bind:value={password}
            placeholder="Digite sua senha"
            class="w-full pl-11 pr-12 py-3.5 bg-slate-50 border rounded-16 text-[15px] focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all placeholder:text-slate-400 {errors.password ? 'border-red-400' : 'border-slate-200'}"
          />
        {/if}
        <button
          type="button"
          class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          on:click={() => showPass = !showPass}
        >
           <Icon name={showPass ? 'eye-off' : 'eye'} size={20} />
        </button>
      </div>
      {#if errors.password}<p class="mt-1.5 text-[12px] font-medium text-red-600">{errors.password}</p>{/if}
    </div>

    {#if serverError}
      <div class="p-3.5 rounded-14 bg-red-50 border border-red-200 text-[13px] font-medium text-red-700">
        {serverError}
      </div>
    {/if}

    <div class="flex items-center gap-2 py-1">
      <input type="checkbox" id="remember" bind:checked={remember} class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
      <label for="remember" class="text-[14px] font-medium text-slate-500 cursor-pointer select-none">Lembrar de mim por 30 dias</label>
    </div>

    <button
      type="button"
      disabled={loading}
      class="w-full py-4 text-white rounded-18 text-[16px] font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
      style="background:#004E98;"
      on:click={submit}
    >
      {#if loading}
        <span class="flex items-center justify-center gap-2">
          <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
          Entrando...
        </span>
      {:else}
        Entrar no Portal
      {/if}
    </button>

    <div class="relative py-4">
      <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-100"></div></div>
      <div class="relative flex justify-center text-[12px] uppercase font-black text-slate-400 tracking-widest px-4 bg-white w-fit mx-auto">Ou entrar com</div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <button class="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-16 hover:bg-slate-50 transition-all font-bold text-slate-700 text-[14px]">
        <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5" />
        Google
      </button>
      <button class="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-16 hover:bg-slate-50 transition-all font-bold text-slate-700 text-[14px]">
        <Icon name="apple" size={20} color="#000" />
        Apple
      </button>
    </div>

    <p class="text-center text-[14px] text-slate-500 mt-8">
      Ainda não tem uma conta? 
      <button class="font-bold text-blue-600 hover:underline" on:click={() => onNavigate('signup')}>Cadastre-se gratuitamente</button>
    </p>
  </div>
</AuthLayout>
