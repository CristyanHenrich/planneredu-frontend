<!-- ProgressStepper.svelte — Barra de progresso das etapas do onboarding -->
<script>
  /** Etapa atual (começa em 1) */
  export let step  = 1;
  /** Total de etapas */
  export let total = 4;
</script>

<div class="flex gap-1.5 px-6 mb-6">
  {#each Array(total) as _, i}
    <div
      class="flex-1 h-1 rounded-sm transition-colors duration-300"
      style="background: {i < step ? '#004E98' : '#E4E4E7'};"
    />
  {/each}
</div>
