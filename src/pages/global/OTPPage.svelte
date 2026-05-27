<script>
  import { onMount, onDestroy } from 'svelte';
  import AuthLayout from '../../layouts/AuthLayout.svelte';
  import Icon from '../../components/ui/Icon.svelte';
  import { api } from '../../lib/api.js';
  import { currentUser } from '../../stores/auth.js';

  export let onNavigate = (id) => {};

  let digits = ["", "", "", "", "", ""];
  let inputs = [];
  let loading = false;
  let resending = false;
  let error = "";
  let countdown = 60;
  let timer;

  $: code = digits.join('');
  $: canResend = countdown === 0;

  onMount(() => {
    inputs[0]?.focus();
    api.verify.emailRequest().catch(() => {});
    startTimer();
  });

  onDestroy(() => clearInterval(timer));

  function startTimer() {
    countdown = 60;
    clearInterval(timer);
    timer = setInterval(() => {
      countdown -= 1;
      if (countdown <= 0) {
        countdown = 0;
        clearInterval(timer);
      }
    }, 1000);
  }

  function handleInput(i, e) {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    digits[i] = val;
    digits = [...digits];
    if (val && i < 5) inputs[i + 1]?.focus();
  }

  function handleKeydown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    digits = [...pasted.split(''), ...Array(6).fill('')].slice(0, 6);
    const nextEmpty = digits.findIndex(d => !d);
    inputs[nextEmpty >= 0 ? nextEmpty : 5]?.focus();
  }

  async function verify() {
    if (code.length < 6) {
      error = 'Insira todos os 6 dígitos do código.';
      return;
    }
    error = "";
    loading = true;
    try {
      await api.verify.emailConfirm({ email_validation_code: code });
      onNavigate('study-mode');
    } catch (err) {
      const msg = err?.errors?.[0]?.message;
      error = msg || 'Código inválido ou expirado. Tente novamente.';
    } finally {
      loading = false;
    }
  }

  async function resend() {
    if (!canResend || resending) return;
    error = "";
    resending = true;
    try {
      await api.verify.emailRequest();
      startTimer();
    } catch (err) {
      error = 'Não foi possível reenviar o código. Tente novamente.';
    } finally {
      resending = false;
    }
  }
</script>

<AuthLayout
  quote="A confiança é a base de qualquer grande conquista."
  author="Desconhecido"
  image="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80"
>
  <div class="mb-10">
    <div class="w-16 h-16 rounded-20 flex items-center justify-center mb-6" style="background:rgba(0,78,152,0.08);color:#004E98;">
       <Icon name="mail" size={32} />
    </div>
    <h1 class="text-[32px] font-black text-slate-900 tracking-tighter mb-2">Verifique seu e-mail</h1>
    <p class="text-[15px] text-slate-500 font-medium leading-relaxed">
      Enviamos um código de 6 dígitos para
      {#if $currentUser?.email}
        <strong class="text-slate-700">{$currentUser.email}</strong>.
      {:else}
        seu e-mail.
      {/if}
    </p>
  </div>

  <div class="space-y-6">
    <!-- Dígitos OTP -->
    <div class="flex gap-3 justify-center" on:paste={handlePaste}>
      {#each digits as d, i}
        <input
          bind:this={inputs[i]}
          type="text"
          inputmode="numeric"
          maxlength="1"
          value={d}
          on:input={(e) => handleInput(i, e)}
          on:keydown={(e) => handleKeydown(i, e)}
          class="w-14 h-16 text-center text-[24px] font-black border-2 rounded-16 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-600/5 outline-none transition-all
            {d ? 'border-blue-600 bg-white' : 'border-slate-200'}
            {error ? 'border-red-400' : ''}"
          placeholder="·"
        />
      {/each}
    </div>

    {#if error}
      <p class="text-center text-[13px] font-medium text-red-600">{error}</p>
    {/if}

    <button
      type="button"
      disabled={loading || code.length < 6}
      class="w-full py-4 text-white rounded-18 text-[16px] font-bold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
      style="background:#004E98;"
      on:click={verify}
    >
      {#if loading}
        <span class="flex items-center justify-center gap-2">
          <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
          Verificando...
        </span>
      {:else}
        Verificar Código
      {/if}
    </button>

    <div class="text-center">
      {#if canResend}
        <button
          type="button"
          class="text-[14px] font-bold text-pe-primary hover:underline disabled:opacity-50"
          disabled={resending}
          on:click={resend}
        >
          {resending ? 'Reenviando...' : 'Reenviar código'}
        </button>
      {:else}
        <p class="text-[14px] text-slate-500 font-medium">
          Não recebeu o código?
          <span class="font-bold text-slate-700">
            Reenviar em 00:{countdown.toString().padStart(2, '0')}
          </span>
        </p>
      {/if}
    </div>

    <button
      type="button"
      class="w-full py-3 flex items-center justify-center gap-2 text-[14px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
      on:click={() => onNavigate('login')}
    >
      <Icon name="chevL" size={16} />
      Voltar para o login
    </button>
  </div>
</AuthLayout>
