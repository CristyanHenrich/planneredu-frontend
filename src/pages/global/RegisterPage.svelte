<script>
  import AuthLayout from '../../layouts/AuthLayout.svelte';
  import Icon from '../../components/ui/Icon.svelte';
  import { authStore } from '../../stores/auth.js';

  export let onNavigate = (id) => {};

  let name = "";
  let email = "";
  let phone = "";
  let birthday = "";
  let password = "";
  let confirmPassword = "";
  let showPass = false;
  let showConfirm = false;
  let loading = false;
  let errors = {};
  let serverError = "";

  $: strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password) && /\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  })();

  const strengthColors = ['#E4E4E7', '#FF2D5F', '#FF6700', '#FFB42E', '#4CD964'];
  const strengthLabels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];

  function validate() {
    const e = {};
    if (!name.trim() || name.trim().length < 3) e.name = 'Nome deve ter ao menos 3 caracteres';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = 'E-mail inválido';
    if (!password || password.length < 8) e.password = 'Senha deve ter ao menos 8 caracteres';
    if (password !== confirmPassword) e.confirmPassword = 'As senhas não coincidem';
    errors = e;
    return Object.keys(e).length === 0;
  }

  async function submit() {
    serverError = "";
    if (!validate()) return;
    loading = true;
    try {
      await authStore.register(
        name.trim(),
        email.trim(),
        phone.trim() || null,
        password,
        confirmPassword,
        birthday || null
      );
      onNavigate('otp');
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
  quote="A educação é a arma mais poderosa que você pode usar para mudar o mundo."
  author="Nelson Mandela"
  image="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
>
  <div class="mb-8">
    <div class="lg:hidden mb-8">
       <img src="/assets/logo-horizontal.svg" alt="PlannerEdu" class="h-8" />
    </div>
    <h1 class="text-[32px] font-black text-slate-900 tracking-tighter mb-2">Comece agora!</h1>
    <p class="text-[15px] text-slate-500 font-medium">Crie sua conta em poucos segundos e organize seus estudos.</p>
  </div>

  {#if serverError}
    <div class="mb-4 p-3.5 rounded-14 bg-red-50 border border-red-200 text-[13px] font-medium text-red-700">
      {serverError}
    </div>
  {/if}

  <div class="space-y-4">
    <!-- Nome -->
    <div>
      <label class="text-[13px] font-bold text-slate-700 block mb-2" for="name">Nome completo</label>
      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Icon name="user" size={18} />
        </div>
        <input
          id="name"
          type="text"
          bind:value={name}
          placeholder="Como devemos te chamar?"
          class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-16 text-[15px] focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all placeholder:text-slate-400 {errors.name ? 'border-red-400' : 'border-slate-200'}"
        />
      </div>
      {#if errors.name}<p class="mt-1.5 text-[12px] font-medium text-red-600">{errors.name}</p>{/if}
    </div>

    <!-- E-mail -->
    <div>
      <label class="text-[13px] font-bold text-slate-700 block mb-2" for="email">E-mail</label>
      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Icon name="mail" size={18} />
        </div>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="exemplo@email.com"
          class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-16 text-[15px] focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all placeholder:text-slate-400 {errors.email ? 'border-red-400' : 'border-slate-200'}"
        />
      </div>
      {#if errors.email}<p class="mt-1.5 text-[12px] font-medium text-red-600">{errors.email}</p>{/if}
    </div>

    <!-- Telefone -->
    <div>
      <label class="text-[13px] font-bold text-slate-700 block mb-2" for="phone">
        Telefone <span class="text-slate-400 font-medium">(opcional)</span>
      </label>
      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Icon name="phone" size={18} />
        </div>
        <input
          id="phone"
          type="tel"
          bind:value={phone}
          placeholder="+55 (11) 99999-9999"
          class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-16 text-[15px] focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all placeholder:text-slate-400"
        />
      </div>
    </div>

    <!-- Data de Nascimento -->
    <div>
      <label class="text-[13px] font-bold text-slate-700 block mb-2" for="birthday">
        Data de nascimento <span class="text-slate-400 font-medium">(opcional)</span>
      </label>
      <input
        id="birthday"
        type="date"
        bind:value={birthday}
        max={new Date().toISOString().slice(0, 10)}
        class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-16 text-[15px] focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all text-slate-700"
      />
    </div>

    <!-- Senha -->
    <div>
      <label class="text-[13px] font-bold text-slate-700 block mb-2" for="password">Crie uma senha</label>
      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Icon name="lock" size={18} />
        </div>
        {#if showPass}
          <input
            id="password"
            type="text"
            bind:value={password}
            placeholder="Mínimo 8 caracteres"
            class="w-full pl-11 pr-12 py-3.5 bg-slate-50 border rounded-16 text-[15px] focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all placeholder:text-slate-400 {errors.password ? 'border-red-400' : 'border-slate-200'}"
          />
        {:else}
          <input
            id="password"
            type="password"
            bind:value={password}
            placeholder="Mínimo 8 caracteres"
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
      <!-- Força da senha -->
      <div class="mt-2.5 flex gap-1">
        {#each [1,2,3,4] as bar}
          <div
            class="h-1 flex-1 rounded-full transition-all duration-300"
            style="background:{bar <= strength ? strengthColors[strength] : '#E4E4E7'}"
          ></div>
        {/each}
      </div>
      {#if strength > 0}
        <p class="mt-1 text-[12px] font-semibold" style="color:{strengthColors[strength]}">
          {strengthLabels[strength]}
        </p>
      {/if}
      {#if errors.password}<p class="mt-1 text-[12px] font-medium text-red-600">{errors.password}</p>{/if}
    </div>

    <!-- Confirmar Senha -->
    <div>
      <label class="text-[13px] font-bold text-slate-700 block mb-2" for="confirmPassword">Confirme sua senha</label>
      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Icon name="lock" size={18} />
        </div>
        {#if showConfirm}
          <input
            id="confirmPassword"
            type="text"
            bind:value={confirmPassword}
            placeholder="Digite a senha novamente"
            class="w-full pl-11 pr-12 py-3.5 bg-slate-50 border rounded-16 text-[15px] focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all placeholder:text-slate-400 {errors.confirmPassword ? 'border-red-400' : 'border-slate-200'}"
          />
        {:else}
          <input
            id="confirmPassword"
            type="password"
            bind:value={confirmPassword}
            placeholder="Digite a senha novamente"
            class="w-full pl-11 pr-12 py-3.5 bg-slate-50 border rounded-16 text-[15px] focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all placeholder:text-slate-400 {errors.confirmPassword ? 'border-red-400' : 'border-slate-200'}"
          />
        {/if}
        <button
          type="button"
          class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          on:click={() => showConfirm = !showConfirm}
        >
          <Icon name={showConfirm ? 'eye-off' : 'eye'} size={20} />
        </button>
      </div>
      {#if errors.confirmPassword}<p class="mt-1.5 text-[12px] font-medium text-red-600">{errors.confirmPassword}</p>{/if}
    </div>

    <div class="py-1">
      <p class="text-[13px] text-slate-500 leading-snug">
        Ao clicar em cadastrar, você aceita nossos
        <button type="button" class="text-blue-700 font-bold hover:underline">Termos de Uso</button> e
        <button type="button" class="text-blue-700 font-bold hover:underline">Política de Privacidade</button>.
      </p>
    </div>

    <button
      type="button"
      disabled={loading}
      class="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-18 text-[16px] font-bold transition-all shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
      on:click={submit}
    >
      {#if loading}
        <span class="flex items-center justify-center gap-2">
          <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
          Criando conta...
        </span>
      {:else}
        Criar minha conta
      {/if}
    </button>

    <p class="text-center text-[14px] text-slate-500 mt-6">
      Já possui uma conta?
      <button type="button" class="font-bold text-blue-600 hover:underline" on:click={() => onNavigate('login')}>Entrar agora</button>
    </p>
  </div>
</AuthLayout>
