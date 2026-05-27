<script>
  import AuthLayout from '../../layouts/AuthLayout.svelte';
  import Icon from '../../components/ui/Icon.svelte';

  export let onNavigate = (id) => {};
</script>

<AuthLayout 
  quote="O único lugar onde o sucesso vem antes do trabalho é no dicionário."
  author="Vidal Sassoon"
  image="https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&w=1200&q=80"
>
  <div class="flex flex-col items-center text-center py-10">
    <div class="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-8">
       <div class="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
          <Icon name="check" size={32} color="#FFF" />
       </div>
    </div>
    
    <h1 class="text-[40px] font-black text-slate-900 tracking-tighter mb-4">Parabéns!</h1>
    <p class="text-[17px] text-slate-500 font-medium leading-relaxed max-w-sm mb-10">
      Sua conta foi criada com sucesso. Estamos prontos para transformar sua rotina de estudos.
    </p>

    <button 
      class="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white rounded-20 text-[18px] font-bold transition-all shadow-xl shadow-blue-700/20 active:scale-[0.98]"
      on:click={() => onNavigate('home')}
    >
      Começar Minha Jornada
    </button>
  </div>
</AuthLayout>
