import type { APIRoute } from 'astro';
import { createFromSource } from 'fumadocs-core/search/server';
import { getDocsSource } from '../../lib/docs/source';

// Prerendered static Orama index, consumed client-side by DocsSearch.svelte.
export const prerender = true;

export const GET: APIRoute = async () => {
  const source = await getDocsSource();
  const server = createFromSource(source, { language: 'english' });
  return server.staticGET();
};
