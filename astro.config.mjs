// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://shoutrrr.com',
  integrations: [tailwind(), svelte(), sitemap()],
  server: {
    host: '0.0.0.0',
  },
});
