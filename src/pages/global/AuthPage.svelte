<script>
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';

  export let onNavigate = (id) => {};

  // Which auth step is currently shown in the preview
  let activeStep = 'welcome';
  const steps = [
    { id:'welcome', label:'Boas‑vindas' },
    { id:'login',   label:'Login' },
    { id:'signup',  label:'Cadastro' },
    { id:'otp',     label:'OTP' },
    { id:'school',  label:'Info escola' },
    { id:'success', label:'Sucesso' },
  ];

  // Local state for form previews (read-only look)
  let email    = 'aluno@escola.edu.br';
  let password = 'minhasenha123!';
  let name     = 'Ana Souza';
  let showPass = false;
  let countdown = 42;
  let digits   = ['4','2','7','', '', ''];

  $: strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6)  s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password) || /\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  })();

  const strengthColors = ['#E4E4E7','#FF2D5F','#FF6700','#FFB42E','#4CD964'];
  const strengthLabel  = ['','Fraca','Razoável','Boa','Forte'];
</script>

<AppLayout title="Auth" breadcrumbs={[{label:'Global'},{label:'Autenticação'}]} active="login" {onNavigate}>
  <PageHeader
    title="Fluxo de Autenticação"
    subtitle="Boas-vindas · Login · Cadastro · OTP · Escola · Sucesso"
  />

  <!-- Step selector tabs -->
  <div class="flex gap-1 p-1 rounded-xl mb-6 w-fit" style="background:#F1F5F9;">
    {#each steps as step}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="px-4 py-2 rounded-lg text-[13px] font-bold cursor-pointer transition-all"
        style="
          background:{activeStep === step.id ? '#FFFFFF' : 'transparent'};
          color:{activeStep === step.id ? '#0F172A' : '#64748B'};
          box-shadow:{activeStep === step.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'};
        "
        on:click={() => (activeStep = step.id)}
      >{step.label}</div>
    {/each}
  </div>

  <!-- Split layout: preview (phone frame) + info panel -->
  <div class="grid grid-cols-3 gap-6">

    <!-- LEFT: Phone-style preview -->
    <div class="col-span-1 flex flex-col items-center">
      <div
        class="w-full max-w-[320px] rounded-24 overflow-hidden shadow-xl border"
        style="border-color:#E4E4E7; min-height:560px; background:#fff; display:flex; flex-direction:column;"
      >
        <!-- Top bar (mock phone status) -->
        <div class="flex items-center justify-between px-5 pt-4 pb-2" style="background:#fff;">
          <span class="text-[11px] font-bold text-slate-400">9:41</span>
          <div class="flex gap-1 items-center">
            <div style="width:14px;height:7px;border:1.5px solid #94A3B8;border-radius:2px;position:relative;">
              <div style="position:absolute;right:-4px;top:1.5px;width:3px;height:4px;background:#94A3B8;border-radius:0 1px 1px 0;"></div>
              <div style="width:70%;height:100%;background:#4CD964;border-radius:1px;"></div>
            </div>
          </div>
        </div>

        <!-- Step content -->
        <div class="flex-1 flex flex-col px-5 py-3">

          {#if activeStep === 'welcome'}
            <!-- Logo area -->
            <div class="flex-1 flex flex-col items-center justify-center text-center pb-4">
              <div class="w-16 h-16 rounded-18 flex items-center justify-center mb-5" style="background:#004E98;">
                <img src="/assets/logo-icon.svg" alt="PlannerEdu" class="w-9 h-9" />
              </div>
              <h2 class="text-[22px] font-extrabold text-slate-900 tracking-tighter mb-2">PlannerEdu</h2>
              <p class="text-[14px] text-slate-500 leading-snug">Organize seus estudos.<br/>Alcance seus objetivos.</p>
            </div>
            <div class="pb-2 space-y-2.5">
              <button class="w-full py-3.5 rounded-14 text-[15px] font-bold text-white" style="background:#004E98;">Entrar</button>
              <button class="w-full py-3.5 rounded-14 text-[15px] font-bold text-slate-700 border border-slate-200">Criar conta</button>
            </div>

          {:else if activeStep === 'login'}
            <div class="mb-5">
              <div class="w-10 h-10 rounded-12 flex items-center justify-center mb-4" style="background:rgba(0,78,152,0.08);">
                <img src="/assets/logo-icon.svg" alt="" class="w-6 h-6" />
              </div>
              <h2 class="text-[22px] font-extrabold text-slate-900 tracking-tighter mb-1">Bem-vindo de volta</h2>
              <p class="text-[13px] text-slate-500">Entre para continuar seus estudos.</p>
            </div>
            <!-- E-mail field -->
            <div class="mb-3">
              <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">E-mail</label>
              <div class="flex items-center gap-2 border border-slate-200 rounded-12 px-3 py-2.5" style="background:#F8FAFC;">
                <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <span class="text-[13px] text-slate-700">{email}</span>
              </div>
            </div>
            <!-- Password field -->
            <div class="mb-2">
              <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Senha</label>
              <div class="flex items-center gap-2 border rounded-12 px-3 py-2.5" style="border-color:#004E98;background:rgba(0,78,152,0.04);">
                <svg class="w-4 h-4 flex-shrink-0" style="color:#004E98;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path stroke-linecap="round" stroke-linejoin="round" d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <span class="text-[13px] text-slate-400 flex-1">••••••••••••</span>
                <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </div>
            </div>
            <div class="text-right mb-4"><span class="text-[12px] font-semibold" style="color:#004E98;">Esqueci minha senha</span></div>
            <button class="w-full py-3.5 rounded-14 text-[14px] font-bold text-white mb-3" style="background:#004E98;">Entrar</button>
            <div class="flex items-center gap-2 mb-3">
              <div class="flex-1 h-px bg-slate-200"></div>
              <span class="text-[11px] text-slate-400">ou continue com</span>
              <div class="flex-1 h-px bg-slate-200"></div>
            </div>
            <div class="flex gap-2">
              <button class="flex-1 py-2.5 rounded-12 flex items-center justify-center gap-1.5 border border-slate-200 text-[12px] font-semibold text-slate-700">
                <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#000" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                Apple
              </button>
              <button class="flex-1 py-2.5 rounded-12 flex items-center justify-center gap-1.5 border border-slate-200 text-[12px] font-semibold text-slate-700">
                <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </button>
            </div>
            <p class="text-center mt-4 text-[12px] text-slate-500">Não tem conta? <span class="font-semibold" style="color:#004E98;">Criar conta</span></p>

          {:else if activeStep === 'signup'}
            <!-- Progress stepper -->
            <div class="flex gap-1.5 mb-5">
              {#each [1,2,3,4] as st}
                <div class="h-1 rounded-full flex-1" style="background:{st===1?'#004E98':'#E4E4E7'};"></div>
              {/each}
            </div>
            <h2 class="text-[22px] font-extrabold text-slate-900 tracking-tighter mb-1">Criar sua conta</h2>
            <p class="text-[13px] text-slate-500 mb-4">Vamos começar com o básico.</p>
            <!-- Name -->
            <div class="mb-3">
              <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Nome completo</label>
              <div class="flex items-center gap-2 border border-slate-200 rounded-12 px-3 py-2.5" style="background:#F8FAFC;">
                <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                <span class="text-[13px] text-slate-700">{name}</span>
              </div>
            </div>
            <!-- Email -->
            <div class="mb-3">
              <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">E-mail</label>
              <div class="flex items-center gap-2 border rounded-12 px-3 py-2.5" style="border-color:#4CD964;background:rgba(76,217,100,0.04);">
                <svg class="w-4 h-4" style="color:#4CD964;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <span class="text-[13px] text-slate-700 flex-1">{email}</span>
                <svg class="w-4 h-4" style="color:#4CD964;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
              <p class="text-[10px] font-semibold mt-1" style="color:#4CD964;">✓ E-mail disponível</p>
            </div>
            <!-- Password + strength -->
            <div class="mb-4">
              <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Senha</label>
              <div class="flex items-center gap-2 border border-slate-200 rounded-12 px-3 py-2.5" style="background:#F8FAFC;">
                <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path stroke-linecap="round" stroke-linejoin="round" d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <span class="text-[13px] text-slate-400 flex-1">••••••••••••</span>
              </div>
              <div class="flex gap-1 mt-1.5">
                {#each [1,2,3,4] as bar}
                  <div class="flex-1 h-1 rounded-full transition-all" style="background:{bar<=strength?strengthColors[strength]:'#E4E4E7'};"></div>
                {/each}
              </div>
              {#if strength > 0}<p class="text-[10px] font-semibold mt-0.5" style="color:{strengthColors[strength]};">{strengthLabel[strength]}</p>{/if}
            </div>
            <p class="text-[11px] text-slate-400 text-center mb-3">Ao continuar, você concorda com os <span style="color:#004E98;">Termos</span> e <span style="color:#004E98;">Privacidade</span></p>
            <button class="w-full py-3.5 rounded-14 text-[14px] font-bold text-white" style="background:#004E98;">Continuar</button>

          {:else if activeStep === 'otp'}
            <!-- Progress -->
            <div class="flex gap-1.5 mb-5">
              {#each [1,2,3,4] as st}
                <div class="h-1 rounded-full flex-1" style="background:{st<=2?'#004E98':'#E4E4E7'};"></div>
              {/each}
            </div>
            <div class="w-12 h-12 rounded-14 flex items-center justify-center mb-4" style="background:rgba(0,78,152,0.08);">
              <svg class="w-6 h-6" style="color:#004E98;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <h2 class="text-[22px] font-extrabold text-slate-900 tracking-tighter mb-1">Verifique seu e-mail</h2>
            <p class="text-[13px] text-slate-500 mb-5">Enviamos um código de 6 dígitos para <strong class="text-slate-700">{email}</strong></p>
            <!-- OTP boxes -->
            <div class="flex gap-2 justify-center mb-5">
              {#each digits as d, i}
                <div
                  class="w-10 h-12 rounded-12 flex items-center justify-center text-[20px] font-black border-2"
                  style="
                    border-color:{d ? (i<3?'#004E98':'#E4E4E7') : (i===3?'#004E98':'#E4E4E7')};
                    background:{d ? (i<3?'rgba(0,78,152,0.06)':'#fff') : '#fff'};
                    color:#14213D;
                  "
                >{d || (i===3?'|':'')}</div>
              {/each}
            </div>
            <div class="flex items-center justify-center gap-1.5 text-[13px] text-slate-500 py-2.5 px-3.5 rounded-10 mb-4" style="background:#F1F5F9;">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Reenviar em <strong class="text-slate-700">00:{countdown.toString().padStart(2,'0')}</strong>
            </div>
            <button class="w-full py-3.5 rounded-14 text-[14px] font-bold text-white" style="background:#004E98;">Verificar</button>

          {:else if activeStep === 'school'}
            <div class="flex gap-1.5 mb-5">
              {#each [1,2,3,4] as st}
                <div class="h-1 rounded-full flex-1" style="background:{st<=3?'#004E98':'#E4E4E7'};"></div>
              {/each}
            </div>
            <h2 class="text-[22px] font-extrabold text-slate-900 tracking-tighter mb-1">Sua escola</h2>
            <p class="text-[13px] text-slate-500 mb-5">Precisamos de algumas informações sobre sua instituição.</p>
            {#each ['Nome da escola','Série / Ano','Turno'] as lbl, i}
              <div class="mb-3">
                <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">{lbl}</label>
                <div class="flex items-center gap-2 border border-slate-200 rounded-12 px-3 py-2.5" style="background:#F8FAFC;">
                  <span class="text-[13px] text-slate-400">{['Escola Estadual Prof. João Lima','3º Ano · Ensino Médio','Vespertino'][i]}</span>
                </div>
              </div>
            {/each}
            <button class="w-full py-3.5 rounded-14 text-[14px] font-bold text-white mt-2" style="background:#004E98;">Finalizar</button>

          {:else if activeStep === 'success'}
            <div class="flex-1 flex flex-col items-center justify-center text-center py-4">
              <!-- Animated checkmark circle -->
              <div class="w-20 h-20 rounded-full flex items-center justify-center mb-6" style="background:rgba(76,217,100,0.12);">
                <div class="w-14 h-14 rounded-full flex items-center justify-center" style="background:#4CD964;">
                  <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
              </div>
              <h2 class="text-[24px] font-extrabold text-slate-900 tracking-tighter mb-2">Tudo certo!</h2>
              <p class="text-[14px] text-slate-500 leading-relaxed mb-6">Sua conta foi criada com sucesso.<br/>Bem-vindo à PlannerEdu!</p>
              <button class="w-full py-3.5 rounded-14 text-[15px] font-bold text-white" style="background:#004E98;">Começar agora →</button>
            </div>
          {/if}

        </div>
      </div>
      <p class="text-[11px] text-slate-400 mt-3 font-semibold">Preview · Mobile</p>
    </div>

    <!-- RIGHT: Flow info + step details -->
    <div class="col-span-2 space-y-5">

      <!-- Flow diagram -->
      <div class="bg-white rounded-16 p-5 border border-slate-200">
        <h3 class="text-[14px] font-black text-slate-900 mb-4">Fluxo completo</h3>
        <div class="flex items-center gap-2 flex-wrap">
          {#each steps as step, i}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              class="flex items-center gap-2 cursor-pointer"
              on:click={() => (activeStep = step.id)}
            >
              <div
                class="px-3.5 py-2 rounded-12 text-[12px] font-bold border-2 transition-all"
                style="
                  background:{activeStep===step.id?'#004E98':'#F8FAFC'};
                  color:{activeStep===step.id?'#fff':'#475569'};
                  border-color:{activeStep===step.id?'#004E98':'#E2E8F0'};
                "
              >
                <span class="text-[10px] opacity-60 mr-1">{i+1}.</span>{step.label}
              </div>
              {#if i < steps.length - 1}
                <svg class="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <!-- Current step details -->
      <div class="bg-white rounded-16 p-5 border border-slate-200">
        <h3 class="text-[14px] font-black text-slate-900 mb-4">
          Detalhes: {steps.find(s => s.id === activeStep)?.label}
        </h3>
        <div class="grid grid-cols-2 gap-4">
          {#if activeStep === 'welcome'}
            <div class="bg-slate-50 rounded-12 p-4 border border-slate-200">
              <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Objetivo</p>
              <p class="text-[13px] text-slate-700">Primeiro contato com o app. Apresenta logo e botões de Entrar / Criar conta.</p>
            </div>
            <div class="bg-slate-50 rounded-12 p-4 border border-slate-200">
              <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Navegação</p>
              <p class="text-[13px] text-slate-700">Entrar → Login · Criar conta → SignUp</p>
            </div>
          {:else if activeStep === 'login'}
            <div class="bg-slate-50 rounded-12 p-4 border border-slate-200">
              <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Campos</p>
              <p class="text-[13px] text-slate-700">E-mail + Senha com toggle de visibilidade. Social login (Apple, Google).</p>
            </div>
            <div class="bg-slate-50 rounded-12 p-4 border border-slate-200">
              <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Ação</p>
              <p class="text-[13px] text-slate-700">Sucesso → home. Esqueci senha → recuperação.</p>
            </div>
          {:else if activeStep === 'signup'}
            <div class="bg-slate-50 rounded-12 p-4 border border-slate-200">
              <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Campos</p>
              <p class="text-[13px] text-slate-700">Nome completo · E-mail · Senha com medidor de força (4 níveis).</p>
            </div>
            <div class="bg-slate-50 rounded-12 p-4 border border-slate-200">
              <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Progresso</p>
              <p class="text-[13px] text-slate-700">Etapa 1/4 — barra de progresso visual no topo.</p>
            </div>
          {:else if activeStep === 'otp'}
            <div class="bg-slate-50 rounded-12 p-4 border border-slate-200">
              <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Componente</p>
              <p class="text-[13px] text-slate-700">6 caixas individuais de dígito, auto-foco, paste inteligente.</p>
            </div>
            <div class="bg-slate-50 rounded-12 p-4 border border-slate-200">
              <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Timer</p>
              <p class="text-[13px] text-slate-700">Countdown 60s para reenvio do código. Etapa 2/4.</p>
            </div>
          {:else if activeStep === 'school'}
            <div class="bg-slate-50 rounded-12 p-4 border border-slate-200">
              <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Campos</p>
              <p class="text-[13px] text-slate-700">Nome da escola · Série/Ano · Turno. Dropdowns pré-populados.</p>
            </div>
            <div class="bg-slate-50 rounded-12 p-4 border border-slate-200">
              <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Progresso</p>
              <p class="text-[13px] text-slate-700">Etapa 3/4 — último passo antes do sucesso.</p>
            </div>
          {:else if activeStep === 'success'}
            <div class="bg-slate-50 rounded-12 p-4 border border-slate-200">
              <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Componente</p>
              <p class="text-[13px] text-slate-700">Tela de confirmação com ícone animado, mensagem de boas-vindas e CTA.</p>
            </div>
            <div class="bg-slate-50 rounded-12 p-4 border border-slate-200">
              <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Próximo passo</p>
              <p class="text-[13px] text-slate-700">"Começar agora" → Dashboard do aluno.</p>
            </div>
          {/if}
        </div>
      </div>

      <!-- UX notes -->
      <div class="rounded-16 p-5" style="background:rgba(0,78,152,0.05); border:1px solid rgba(0,78,152,0.15);">
        <p class="text-[12px] font-bold uppercase tracking-wide mb-2" style="color:#004E98;">Notas de UX</p>
        <ul class="space-y-1.5 text-[13px] text-slate-600">
          <li>• Fluxo linear de 6 etapas — sem bifurcações visuais.</li>
          <li>• TopNav com botão de voltar em todas as telas pós-welcome.</li>
          <li>• ProgressStepper (4 barras) aparece apenas nas etapas de cadastro.</li>
          <li>• Todos os campos do formulário têm validação em tempo real.</li>
        </ul>
      </div>

    </div>
  </div>
</AppLayout>
