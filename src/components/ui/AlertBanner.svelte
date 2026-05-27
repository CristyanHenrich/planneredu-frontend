<!-- AlertBanner.svelte — Banner de alerta / aviso -->
<script>
  import Icon from './Icon.svelte';

  /**
   * @type {'warning'|'error'|'success'|'info'}
   */
  export let type    = 'warning';
  export let message = '';
  /**
   * Ícone customizado (nome do Icon.svelte). Se null, usa padrão do type.
   * @type {string|null}
   */
  export let icon = null;

  const config = {
    warning: { bg: 'rgba(255,180,46,0.12)', border: '#FFB42E', icon: 'alert',  text: '#14213D', iconColor: '#FFB42E' },
    error:   { bg: 'rgba(255,45,95,0.10)',  border: '#FF2D5F', icon: 'alert',  text: '#14213D', iconColor: '#FF2D5F' },
    success: { bg: 'rgba(76,217,100,0.10)', border: '#4CD964', icon: 'check',  text: '#14213D', iconColor: '#4CD964' },
    info:    { bg: 'rgba(0,78,152,0.08)',   border: '#004E98', icon: 'alert',  text: '#14213D', iconColor: '#004E98' },
  };

  $: cfg = config[type] ?? config.info;
  $: iconName = icon ?? cfg.icon;
</script>

<div
  class="flex gap-2.5 items-start p-3 rounded-10 mt-2"
  style="
    background: {cfg.bg};
    border-left: 3px solid {cfg.border};
  "
>
  <Icon name={iconName} size={18} color={cfg.iconColor} />
  <p class="text-[13px] leading-relaxed m-0" style="color: {cfg.text};">
    {message}
    <slot />
  </p>
</div>
