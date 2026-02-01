/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        coollabs: {
          DEFAULT: '#6B16ED',
          100: '#7317FF',
        },
        coolgray: {
          100: '#181818',
          200: '#202020',
          300: '#242424',
          400: '#282828',
          500: '#323232',
        },
        coolblack: '#181818',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        dark: {
          'primary': '#6B16ED',
          'secondary': '#7317FF',
          'accent': '#FCD34D',
          'neutral': '#242424',
          'base-100': '#101010',
          'base-200': '#181818',
          'base-300': '#202020',
          'info': '#2563EB',
          'success': '#16A34A',
          'warning': '#FCD34D',
          'error': '#DC2626',
        },
      },
    ],
  },
};
