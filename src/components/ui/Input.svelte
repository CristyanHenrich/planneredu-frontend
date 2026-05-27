<!-- Input.svelte — Campo de entrada dinâmico -->
<script>
  import Icon from './Icon.svelte';

  export let label       = '';
  export let type        = 'text';
  export let placeholder = '';
  export let value       = '';
  /**
   * Estado visual: '' | 'error' | 'success' | 'focused'
   */
  export let state       = '';
  export let hint        = '';
  /**
   * Nome do ícone à esquerda (Icon.svelte)
   * @type {string|null}
   */
  export let iconLeft    = null;
  /**
   * Slot/nome de ícone clicável à direita
   * @type {string|null}
   */
  export let iconRight   = null;
  /** Chamado quando o ícone direito é clicado */
  export let onIconRightClick = null;

  /**
   * Exibe barra de força de senha (0–4 barras coloridas)
   * 0 = sem barra, 1 = fraca, 2 = média, 3 = forte, 4 = muito forte
   */
  export let passwordStrength = 0;
  /** Mostra barra de força somente quando > 0 */
  export let showStrength = false;

  let focused = false;

  const borderColor = (st, foc) => {
    if (st === 'error')   return '#FF2D5F';
    if (st === 'success') return '#4CD964';
    if (foc)              return '#004E98';
    return '#E4E4E7';
  };

  const hintColor = (st) => {
    if (st === 'error')   return '#FF2D5F';
    if (st === 'success') return '#4CD964';
    return '#6B7280';
  };

  const strengthColors = ['#E4E4E7', '#FF2D5F', '#FFB42E', '#4CD964', '#4CD964'];
  const strengthLabels = ['', 'Senha muito fraca', 'Senha fraca', 'Senha forte', 'Senha muito forte'];
  const strengthLabelColors = ['', '#FF2D5F', '#FFB42E', '#4CD964', '#4CD964'];
</script>

<div class="mb-4">
  {#if label}
    <label class="block text-[13px] font-semibold text-pe-text mb-2 tracking-tight">
      {label}
    </label>
  {/if}

  <div
    class="flex items-center px-3.5 gap-2.5 bg-white rounded-12 transition-all"
    style="
      height: 52px;
      border: 1.5px solid {borderColor(state, focused)};
      box-shadow: {focused ? '0 0 0 3px rgba(0,78,152,0.08)' : 'none'};
    "
  >
    {#if iconLeft}
      <Icon name={iconLeft} size={18} color="#6B7280" />
    {/if}

    <div class="flex-1 relative">
      {#if type === 'password'}
        <input
          type="password"
          {placeholder}
          bind:value
          on:focus={() => (focused = true)}
          on:blur={() => (focused = false)}
          on:input
          on:change
          class="w-full bg-transparent outline-none border-none text-[16px] tracking-tight text-pe-text placeholder:text-[#9CA3AF] font-system"
        />
      {:else if type === 'email'}
        <input
          type="email"
          {placeholder}
          bind:value
          on:focus={() => (focused = true)}
          on:blur={() => (focused = false)}
          on:input
          on:change
          class="w-full bg-transparent outline-none border-none text-[16px] tracking-tight text-pe-text placeholder:text-[#9CA3AF] font-system"
        />
      {:else}
        <input
          type="text"
          {placeholder}
          bind:value
          on:focus={() => (focused = true)}
          on:blur={() => (focused = false)}
          on:input
          on:change
          class="w-full bg-transparent outline-none border-none text-[16px] tracking-tight text-pe-text placeholder:text-[#9CA3AF] font-system"
        />
      {/if}
    </div>

    {#if iconRight}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="cursor-pointer"
        on:click={onIconRightClick}
      >
        <Icon name={iconRight} size={18} color="#6B7280" />
      </div>
    {/if}
  </div>

  <!-- Barra de força da senha -->
  {#if showStrength && passwordStrength > 0}
    <div class="flex gap-1 mt-2 mb-1.5">
      {#each Array(4) as _, i}
        <div
          class="flex-1 h-1 rounded-sm transition-colors"
          style="background: {i < passwordStrength ? strengthColors[passwordStrength] : '#E4E4E7'};"
        />
      {/each}
    </div>
    <div
      class="flex items-center gap-1 text-[12px] font-medium"
      style="color: {strengthLabelColors[passwordStrength]};"
    >
      {#if passwordStrength >= 3}
        <Icon name="check" size={12} color={strengthLabelColors[passwordStrength]} />
      {/if}
      {strengthLabels[passwordStrength]}
    </div>
  {/if}

  <!-- Hint / mensagem de erro ou sucesso -->
  {#if hint}
    <div
      class="flex items-center gap-1 text-[12px] mt-1.5 pl-1"
      style="color: {hintColor(state)};"
    >
      {#if state === 'error'}
        <Icon name="alert" size={12} color="#FF2D5F" />
      {:else if state === 'success'}
        <Icon name="check" size={12} color="#4CD964" />
      {/if}
      {hint}
    </div>
  {/if}
</div>
