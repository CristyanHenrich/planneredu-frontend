<!-- Achievements.svelte — Conquistas e gamificação -->
<script>
  import TopNav from '../../components/ui/TopNav.svelte';
  import Icon   from '../../components/ui/Icon.svelte';

  export let onNavigate = (screen) => {};

  const badges = [
    { emoji:'🔥', title:'7 dias seguidos', desc:'Focus streak',         earned:true,  color:'#FF6700' },
    { emoji:'📚', title:'Leitor ávido',    desc:'10 livros lidos',      earned:true,  color:'#004E98' },
    { emoji:'🎯', title:'Pontualidade',    desc:'20 entregas no prazo', earned:true,  color:'#4CD964' },
    { emoji:'⭐', title:'Nota máxima',     desc:'Tirou 10 em uma prova',earned:true,  color:'#FFB42E' },
    { emoji:'🌙', title:'Coruja',          desc:'Estudou após 22h',     earned:true,  color:'#004E98' },
    { emoji:'⚡', title:'Velocidade',      desc:'5 tarefas num dia',    earned:true,  color:'#FF6700' },
    { emoji:'🏆', title:'Top 3 turma',    desc:'4/10',                  earned:false, progress:0.4, color:'#FFB42E' },
    { emoji:'💎', title:'Mês perfeito',   desc:'18/30 dias',            earned:false, progress:0.6, color:'#004E98' },
    { emoji:'🚀', title:'Foguete',        desc:'0/50 horas',            earned:false, progress:0.2, color:'#FF2D5F' },
  ];
</script>

<div class="w-full h-full bg-white flex flex-col">
  <TopNav />

  <!-- Card de nível -->
  <div class="px-5 pb-5">
    <div
      class="text-white rounded-18 p-[18px] relative overflow-hidden"
      style="background:linear-gradient(135deg,#FF6700,#CC5200);"
    >
      <div class="flex items-center gap-4">
        <div
          class="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center text-[36px] font-black flex-shrink-0"
          style="background:rgba(255,255,255,0.18); border:3px solid rgba(255,255,255,0.3);"
        >6</div>
        <div class="flex-1">
          <p class="text-[11px] font-bold uppercase tracking-wide opacity-85">Nível</p>
          <p class="text-[22px] font-extrabold tracking-tight">Aprendiz Dedicada</p>
          <div class="mt-2 h-1.5 bg-white/25 rounded-sm overflow-hidden">
            <div class="w-[62%] h-full bg-white" />
          </div>
          <p class="text-[11px] mt-1 opacity-90 font-semibold">3.120 / 5.000 XP até o nível 7</p>
        </div>
      </div>
    </div>
  </div>

  <div class="px-6 pb-3 flex justify-between items-baseline">
    <h2 class="text-[22px] font-extrabold text-pe-text tracking-tight">Conquistas</h2>
    <p class="text-[13px] font-bold text-pe-text-sec">6/12</p>
  </div>

  <div class="flex-1 overflow-auto px-5 pb-5 scrollbar-none">
    <div class="grid grid-cols-3 gap-2.5">
      {#each badges as b}
        <div
          class="rounded-14 p-3 text-center relative"
          style="
            background:{b.earned ? '#FFFFFF' : '#F5F6F8'};
            border:1.5px solid {b.earned ? b.color + '40' : '#E4E4E7'};
            opacity:{b.earned ? 1 : 0.9};
          "
        >
          <!-- Ícone do badge -->
          <div
            class="w-[52px] h-[52px] rounded-14 mx-auto mb-2 flex items-center justify-center text-[26px]"
            style="
              background:{b.earned ? b.color+'20' : '#FFFFFF'};
              filter:{b.earned ? 'none' : 'grayscale(1) opacity(0.4)'};
            "
          >{b.emoji}</div>

          <p class="text-[11px] font-bold text-pe-text leading-snug mb-0.5">{b.title}</p>
          <p class="text-[9px] text-pe-text-sec font-medium leading-snug">{b.desc}</p>

          <!-- Barra de progresso para não conquistados -->
          {#if !b.earned && b.progress}
            <div class="mt-1.5 h-1 bg-pe-stroke rounded-sm overflow-hidden">
              <div class="h-full" style="width:{b.progress*100}%;background:{b.color};" />
            </div>
          {/if}

          <!-- Checkmark para conquistados -->
          {#if b.earned}
            <div
              class="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
              style="background:#4CD964;"
            >
              <Icon name="check" size={10} color="#FFFFFF" />
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
