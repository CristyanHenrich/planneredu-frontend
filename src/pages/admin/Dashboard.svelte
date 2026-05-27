<!-- pages/admin/Dashboard.svelte — Painel administrativo -->
<script>
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import Icon       from '../../components/ui/Icon.svelte';

  export let onNavigate = (id) => {};

  const stats = [
    { label:'Total de usuários',  value:'1.247', sub:'+23 este mês',      icon:'user',    color:'#004E98', bg:'rgba(0,78,152,0.08)',   delta:'+1.9%' },
    { label:'Alunos ativos',      value:'1.082', sub:'87% do total',      icon:'book',    color:'#4CD964', bg:'rgba(76,217,100,0.08)', delta:'+2.1%' },
    { label:'Professores',        value:'89',    sub:'em 12 escolas',     icon:'school',  color:'#FF6700', bg:'rgba(255,103,0,0.08)',  delta:'+3' },
    { label:'Novas contas (30d)', value:'156',   sub:'↑ 12% vs. anterior',icon:'check',   color:'#FF2D5F', bg:'rgba(255,45,95,0.08)',  delta:'+12%' },
  ];

  const recentUsers = [
    { name:'Rafaela Oliveira', email:'rafaela@escola.edu.br',  role:'student', school:'Colégio Santa Maria', status:'active',  createdAt:'18/04' },
    { name:'Lucas Mendes',     email:'lucas@escola.edu.br',    role:'student', school:'Colégio Santa Maria', status:'active',  createdAt:'18/04' },
    { name:'Prof. Beatriz',    email:'beatriz@escola.edu.br',  role:'teacher', school:'Colégio Santa Maria', status:'active',  createdAt:'17/04' },
    { name:'Ana Clara',        email:'anaclara@escola.edu.br', role:'student', school:'Escola Est. Central', status:'pending', createdAt:'17/04' },
    { name:'Pedro Nunes',      email:'pedro@escola.edu.br',    role:'student', school:'Escola Est. Central', status:'active',  createdAt:'16/04' },
    { name:'Prof. Ricardo',    email:'ricardo@escola.edu.br',  role:'teacher', school:'Colégio São Paulo',   status:'active',  createdAt:'15/04' },
  ];

  const activityLog = [
    { type:'register', icon:'user',    msg:'Rafaela Oliveira criou uma conta', time:'há 2h',   color:'#4CD964' },
    { type:'task',     icon:'check',   msg:'35 tarefas entregues em 9º Ano A', time:'há 4h',   color:'#004E98' },
    { type:'alert',    icon:'alert',   msg:'Servidor de e-mail com latência',  time:'há 6h',   color:'#FFB42E' },
    { type:'register', icon:'school',  msg:'Nova escola: Colégio São Paulo',   time:'há 1d',   color:'#4CD964' },
    { type:'alert',    icon:'close',   msg:'5 tentativas de login falhas',     time:'há 2d',   color:'#FF2D5F' },
  ];

  const roleColor = { student:'#004E98', teacher:'#FF6700', admin:'#FF2D5F' };
  const roleLabel = { student:'Aluno', teacher:'Professor', admin:'Admin' };
  const statusColor = { active:'#4CD964', pending:'#FFB42E', blocked:'#FF2D5F' };
  const statusLabel = { active:'Ativo', pending:'Pendente', blocked:'Bloqueado' };
</script>

<AppLayout
  title="Painel Admin"
  breadcrumbs={[{ label:'Administração' }]}
  active="a-dashboard"
  {onNavigate}
>
  <PageHeader
    title="Painel Administrativo"
    subtitle="Visão geral do sistema · {new Date().toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long' })}"
    actions={[
      { label:'Exportar relatório' },
      { label:'+ Novo usuário', variant:'primary' },
    ]}
  />

  <!-- Stats -->
  <div class="grid grid-cols-4 gap-4 mb-6">
    {#each stats as s}
      <div
        class="bg-white rounded-14 p-4 flex items-start gap-3"
        style="border:1px solid #E4E4E7;"
      >
        <div
          class="w-10 h-10 rounded-10 flex items-center justify-center flex-shrink-0"
          style="background:{s.bg};"
        >
          <Icon name={s.icon} size={20} color={s.color} />
        </div>
        <div>
          <p class="text-[12px] text-pe-text-sec font-medium">{s.label}</p>
          <p class="text-[22px] font-extrabold text-pe-text tracking-tight leading-tight">{s.value}</p>
          <p class="text-[11px] font-semibold" style="color:{s.color};">{s.delta} · {s.sub}</p>
        </div>
      </div>
    {/each}
  </div>

  <div class="grid grid-cols-3 gap-4 mb-4">
    <!-- Tabela de usuários recentes -->
    <div class="col-span-2 bg-white rounded-14 overflow-hidden" style="border:1px solid #E4E4E7;">
      <div
        class="flex justify-between items-center px-5 py-4"
        style="border-bottom:1px solid #E4E4E7;"
      >
        <h2 class="text-[15px] font-bold text-pe-text tracking-tight">Usuários recentes</h2>
        <span class="text-[12px] font-semibold text-pe-primary cursor-pointer">Ver todos →</span>
      </div>
      <table class="w-full">
        <thead>
          <tr style="background:#F8FAFC;">
            <th class="text-left px-5 py-2.5 text-[11px] font-bold text-pe-text-sec uppercase tracking-wide">Usuário</th>
            <th class="text-left px-3 py-2.5 text-[11px] font-bold text-pe-text-sec uppercase tracking-wide">Papel</th>
            <th class="text-left px-3 py-2.5 text-[11px] font-bold text-pe-text-sec uppercase tracking-wide">Escola</th>
            <th class="text-left px-3 py-2.5 text-[11px] font-bold text-pe-text-sec uppercase tracking-wide">Status</th>
            <th class="text-right px-5 py-2.5 text-[11px] font-bold text-pe-text-sec uppercase tracking-wide">Criado</th>
          </tr>
        </thead>
        <tbody>
          {#each recentUsers as user, i}
            <tr
              class="cursor-pointer hover:bg-pe-bg-alt transition-colors"
              style="border-top:1px solid #F0F0F0;"
            >
              <td class="px-5 py-3">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style="background:{roleColor[user.role]};"
                  >{user.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div>
                  <div>
                    <p class="text-[13px] font-semibold text-pe-text">{user.name}</p>
                    <p class="text-[11px] text-pe-text-sec">{user.email}</p>
                  </div>
                </div>
              </td>
              <td class="px-3 py-3">
                <span
                  class="text-[11px] font-bold uppercase px-2 py-0.5 rounded"
                  style="background:{roleColor[user.role]}12; color:{roleColor[user.role]};"
                >{roleLabel[user.role]}</span>
              </td>
              <td class="px-3 py-3">
                <p class="text-[12px] text-pe-text-sec">{user.school}</p>
              </td>
              <td class="px-3 py-3">
                <div class="flex items-center gap-1.5">
                  <div class="w-1.5 h-1.5 rounded-full" style="background:{statusColor[user.status]};" />
                  <span class="text-[12px]" style="color:{statusColor[user.status]};">
                    {statusLabel[user.status]}
                  </span>
                </div>
              </td>
              <td class="px-5 py-3 text-right">
                <span class="text-[12px] text-pe-text-sec">{user.createdAt}</span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Log de atividade -->
    <div class="col-span-1 bg-white rounded-14 p-5" style="border:1px solid #E4E4E7;">
      <h2 class="text-[15px] font-bold text-pe-text tracking-tight mb-4">Atividade recente</h2>
      <div class="flex flex-col gap-3">
        {#each activityLog as ev}
          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-10 flex items-center justify-center flex-shrink-0 mt-0.5"
              style="background:{ev.color}12;"
            >
              <Icon name={ev.icon} size={15} color={ev.color} />
            </div>
            <div>
              <p class="text-[12px] font-medium text-pe-text leading-snug">{ev.msg}</p>
              <p class="text-[11px] text-pe-text-sec mt-0.5">{ev.time}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Distribuição de usuários -->
  <div class="grid grid-cols-3 gap-4">
    {#each [
      { label:'Alunos',     value:1082, total:1247, color:'#004E98' },
      { label:'Professores',value:89,   total:1247, color:'#FF6700' },
      { label:'Admins',     value:76,   total:1247, color:'#FF2D5F' },
    ] as seg}
      <div
        class="bg-white rounded-14 p-4 flex items-center gap-4"
        style="border:1px solid #E4E4E7;"
      >
        <div class="flex-1">
          <p class="text-[13px] font-semibold text-pe-text-sec">{seg.label}</p>
          <p class="text-[24px] font-extrabold text-pe-text tracking-tight">{seg.value}</p>
          <div class="mt-2 h-1.5 bg-pe-bg-alt rounded-sm overflow-hidden">
            <div
              class="h-full rounded-sm"
              style="width:{(seg.value/seg.total*100).toFixed(0)}%;background:{seg.color};"
            />
          </div>
          <p class="text-[11px] text-pe-text-sec mt-1">{(seg.value/seg.total*100).toFixed(1)}% do total</p>
        </div>
        <div
          class="w-12 h-12 rounded-12 flex items-center justify-center flex-shrink-0"
          style="background:{seg.color}12;"
        >
          <Icon name="user" size={22} color={seg.color} />
        </div>
      </div>
    {/each}
  </div>
</AppLayout>
