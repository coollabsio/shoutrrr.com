import type { APIRoute } from 'astro';
import { createFromSource } from 'fumadocs-core/search/server';
import { getDocsSource } from '../../lib/docs/source';

// Prerendered static Orama index, consumed client-side by DocsSearch.svelte.
export const prerender = true;

export const GET: APIRoute = async () => {
  const source = await getDocsSource();
  const server = createFromSource(source, {
    language: 'english',
    // Index each page's tags so the client can filter results by tag.
    buildIndex(page) {
      // structuredData is lazy (see source.ts) — resolve it for the index.
      const sd = page.data.structuredData;
      return {
        title: page.data.title,
        description: page.data.description,
        url: page.url,
        id: page.url,
        structuredData: typeof sd === 'function' ? sd() : sd,
        tag: page.data.tags,
      };
    },
  });
  return server.staticGET();
};
