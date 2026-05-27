<!-- Success.svelte — Tela 6: Cadastro concluído -->
<script>
  import Icon   from '../../components/ui/Icon.svelte';
  import Button from '../../components/ui/Button.svelte';
  import { currentUser } from '../../stores/auth.js';

  export let onNavigate = (screen) => {};

  let user = null;
  const unsub = currentUser.subscribe(u => { user = u; });

  import { onDestroy } from 'svelte';
  onDestroy(unsub);

  $: firstName = user?.name?.split(' ')[0] || 'Aluno';

  $: summary = (() => {
    const mode = user?.study_mode || 'school';
    if (mode === 'university') {
      return [
        { icon: 'school',   label: 'Estudante Universitário' },
        { icon: 'book',     label: 'Planejador de estudos ativado' },
        { icon: 'calendar', label: 'Calendário pronto para uso' },
      ];
    }
    if (mode === 'individual') {
      return [
        { icon: 'school',   label: 'Estudante Autônomo' },
        { icon: 'book',     label: 'Planejador de estudos ativado' },
        { icon: 'calendar', label: 'Calendário pronto para uso' },
      ];
    }
    return [
      { icon: 'school',   label: 'Escola Regular' },
      { icon: 'book',     label: 'Matérias e horários configurados' },
      { icon: 'calendar', label: 'Calendário pronto para uso' },
    ];
  })();

  const confetti = [
    { top: 120, left: 40,  color: '#FF6700', size: 8 },
    { top: 180, right: 60, color: '#004E98', size: 12 },
    { top: 100, right: 100,color: '#FFB42E', size: 6 },
    { top: 240, left: 80,  color: '#4CD964', size: 10 },
    { top: 200, left: 160, color: '#FF6700', size: 7 },
    { top: 90,  left: 140, color: '#004E98', size: 5 },
    { top: 260, right: 30, color: '#FFB42E', size: 9 },
    { top: 320, left: 50,  color: '#4CD964', size: 6 },
    { top: 330, right: 90, color: '#004E98', size: 8 },
  ];
</script>

<div class="w-full h-full bg-white flex flex-col relative overflow-hidden">
  {#each confetti as c}
    <div
      class="absolute rounded-full"
      style="
        top:    {c.top}px;
        left:   {c.left ?? 'auto'}px;
        right:  {c.right ?? 'auto'}px;
        width:  {c.size}px;
        height: {c.size}px;
        background: {c.color};
      "
    />
  {/each}

  <div class="pt-24 px-8 text-center">
    <div class="relative mx-auto mb-10" style="width:120px;height:120px;">
      <div
        class="absolute rounded-full"
        style="inset:-12px; border:2px solid #4CD964; opacity:0.3;"
      />
      <div
        class="absolute rounded-full"
        style="inset:-24px; border:2px solid #4CD964; opacity:0.15;"
      />
      <div
        class="w-full h-full rounded-full flex items-center justify-center"
        style="background:#4CD964; box-shadow:0 20px 50px rgba(76,217,100,0.35);"
      >
        <svg width="56" height="56" viewBox="0 0 24 24">
          <path d="M4 12l5 5 11-11" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <h1 class="text-[32px] font-extrabold text-pe-text tracking-tighter mb-3">
      Tudo pronto!
    </h1>
    <p class="text-[16px] text-pe-text-sec leading-relaxed tracking-tight max-w-[300px] mx-auto">
      Olá, <strong class="text-pe-text">{firstName}</strong>!<br />
      Sua conta foi criada com sucesso.
    </p>

    <div class="bg-pe-bg-alt rounded-2xl p-4 mt-8 text-left">
      {#each summary as item, i}
        <div
          class="flex items-center gap-3 py-2.5"
          style="border-bottom: {i < summary.length - 1 ? '1px solid #E4E4E7' : 'none'};"
        >
          <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Icon name={item.icon} size={16} color="#004E98" />
          </div>
          <span class="flex-1 text-[14px] text-pe-text font-medium">{item.label}</span>
          <Icon name="check" size={16} color="#4CD964" />
        </div>
      {/each}
    </div>
  </div>

  <div class="flex-1" />
  <div class="px-5 pb-7">
    <Button variant="secondary" on:click={() => onNavigate('home')}>
      Começar a usar
    </Button>
  </div>
</div>
