/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Brand — lime/chartreuse, matched 1:1 to the Shoutrrr app (oklch).
        lime: {
          DEFAULT: 'oklch(0.841 0.238 128.85)', // primary surface
          deep: 'oklch(0.405 0.101 131.063)', // text on lime
          ring: 'oklch(0.79 0.2 128.85)', // border on lime
          soft: 'oklch(0.96 0.07 128)', // tinted fill
          text: 'oklch(0.48 0.12 131)', // eyebrow/labels (AA on white)
        },
        // Neutral ink ramp (warm-neutral grays from the design).
        ink: {
          DEFAULT: 'oklch(0.205 0 0)',
          900: 'oklch(0.145 0 0)', // dark sections
          800: 'oklch(0.22 0 0)',
          700: 'oklch(0.3 0 0)',
          600: 'oklch(0.4 0 0)',
          500: 'oklch(0.46 0 0)',
          400: 'oklch(0.5 0 0)',
          300: 'oklch(0.55 0 0)',
          200: 'oklch(0.6 0 0)',
        },
        // Hairlines.
        line: {
          DEFAULT: 'oklch(0.92 0 0)',
          soft: 'oklch(0.94 0 0)',
          strong: 'oklch(0.9 0 0)',
        },
        // Surfaces.
        surface: {
          DEFAULT: 'oklch(1 0 0)',
          sunken: 'oklch(0.985 0 0)',
          raised: 'oklch(0.99 0 0)',
        },
        // Network brand dots.
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
        card: '0 24px 60px -28px oklch(0.2 0 0 / 0.35), 0 4px 14px -8px oklch(0.2 0 0 / 0.14)',
        panel: '0 24px 60px -36px oklch(0.2 0 0 / 0.3)',
      },
      maxWidth: {
        site: '1180px',
      },
    },
  },
  plugins: [],
};
