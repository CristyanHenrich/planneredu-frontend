<!-- OTPInput.svelte — Campos de código OTP (verificação de e-mail) -->
<script>
  /** Número de dígitos */
  export let length = 6;
  /** Array de valores (string[]) — bind externamente */
  export let digits = Array(length).fill('');
  /** Índice do campo ativo (foco) */
  export let activeIndex = 0;

  let inputs = [];

  function handleInput(e, i) {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    digits[i] = val;
    digits = [...digits];
    if (val && i < length - 1) {
      activeIndex = i + 1;
      inputs[i + 1]?.focus();
    }
  }

  function handleKeydown(e, i) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      activeIndex = i - 1;
      inputs[i - 1]?.focus();
    }
  }
</script>

<div class="flex gap-2.5 justify-between mb-7">
  {#each Array(length) as _, i}
    <div
      class="flex-1 flex items-center justify-center rounded-12 relative"
      style="
        max-width: 52px;
        height: 60px;
        border: 1.5px solid {digits[i] ? '#004E98' : (i === activeIndex ? '#004E98' : '#E4E4E7')};
        background: #FFFFFF;
        box-shadow: {i === activeIndex ? '0 0 0 3px rgba(0,78,152,0.12)' : 'none'};
      "
    >
      <input
        bind:this={inputs[i]}
        type="text"
        inputmode="numeric"
        maxlength="1"
        value={digits[i]}
        on:input={(e) => handleInput(e, i)}
        on:keydown={(e) => handleKeydown(e, i)}
        on:focus={() => (activeIndex = i)}
        class="absolute inset-0 w-full h-full opacity-0 cursor-text"
      />
      <span class="text-[26px] font-bold text-pe-text select-none pointer-events-none">
        {digits[i]}
      </span>
      {#if i === activeIndex && !digits[i]}
        <span
          class="absolute w-0.5 h-7 bg-pe-primary animate-blink pointer-events-none"
          style="left: 50%; transform: translateX(-50%);"
        />
      {/if}
    </div>
  {/each}
</div>
