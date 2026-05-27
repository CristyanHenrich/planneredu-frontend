<!-- LogoWordmark.svelte — Logotipo "PlannerEdu" em texto -->
<script>
  export let size        = 28;
  export let color       = '#004E98';
  export let colorAccent = '#FF6700';
</script>

<div
  class="inline-flex items-baseline font-system font-extrabold leading-none"
  style="font-size: {size}px; letter-spacing: -1px;"
>
  <span style="color: {color};">Planner</span>
  <span style="color: {colorAccent};">Edu</span>
</div>
