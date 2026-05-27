<script>
  import AppLayout  from '../../layouts/AppLayout.svelte';
  import PageHeader from '../../components/layout/PageHeader.svelte';
  import Icon       from '../../components/ui/Icon.svelte';
  import { api }    from '../../lib/api.js';
  import { Zap, BookOpen, Award, Clock, Target, TrendingUp, CheckCircle2, Star, Calendar, FileText, BarChart3, Trophy, Lock, History, Flame, Brain, Eye, Medal, Rocket } from 'lucide-svelte';

  export let onNavigate = (id) => {};

  let xpData = null;
  let achievements = [];
  let loading = true;
  let error = null;

  const sourceIcons = {
    task_completed: CheckCircle2,
    study_plan_done: Clock,
    achievement_unlocked: Award,
    default: Zap,
  };

  const sourceColors = {
    task_completed: '#4CD964',
    study_plan_done: '#004E98',
    achievement_unlocked: '#FFB42E',
    default: '#6B7280',
  };

  async function loadData() {
    loading = true;
    error = null;
    try {
      const [xpRes, achRes] = await Promise.all([
        api.xp.summary(),
        api.achievements.mine(),
      ]);

      xpData = xpRes;
      achievements = achRes || [];
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      error = 'Falha ao carregar dados. Tente novamente.';
    } finally {
      loading = false;
    }
  }

  $: if (!xpData) loadData();

  $: xpInLevel = xpData ? xpData.xp_in_level : 0;
  $: xpNeeded = xpData ? xpData.xp_needed : 300;
  $: level = xpData ? xpData.level : 1;
  $: levelName = xpData ? xpData.level_name : 'Iniciante';
  $: cumulativeXp = xpData ? xpData.cumulative_xp : 0;
  $: totalForNextLevel = xpInLevel + xpNeeded;
  $: progressPercent = totalForNextLevel > 0 ? (xpInLevel / totalForNextLevel) * 100 : 100;

  $: earnedCount = achievements.length;
</script>

<AppLayout title="Conquistas" breadcrumbs={[{label:'Aluno'},{label:'Conquistas'}]} active="achievements" {onNavigate}>
  <PageHeader
    title="Conquistas"
    subtitle="{earnedCount} desbloqueadas · {cumulativeXp.toLocaleString()} XP total"
  />

  {#if loading}
    <div class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-16 p-6 text-center">
      <p class="text-red-600 font-bold">{error}</p>
      <button
        onclick={loadData}
        class="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  {:else}
    <!-- Level card -->
    <div class="rounded-16 p-6 mb-6 flex items-center gap-6 text-white relative overflow-hidden" style="background:linear-gradient(135deg,#FF6700,#CC5200);">
      <div class="absolute rounded-full" style="top:-40px;right:-30px;width:200px;height:200px;background:rgba(255,255,255,0.08);" />
      <div class="w-20 h-20 rounded-[20px] flex items-center justify-center text-[40px] font-black flex-shrink-0" style="background:rgba(255,255,255,0.2); border:3px solid rgba(255,255,255,0.3);">
        {level}
      </div>
      <div class="flex-1 relative">
        <p class="text-[12px] font-black uppercase tracking-wider opacity-80 mb-1">Nível atual</p>
        <p class="text-[26px] font-black tracking-tight mb-3">{levelName}</p>
        <div class="h-2.5 bg-white/25 rounded-full overflow-hidden mb-1.5">
          <div
            class="h-full bg-white rounded-full transition-all duration-700"
            style="width:{progressPercent}%;"
          />
        </div>
        <p class="text-[12px] font-bold opacity-90">
          {cumulativeXp.toLocaleString()} / {totalForNextLevel.toLocaleString()} XP até o nível {level + 1}
        </p>
      </div>
      <div class="text-center relative flex-shrink-0">
        <p class="text-[40px] font-black">{earnedCount}</p>
        <p class="text-[13px] font-bold opacity-80">de 12 badges</p>
      </div>
    </div>

    <!-- Badges grid -->
    <div class="grid grid-cols-2 gap-5">
      <!-- Earned -->
      <div class="bg-white rounded-16 p-5 border border-slate-200">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-[15px] font-black text-slate-900">Desbloqueadas</h3>
          <span class="text-[13px] font-bold text-emerald-500">{earnedCount} conquistas</span>
        </div>

        {#if achievements.length > 0}
          <div class="grid grid-cols-3 gap-3">
            {#each achievements as ach, i (ach.id)}
              <div
                class="rounded-14 p-3 text-center border cursor-pointer hover:shadow-sm transition-all"
                style="background:{['rgba(76,217,100,0.08)','rgba(0,78,152,0.08)','rgba(255,45,95,0.08)','rgba(255,103,0,0.08)'][i % 4]}; border-color:{['rgba(76,217,100,0.3)','rgba(0,78,152,0.3)','rgba(255,45,95,0.3)','rgba(255,103,0,0.3)'][i % 4]};
"
              >
                <div class="w-12 h-12 rounded-12 mx-auto mb-2 flex items-center justify-center" style="background:{['rgba(76,217,100,0.2)','rgba(0,78,152,0.2)','rgba(255,45,95,0.2)','rgba(255,103,0,0.2)'][i % 4]};">
                  <Trophy size={20} color="{['#4CD964','#004E98','#FF2D5F','#FF6700'][i % 4]}" />
                </div>
                <p class="text-[12px] font-black text-slate-900 leading-snug">
                  {ach.achievement?.name || `Conquista ${i + 1}`}
                </p>
                <p class="text-[10px] text-slate-500 font-medium mt-0.5">
                  {new Date(ach.earned_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-slate-400 text-center py-8">Nenhuma conquista desbloqueada ainda. Continue estudando!</p>
        {/if}
      </div>

      <!-- Locked -->
      <div class="bg-white rounded-16 p-5 border border-slate-200">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-[15px] font-black text-slate-900">Em progresso</h3>
          <span class="text-[13px] font-bold text-slate-500">{12 - earnedCount} restantes</span>
        </div>

        <div class="flex flex-col gap-3">
          {#each [
            { title:'7 dias seguidos', desc:'Focus streak', icon:Flame, color:'#FF6700' },
            { title:'Leitor ávido', desc:'10 livros lidos', icon:BookOpen, color:'#004E98' },
            { title:'Pontualidade', desc:'20 entregas no prazo', icon:Target, color:'#10B981' },
            { title:'Nota máxima', desc:'Tirou 10 em uma prova', icon:Star, color:'#FFB42E' },
            { title:'Coruja', desc:'Estudou após 22h', icon:Eye, color:'#004E98' },
            { title:'Velocidade', desc:'5 tarefas num dia', icon:Zap, color:'#FF6700' },
            { title:'Top 3 turma', desc:'4/10 semanas', icon:Medal, color:'#FFB42E' },
            { title:'Mês perfeito', desc:'18/30 dias completos', icon:Calendar, color:'#004E98' },
            { title:'Foguete', desc:'10/50 horas extras', icon:Rocket, color:'#FF2D5F' },
            { title:'Enciclopédia', desc:'0/100 tópicos', icon:BookOpen, color:'#6B7280' },
            { title:'Gênio', desc:'3/5 notas 10', icon:Brain, color:'#A78BFA' },
            { title:'Superstar', desc:'0/30 dias consecutivos', icon:TrendingUp, color:'#F59E0B' },
          ] as b, i}
            {#if i >= earnedCount}
              <div
                class="rounded-14 p-3 flex items-center gap-3 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                style="opacity:0.85;"
              >
                <div
                  class="w-12 h-12 rounded-12 flex items-center justify-center flex-shrink-0"
                  style="background:#F1F5F9;"
                >
                  <Lock size={20} color="#94A3B8" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] font-black text-slate-700">{b.title}</p>
                  <p class="text-[11px] text-slate-500 mb-1.5">{b.desc}</p>
                  <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      style="width:0%;background:{b.color};"
                    />
                  </div>
                </div>
                <span class="text-[12px] font-black flex-shrink-0 text-slate-400">?</span>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    </div>

    <!-- XP History -->
    <div class="bg-white rounded-16 p-5 border border-slate-200 mt-6">
      <h3 class="text-[15px] font-black text-slate-900 mb-4 flex items-center gap-2">
        <History size={18} color="#FF6700" />
        Histórico de XP
      </h3>

      {#if xpData && xpData.history.length > 0}
        <div class="space-y-2 max-h-64 overflow-y-auto">
          {#each xpData.history.slice(0, 10) as item}
            {@const IconComponent = sourceIcons[item.source] || sourceIcons.default}
            {@const color = sourceColors[item.source] || sourceColors.default}
            <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:{color}15;">
                  <IconComponent size={18} color={color} />
                </div>
                <div>
                  <p class="text-[13px] font-bold text-slate-700">
                    {item.source === 'task_completed' ? 'Tarefa concluída' :
                     item.source === 'study_plan_done' ? 'Plano de estudo completo' :
                     item.source === 'achievement_unlocked' ? 'Conquista desbloqueada' : item.source}
                  </p>
                  <p class="text-[11px] text-slate-500">
                    {new Date(item.created_at).toLocaleDateString('pt-BR')} às
                    {new Date(item.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-[14px] font-black" style="color:{color};">+{item.xp} XP</span>
                <p class="text-[11px] text-slate-500">Nível {item.level}</p>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-slate-400 text-center py-8 flex items-center justify-center gap-2">
          <BarChart3 size={16} />
          Nenhuma atividade registrada ainda. Complete tarefas e planos de estudo para ganhar XP!
        </p>
      {/if}
    </div>
  {/if}
</AppLayout>
