// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import remarkDirective from 'remark-directive';
import remarkCallout from './src/lib/docs/remark-callout.mjs';

export default defineConfig({
  site: 'https://shoutrrr.com',
  integrations: [tailwind(), svelte(), mdx(), sitemap()],
  // Docs MDX runs through fumadocs' remark plugins; Astro keeps its built-in
  // Shiki highlighter so code blocks match the rest of the marketing site.
  markdown: {
    remarkPlugins: [remarkDirective, remarkCallout],
    shikiConfig: {
      // Dual themes: Shiki bakes light colors inline and dark colors as
      // `--shiki-dark*` custom properties; global.css activates them under
      // `html.dark` (see the .astro-code dark rule).
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: false,
    },
  },
  server: {
    host: '0.0.0.0',
  },
});
