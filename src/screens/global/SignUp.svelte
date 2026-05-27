<!-- SignUp.svelte — Tela 3: Criar conta (etapa 1/4) -->
<script>
  import TopNav          from '../../components/ui/TopNav.svelte';
  import ProgressStepper from '../../components/ui/ProgressStepper.svelte';
  import Input           from '../../components/ui/Input.svelte';
  import Button          from '../../components/ui/Button.svelte';
  import { authStore } from '../../stores/auth.js';

  export let onNavigate = (screen) => {};

  let name     = '';
  let email    = '';
  let password = '';
  let showPass = false;
  let loading  = false;
  let error    = '';

  $: strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6)  s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password) || /\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  })();

  async function handleContinue() {
    if (!name || !email || !password) { error = 'Preencha todos os campos.'; return; }
    if (password.length < 8) { error = 'A senha precisa ter pelo menos 8 caracteres.'; return; }
    error = ''; loading = true;
    try {
      await authStore.register(name, email, password);
      onNavigate('otp');
    } catch (e) {
      error = e?.errors?.[0]?.message || 'Erro ao criar conta. Tente novamente.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="w-full h-full bg-white flex flex-col">
  <TopNav onBack={() => onNavigate('welcome')} />
  <ProgressStepper step={1} />

  <div class="px-6 flex-1">
    <h1 class="text-[28px] font-extrabold text-pe-text tracking-tighter mb-2">
      Criar sua conta
    </h1>
    <p class="text-[15px] text-pe-text-sec mb-7 tracking-tight leading-snug">
      Vamos começar com o básico.
    </p>

    <Input
      label="Nome completo"
      placeholder="Seu nome"
      bind:value={name}
      iconLeft="user"
    />

    <Input
      label="E-mail"
      type="email"
      placeholder="seu@email.com"
      bind:value={email}
      iconLeft="mail"
      state={email.includes('@') ? 'success' : ''}
      hint={email.includes('@') ? 'E-mail válido' : ''}
    />

    <Input
      label="Senha"
      type={showPass ? 'text' : 'password'}
      placeholder="Crie uma senha forte"
      bind:value={password}
      iconLeft="lock"
      iconRight={showPass ? 'eye-off' : 'eye'}
      onIconRightClick={() => (showPass = !showPass)}
      showStrength={true}
      passwordStrength={strength}
    />

    {#if error}
      <p class="text-[13px] text-red-500 mt-1">{error}</p>
    {/if}
  </div>

  <div class="px-5 pb-7">
    <p class="text-[12px] text-pe-text-sec text-center mb-4 leading-relaxed">
      Ao continuar, você concorda com nossos<br />
      <span class="text-pe-primary font-medium">Termos</span> e
      <span class="text-pe-primary font-medium">Política de Privacidade</span>
    </p>
    <Button on:click={handleContinue} disabled={loading}>
      {loading ? 'Criando conta…' : 'Continuar'}
    </Button>
  </div>
</div>
