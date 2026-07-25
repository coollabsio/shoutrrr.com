/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: 'var(--lime)',
          deep: 'var(--lime-deep)',
          ring: 'var(--lime-ring)',
          soft: 'var(--lime-soft)',
          text: 'var(--lime-text)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          900: 'var(--ink-900)',
          800: 'var(--ink-800)',
          700: 'var(--ink-700)',
          600: 'var(--ink-600)',
          500: 'var(--ink-500)',
          400: 'var(--ink-400)',
          300: 'var(--ink-300)',
          200: 'var(--ink-200)',
        },
        line: {
          DEFAULT: 'var(--line)',
          soft: 'var(--line-soft)',
          strong: 'var(--line-strong)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          sunken: 'var(--surface-sunken)',
          raised: 'var(--surface-raised)',
        },
        net: {
          x: 'oklch(0.2 0 0)',
          li: 'oklch(0.5 0.13 250)',
          bs: 'oklch(0.68 0.15 230)',
        },
      },
      fontFamily: {
        sans: [
          '"Noto Sans Variable"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
        display: [
          '"Newsreader Variable"',
          'ui-serif',
          'Georgia',
          '"Times New Roman"',
          'serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        panel: 'var(--shadow-panel)',
      },
      maxWidth: {
        site: '1180px',
      },
    },
  },
  plugins: [],
};
