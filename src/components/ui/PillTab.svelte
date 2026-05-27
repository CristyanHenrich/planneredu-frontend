<!-- PillTab.svelte — Aba em forma de pílula (filtros, categorias) -->
<script>
  export let label  = '';
  export let active = false;

  /** Cor de fundo quando ativo */
  export let activeColor = '#004E98';
  /** Cor de texto quando ativo */
  export let activeText  = '#FFFFFF';
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="px-4 py-2 rounded-2xl text-[13px] font-semibold tracking-tight whitespace-nowrap cursor-pointer select-none active:opacity-70 transition-all"
  style="
    background: {active ? activeColor : '#F5F6F8'};
    color:      {active ? activeText  : '#14213D'};
  "
  on:click
>
  {label}
</div>
