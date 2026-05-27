<!-- OTP.svelte — Tela 4: Verificação de e-mail (etapa 2/4) -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import TopNav          from '../../components/ui/TopNav.svelte';
  import ProgressStepper from '../../components/ui/ProgressStepper.svelte';
  import OTPInput        from '../../components/ui/OTPInput.svelte';
  import Icon            from '../../components/ui/Icon.svelte';
  import Button          from '../../components/ui/Button.svelte';
  import { api } from '../../lib/api.js';
  import { currentUser } from '../../stores/auth.js';

  export let onNavigate = (screen) => {};

  let digits      = ['', '', '', '', '', ''];
  let activeIndex = 0;
  let countdown   = 60;
  let loading     = false;
  let error       = '';
  let userEmail   = '';
  let timer;

  const unsub = currentUser.subscribe(u => { if (u?.email) userEmail = u.email; });

  function startCountdown() {
    clearInterval(timer);
    countdown = 60;
    timer = setInterval(() => {
      if (countdown > 0) countdown--;
      else clearInterval(timer);
    }, 1000);
  }

  async function requestOTP() {
    error = '';
    try { await api.verify.emailRequest(); } catch (_) {}
    startCountdown();
  }

  onMount(requestOTP);
  onDestroy(() => { clearInterval(timer); unsub(); });

  async function handleVerify() {
    const code = digits.join('');
    if (code.length < 6) { error = 'Digite o código completo de 6 dígitos.'; return; }
    error = ''; loading = true;
    try {
      await api.verify.emailConfirm({ email_validation_code: code });
      onNavigate('school');
    } catch (e) {
      error = e?.errors?.[0]?.message || 'Código inválido ou expirado.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="w-full h-full bg-white flex flex-col">
  <TopNav onBack={() => onNavigate('signup')} />
  <ProgressStepper step={2} />

  <div class="px-6 flex-1">
    <div
      class="w-14 h-14 rounded-14 flex items-center justify-center mb-5"
      style="background: rgba(0,78,152,0.08);"
    >
      <Icon name="mail" size={26} color="#004E98" />
    </div>

    <h1 class="text-[28px] font-extrabold text-pe-text tracking-tighter mb-2">
      Verifique seu e-mail
    </h1>
    <p class="text-[15px] text-pe-text-sec mb-8 tracking-tight leading-snug">
      Enviamos um código de 6 dígitos para<br />
      <strong class="text-pe-text">{userEmail || 'seu e-mail'}</strong>
    </p>

    <OTPInput length={6} bind:digits bind:activeIndex />

    {#if error}
      <p class="text-[13px] text-red-500 mb-3">{error}</p>
    {/if}

    <div
      class="flex items-center justify-center gap-1.5 text-[14px] text-pe-text-sec py-2.5 px-3.5 rounded-10 bg-pe-bg-alt"
    >
      <Icon name="clock" size={14} color="#6B7280" />
      {#if countdown > 0}
        Reenviar código em
        <strong class="text-pe-text">00:{countdown.toString().padStart(2, '0')}</strong>
      {:else}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="text-pe-primary font-semibold cursor-pointer" on:click={requestOTP}>
          Reenviar código
        </span>
      {/if}
    </div>

    <p class="text-center mt-5 text-[14px] text-pe-text-sec">
      Não recebeu?
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <span
        class="text-pe-primary font-semibold cursor-pointer"
        on:click={() => onNavigate('signup')}
      >Usar outro e-mail</span>
    </p>
  </div>

  <div class="px-5 pb-7">
    <Button on:click={handleVerify} disabled={loading}>
      {loading ? 'Verificando…' : 'Verificar'}
    </Button>
  </div>
</div>
