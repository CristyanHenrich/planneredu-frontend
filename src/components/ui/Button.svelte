<!-- Button.svelte — Botão primário do PlannerEdu -->
<script>
  import Icon from './Icon.svelte';

  /**
   * @type {'primary'|'secondary'|'ghost'|'outline'|'white'}
   */
  export let variant  = 'primary';
  export let disabled = false;
  export let fullWidth = true;
  /**
   * Nome do ícone (do Icon.svelte) para exibir à esquerda
   * @type {string|null}
   */
  export let iconLeft  = null;
  /**
   * Nome do ícone para exibir à direita
   * @type {string|null}
   */
  export let iconRight = null;
  /** Tamanho do botão: 'sm' | 'md' | 'lg' */
  export let size = 'md';
  /** Tipo HTML do botão */
  export let type = 'button';

  const bgMap = {
    primary:   '#004E98',
    secondary: '#FF6700',
    ghost:     'transparent',
    outline:   '#FFFFFF',
    white:     '#FFFFFF',
  };
  const textMap = {
    primary:   '#FFFFFF',
    secondary: '#FFFFFF',
    ghost:     '#004E98',
    outline:   '#14213D',
    white:     '#14213D',
  };
  const borderMap = {
    outline: '1.5px solid #E4E4E7',
    white:   '1.5px solid #E4E4E7',
  };

  $: bg      = disabled ? '#BFD0E2' : bgMap[variant] ?? bgMap.primary;
  $: color   = disabled ? '#FFFFFF' : textMap[variant] ?? textMap.primary;
  $: border  = borderMap[variant] ?? 'none';

  const heightMap = { sm: '40px', md: '54px', lg: '60px' };
  const fontMap   = { sm: '14px', md: '17px', lg: '18px' };
  $: height   = heightMap[size] ?? '54px';
  $: fontSize = fontMap[size] ?? '17px';
</script>

<button
  {type}
  {disabled}
  on:click
  style="
    background: {bg};
    color: {color};
    border: {border};
    height: {height};
    font-size: {fontSize};
    width: {fullWidth ? '100%' : 'auto'};
  "
  class="
    rounded-14 font-semibold tracking-tight
    flex items-center justify-center gap-2.5
    cursor-pointer disabled:cursor-not-allowed
    transition-opacity active:opacity-80
    px-5
  "
>
  {#if iconLeft}
    <Icon name={iconLeft} size={20} color={color} />
  {/if}

  <slot />

  {#if iconRight}
    <Icon name={iconRight} size={20} color={color} />
  {/if}
</button>
