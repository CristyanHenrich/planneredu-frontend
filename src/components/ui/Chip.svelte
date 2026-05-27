<!-- Chip.svelte — Chip de seleção (ex: ano escolar, turno) -->
<script>
  export let label    = '';
  export let selected = false;

  /** Cor quando selecionado */
  export let activeColor   = '#004E98';
  /** Cor de texto quando selecionado */
  export let activeText    = '#FFFFFF';
  /** Cor de fundo quando inativo */
  export let inactiveColor = '#FFFFFF';
  /** Cor de texto quando inativo */
  export let inactiveText  = '#14213D';
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="px-4 py-2.5 rounded-10 text-[14px] font-semibold tracking-tight whitespace-nowrap cursor-pointer select-none active:opacity-70 transition-all"
  style="
    background: {selected ? activeColor : inactiveColor};
    color:      {selected ? activeText  : inactiveText};
    border:     1.5px solid {selected ? activeColor : '#E4E4E7'};
  "
  on:click
>
  {label}
</div>
