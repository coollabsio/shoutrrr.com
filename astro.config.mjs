// @ts-check
import { copyFileSync, existsSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import remarkDirective from 'remark-directive';
import remarkCallout from './src/lib/docs/remark-callout.mjs';
import rehypeHeadingAnchors from './src/lib/docs/rehype-heading-anchors.mjs';

/**
 * Serve @astrojs/sitemap's generated index at the canonical /sitemap.xml.
 *
 * The integration emits `sitemap-index.xml` — which already enumerates every
 * `sitemap-<n>.xml` shard — but can't be named `sitemap.xml` itself. We copy
 * that index verbatim, so /sitemap.xml always reflects all shards no matter how
 * many the entryLimit produces. Registered after sitemap() so its build:done
 * (which writes the index) runs first; fails the build if the index is missing.
 */
function canonicalSitemap() {
  return {
    name: 'canonical-sitemap',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const index = new URL('sitemap-index.xml', dir);
        if (!existsSync(index)) {
          throw new Error(
            'Expected @astrojs/sitemap to emit sitemap-index.xml, but it was ' +
              'not found — the canonical /sitemap.xml cannot be generated.',
          );
        }
        copyFileSync(index, new URL('sitemap.xml', dir));
        logger.info('Copied sitemap-index.xml → sitemap.xml');
      },
    },
  };
}

export default defineConfig({
  site: 'https://shoutrrr.com',
  integrations: [tailwind(), svelte(), mdx(), sitemap(), canonicalSitemap()],
  // Docs MDX runs through fumadocs' remark plugins; Astro keeps its built-in
  // Shiki highlighter so code blocks match the rest of the marketing site.
  markdown: {
    remarkPlugins: [remarkDirective, remarkCallout],
    rehypePlugins: [rehypeHeadingAnchors],
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
