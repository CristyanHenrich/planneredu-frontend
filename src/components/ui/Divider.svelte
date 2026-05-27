<!-- Divider.svelte — Divisor horizontal com label central -->
<script>
  export let label = 'ou';
</script>

<div class="flex items-center gap-3 my-5">
  <div class="flex-1 h-px bg-pe-stroke" />
  <span class="text-[12px] text-pe-text-sec font-medium">{label}</span>
  <div class="flex-1 h-px bg-pe-stroke" />
</div>
