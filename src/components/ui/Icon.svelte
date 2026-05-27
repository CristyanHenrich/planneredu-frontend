<!-- Icon.svelte — SVG icon set baseado no PlannerEdu -->
<script>
  /** @type {'mail'|'lock'|'user'|'phone'|'eye'|'eye-off'|'check'|'alert'|'school'|'book'|'calendar'|'bell'|'chart'|'home'|'plus'|'clock'|'chevL'|'chevR'|'close'|'search'|'dots'|'star'|'send'|'play'|'flame'} */
  export let name = 'check';
  export let size  = 20;
  export let color = 'currentColor';
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  style="display:block; flex-shrink:0;"
  aria-hidden="true"
>
  {#if name === 'mail'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <path d="M3 7l9 6 9-6"/>
    </g>
  {:else if name === 'lock'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2"/>
      <path d="M8 11V7a4 4 0 018 0v4"/>
    </g>
  {:else if name === 'user'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>
    </g>
  {:else if name === 'eye'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/>
      <circle cx="12" cy="12" r="3"/>
    </g>
  {:else if name === 'eye-off'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </g>
  {:else if name === 'check'}
    <path d="M4 12l5 5 11-11" stroke={color} stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  {:else if name === 'alert'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 8v5M12 16v.5"/>
    </g>
  {:else if name === 'school'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 10l9-5 9 5-9 5-9-5z"/>
      <path d="M7 12v5c0 1 2 2 5 2s5-1 5-2v-5"/>
    </g>
  {:else if name === 'book'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-4 2V5z"/>
      <path d="M4 19a2 2 0 012-2h13"/>
    </g>
  {:else if name === 'calendar'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"/>
      <path d="M3 10h18M8 3v4M16 3v4"/>
    </g>
  {:else if name === 'bell'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 8a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8"/>
      <path d="M10 21a2 2 0 004 0"/>
    </g>
  {:else if name === 'chart'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>
    </g>
  {:else if name === 'home'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-3v-7h-8v7H5a2 2 0 01-2-2v-9z"/>
    </g>
  {:else if name === 'plus'}
    <g stroke={color} stroke-width="2" fill="none" stroke-linecap="round">
      <path d="M12 5v14M5 12h14"/>
    </g>
  {:else if name === 'clock'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 2"/>
    </g>
  {:else if name === 'chevL'}
    <path d="M15 6l-6 6 6 6" stroke={color} stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  {:else if name === 'chevR'}
    <path d="M9 6l6 6-6 6" stroke={color} stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  {:else if name === 'close'}
    <path d="M6 6l12 12M18 6L6 18" stroke={color} stroke-width="2" fill="none" stroke-linecap="round"/>
  {:else if name === 'search'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="7"/>
      <path d="M20 20l-4-4"/>
    </g>
  {:else if name === 'dots'}
    <g fill={color}>
      <circle cx="5"  cy="12" r="2"/>
      <circle cx="12" cy="12" r="2"/>
      <circle cx="19" cy="12" r="2"/>
    </g>
  {:else if name === 'star'}
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  {:else if name === 'send'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </g>
  {:else if name === 'play'}
    <polygon points="5,3 19,12 5,21" fill={color}/>
  {:else if name === 'phone'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 013.08 4.18 2 2 0 015.09 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </g>
  {:else if name === 'flame'}
    <g stroke={color} stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22c-4 0-7-2.5-7-7 0-3.5 2-5.5 4-7.5S12 2 12 2s2 2.5 3 4.5 1 3 1 4.5c0 2-1 4-1 4s1-1 2-1c2 0 3 1.5 3 3 0 3-2.5 5-6 5z"/>
      <path d="M12 22c-2 0-3-1-3-2.5S10 17 12 16s3 1 3 2.5S14 22 12 22z"/>
    </g>
  {/if}
</svg>
