<!-- Login.svelte — Tela 2: Login -->
<script>
  import LogoIcon     from '../../components/ui/LogoIcon.svelte';
  import TopNav       from '../../components/ui/TopNav.svelte';
  import Input        from '../../components/ui/Input.svelte';
  import Button       from '../../components/ui/Button.svelte';
  import SocialButton from '../../components/ui/SocialButton.svelte';
  import Divider      from '../../components/ui/Divider.svelte';
  import { authStore } from '../../stores/auth.js';

  export let onNavigate = (screen) => {};

  let identifier = '';
  let password   = '';
  let showPass   = false;
  let loading    = false;
  let error      = '';

  async function handleLogin() {
    if (!identifier || !password) { error = 'Preencha todos os campos.'; return; }
    error = ''; loading = true;
    try {
      const data = await authStore.login(identifier, password);
      if (data?.mfa_required) {
        error = 'Verificação em dois fatores necessária. Use o código enviado no WhatsApp.';
        return;
      }
      // App.svelte authStore subscriber redireciona automaticamente
    } catch (e) {
      error = e?.errors?.[0]?.message || 'E-mail ou senha inválidos.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="w-full h-full bg-white flex flex-col">
  <TopNav onBack={() => onNavigate('welcome')} />

  <div class="px-6 pt-2 flex-1">
    <div class="mb-6">
      <LogoIcon size={52} />
    </div>

    <h1 class="text-[28px] font-extrabold text-pe-text tracking-tighter mb-2">
      Bem-vindo de volta
    </h1>
    <p class="text-[15px] text-pe-text-sec mb-7 tracking-tight leading-snug">
      Entre para continuar seus estudos.
    </p>

    <Input
      label="E-mail"
      type="email"
      placeholder="seu@email.com"
      bind:value={identifier}
      iconLeft="mail"
    />

    <Input
      label="Senha"
      type={showPass ? 'text' : 'password'}
      placeholder="••••••••"
      bind:value={password}
      iconLeft="lock"
      iconRight={showPass ? 'eye-off' : 'eye'}
      onIconRightClick={() => (showPass = !showPass)}
    />

    {#if error}
      <p class="text-[13px] text-red-500 -mt-2 mb-3">{error}</p>
    {/if}

    <div class="text-right mb-6">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <span class="text-[14px] text-pe-primary font-semibold cursor-pointer">
        Esqueci minha senha
      </span>
    </div>

    <Button on:click={handleLogin} disabled={loading}>
      {loading ? 'Entrando…' : 'Entrar'}
    </Button>

    <Divider label="ou continue com" />

    <div class="flex gap-2.5">
      <SocialButton provider="apple" />
      <SocialButton provider="google" />
    </div>
  </div>

  <div class="px-5 py-4 pb-7 text-center text-[15px] text-pe-text-sec tracking-tight">
    Não tem conta?
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <span
      class="text-pe-primary font-semibold cursor-pointer"
      on:click={() => onNavigate('signup')}
    >Criar conta</span>
  </div>
</div>
