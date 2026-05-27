/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        pe: {
          primary:    '#004E98',
          secondary:  '#FF6700',
          bg:         '#FFFFFF',
          'bg-alt':   '#F5F6F8',
          error:      '#FF2D5F',
          success:    '#4CD964',
          warning:    '#FFB42E',
          text:       '#14213D',
          'text-sec': '#6B7280',
          stroke:     '#E4E4E7',
        },
      },
      fontFamily: {
        system: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '10': '10px',
        '12': '12px',
        '14': '14px',
        '18': '18px',
      },
      height: {
        '13': '52px',
        '14': '54px',
      },
      keyframes: {
        blink: {
          '0%, 50%':   { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
      },
      animation: {
        blink: 'blink 1s infinite',
      },
    },
  },
  plugins: [],
};
