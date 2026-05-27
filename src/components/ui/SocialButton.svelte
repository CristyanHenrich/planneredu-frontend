<!-- SocialButton.svelte — Botão de login social (Apple / Google) -->
<script>
  /** @type {'apple'|'google'} */
  export let provider = 'google';
</script>

<button
  type="button"
  on:click
  class="flex-1 h-14 rounded-14 bg-white flex items-center justify-center gap-2 text-[15px] font-semibold text-pe-text cursor-pointer active:opacity-70 transition-opacity"
  style="border: 1.5px solid #E4E4E7;"
>
  {#if provider === 'apple'}
    <svg width="18" height="20" viewBox="0 0 18 20">
      <path d="M14.4 10.3c0-2.6 2.1-3.8 2.2-3.9-1.2-1.7-3-2-3.7-2-1.6-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3-.5 7.5 1.2 10 .9 1.2 1.9 2.5 3.2 2.5 1.3-.1 1.8-.8 3.3-.8s2 .8 3.3.8c1.4 0 2.3-1.2 3.1-2.4.5-.7 1-1.6 1.3-2.4-2.3-.9-2.7-3.1-2.7-3.3zM12 2.7c.7-.9 1.2-2 1.1-3.2-1 0-2.3.7-3 1.5-.6.7-1.2 1.9-1.1 3 1.2.1 2.3-.6 3-1.3z" fill="#000"/>
    </svg>
    Apple
  {:else}
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.35 0-4.33-1.58-5.03-3.71H.9v2.33A8.99 8.99 0 009 18z" fill="#34A853"/>
      <path d="M3.97 10.71A5.4 5.4 0 013.68 9c0-.59.1-1.17.29-1.71V4.96H.9A9 9 0 000 9c0 1.45.35 2.82.9 4.04l3.07-2.33z" fill="#FBBC05"/>
      <path d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.59C13.47.89 11.43 0 9 0A8.99 8.99 0 00.9 4.96l3.07 2.33C4.67 5.16 6.65 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
    Google
  {/if}
</button>
