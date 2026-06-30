// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import remarkDirective from 'remark-directive';
import remarkCallout from './src/lib/docs/remark-callout.mjs';
import rehypeHeadingAnchors from './src/lib/docs/rehype-heading-anchors.mjs';

export default defineConfig({
  site: 'https://shoutrrr.com',
  integrations: [tailwind(), svelte(), mdx(), sitemap()],
  // Docs MDX runs through fumadocs' remark plugins; Astro keeps its built-in
  // Shiki highlighter so code blocks match the rest of the marketing site.
  markdown: {
    remarkPlugins: [remarkDirective, remarkCallout],
    rehypePlugins: [rehypeHeadingAnchors],
    shikiConfig: {
      theme: 'github-light',
      wrap: false,
    },
  },
  server: {
    host: '0.0.0.0',
  },
});
