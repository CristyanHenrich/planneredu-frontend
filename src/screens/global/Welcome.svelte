<!-- Welcome.svelte — Tela 1: Boas-vindas -->
<script>
  import LogoIcon      from '../../components/ui/LogoIcon.svelte';
  import LogoWordmark  from '../../components/ui/LogoWordmark.svelte';
  import Button        from '../../components/ui/Button.svelte';
  import SocialButton  from '../../components/ui/SocialButton.svelte';

  export let onNavigate = (screen) => {};
</script>

<div class="w-full h-full bg-white flex flex-col relative overflow-hidden">
  <!-- Centro: logo + tagline -->
  <div class="flex-1 flex flex-col items-center justify-center px-8">
    <div class="mb-7" style="margin-top: -40px;">
      <LogoIcon size={130} />
    </div>
    <LogoWordmark size={40} />
    <p class="text-[16px] text-pe-text-sec text-center leading-snug max-w-[280px] tracking-tight mt-3.5">
      Organize sua rotina escolar.<br />Prazos, provas e tarefas no mesmo lugar.
    </p>
  </div>

  <!-- Rodapé: botões de ação -->
  <div class="px-5 pb-12">
    <div class="mb-3">
      <Button on:click={() => onNavigate('signup')}>Criar conta grátis</Button>
    </div>

    <div class="flex gap-2.5 mb-5">
      <SocialButton provider="apple" />
      <SocialButton provider="google" />
    </div>

    <p class="text-center text-[15px] text-pe-text-sec tracking-tight">
      Já tem conta?
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <span
        class="text-pe-primary font-semibold cursor-pointer"
        on:click={() => onNavigate('login')}
      >Entrar</span>
    </p>
  </div>
</div>
