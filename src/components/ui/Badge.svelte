<!-- Badge.svelte — Etiqueta/status pequeno -->
<script>
  export let label    = '';
  /** Cor base (hex). O background será esta cor com 20% opacidade, e o texto esta cor. */
  export let color    = '#004E98';
  /**
   * Se fornecido, substitui a cor do texto (útil para badges com fundo sólido,
   * ex: badge "Hoje" com fundo branco e texto azul).
   * @type {string|null}
   */
  export let textColor = null;
  /** Usa fundo sólido (sem transparência) */
  export let solid = false;
</script>

<div
  class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide whitespace-nowrap"
  style="
    background: {solid ? color : color + '20'};
    color:      {textColor ?? color};
  "
>
  {label}
</div>
