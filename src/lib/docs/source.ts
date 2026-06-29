import { getCollection, type CollectionEntry } from 'astro:content';
import { loader, type LoaderOutput } from 'fumadocs-core/source';
import { structure } from 'fumadocs-core/mdx-plugins';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkDirective from 'remark-directive';

export const DOCS_BASE_URL = '/docs';

type DocEntry = CollectionEntry<'docs'>;

const dirOf = (id: string) => {
  const i = id.lastIndexOf('/');
  return i === -1 ? '' : id.slice(0, i);
};
const nameOf = (id: string) => {
  const i = id.lastIndexOf('/');
  return i === -1 ? id : id.slice(i + 1);
};

const byOrder = (a: DocEntry, b: DocEntry) =>
  (a.data.order ?? 100) - (b.data.order ?? 100) ||
  a.data.title.localeCompare(b.data.title);

/**
 * Convert the Astro `docs` collection into fumadocs virtual files.
 *
 * Pages come straight from the collection. We also synthesise one `meta.json`
 * per folder so the sidebar order is driven by each page's frontmatter `order`
 * field — authors never have to hand-write meta files.
 */
async function buildFiles() {
  const entries = (await getCollection('docs')).filter((e) => !e.data.hidden);

  const pages = entries.map((entry) => ({
    type: 'page' as const,
    path: `${entry.id}.mdx`,
    data: {
      title: entry.data.title,
      description: entry.data.description,
      // Computed lazily — only the search index build pulls structured text.
      structuredData: () =>
        structure(entry.body ?? '', [remarkGfm, remarkMdx, remarkDirective]),
    },
  }));

  // Every directory that contains content (including ancestors).
  const dirs = new Set<string>(['']);
  for (const e of entries) {
    let d = dirOf(e.id);
    while (d) {
      dirs.add(d);
      d = dirOf(d);
    }
  }

  const meta = [...dirs].map((dir) => {
    const childPages = entries.filter((e) => dirOf(e.id) === dir).sort(byOrder);
    const childFolders = [...dirs]
      .filter((d) => d && dirOf(d) === dir)
      .map(nameOf)
      .sort();

    const ordered = childPages.map((e) => nameOf(e.id));
    const hasIndex = ordered.includes('index');

    return {
      type: 'meta' as const,
      path: `${dir ? dir + '/' : ''}meta.json`,
      data: {
        // index first, then sub-folders, then the order-sorted pages.
        pages: [
          ...(hasIndex ? ['index'] : []),
          ...childFolders,
          ...ordered.filter((p) => p !== 'index'),
        ],
      },
    };
  });

  return [...pages, ...meta];
}

let cached: LoaderOutput<any> | undefined;

/** fumadocs loader output: page tree, page lookup, and URL generation. */
export async function getDocsSource() {
  if (!cached) {
    cached = loader({
      baseUrl: DOCS_BASE_URL,
      source: { files: await buildFiles() },
    });
  }
  return cached;
}

/** Map a collection entry id to its route slug param (`index` -> home). */
export function entryToSlug(id: string): string | undefined {
  if (id === 'index') return undefined;
  if (id.endsWith('/index')) return id.slice(0, -'/index'.length);
  return id;
}

/** Inverse of {@link entryToSlug}: route slug -> collection entry id. */
export function slugToEntryId(slug: string | undefined): string {
  return slug && slug.length > 0 ? slug : 'index';
}
