import type { APIRoute } from 'astro';
import { createSearchAPI } from 'fumadocs-core/search/server';
import { getDocsSource, getBreadcrumbs } from '../../lib/docs/source';
import { apiSearchRecords } from '../../lib/api/search-records.js';

// Prerendered static Orama index, consumed client-side by DocsSearch.svelte.
export const prerender = true;

export const GET: APIRoute = async () => {
  const source = await getDocsSource();
  const tree = source.getPageTree();

  // Index each doc page's tags so the client can filter results by tag.
  const docIndexes = source.getPages().map((page) => {
    // structuredData is lazy (see source.ts) — resolve it for the index.
    const sd = page.data.structuredData;
    return {
      id: page.url,
      url: page.url,
      title: page.data.title,
      description: page.data.description,
      structuredData: typeof sd === 'function' ? sd() : sd,
      tag: page.data.tags,
      breadcrumbs: getBreadcrumbs(tree, page.url).map((c) => c.name),
    };
  });

  // Add one lightweight record per API operation so endpoints are searchable
  // and deep-link into their tag page. Each is inserted into the *same* Orama
  // db as doc pages (not appended after serialization) so it is a real,
  // full-text-searchable document — not just an inert JSON entry.
  const apiIndexes = apiSearchRecords().map((rec) => ({
    id: rec.id,
    url: rec.url,
    title: rec.title,
    description: rec.description,
    structuredData: { headings: [], contents: [] },
    tag: rec.tag,
    breadcrumbs: ['API', rec.tag[1]],
  }));

  const server = createSearchAPI('advanced', {
    indexes: [...docIndexes, ...apiIndexes],
    language: 'english',
  });

  return server.staticGET();
};
