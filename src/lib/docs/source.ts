import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { loader, type LoaderOutput } from 'fumadocs-core/source';
import { structure } from 'fumadocs-core/mdx-plugins';
import type { Root, Node, Item, Folder } from 'fumadocs-core/page-tree';
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

  // Every directory that contains content (including ancestors).
  const dirs = new Set<string>(['']);
  for (const e of entries) {
    let d = dirOf(e.id);
    while (d) {
      dirs.add(d);
      d = dirOf(d);
    }
  }

  // Astro's glob loader collapses `foo/index.mdx` to the id `foo` — the same
  // string as the folder it heads. Detect those folder-index entries so we can
  // give fumadocs the `foo/index.mdx` path it expects for a folder's landing
  // page (otherwise a page at `foo` collides with the `foo` folder and one is
  // dropped). The root home (`index`) is not a folder, so it's excluded.
  const isFolderIndex = (id: string) => id !== 'index' && dirs.has(id);

  const pages = entries.map((entry) => ({
    type: 'page' as const,
    path: isFolderIndex(entry.id) ? `${entry.id}/index.mdx` : `${entry.id}.mdx`,
    data: {
      title: entry.data.title,
      description: entry.data.description,
      // Surfaced on search records so results can be filtered by tag.
      tags: entry.data.tags ?? [],
      // Computed lazily — only the search index build pulls structured text.
      structuredData: () =>
        structure(entry.body ?? '', [remarkGfm, remarkMdx, remarkDirective]),
    },
  }));

  // Each page may be preceded by a fumadocs separator (`---Label---`) when its
  // frontmatter declares one, turning it into a sidebar category header.
  const sep = (e?: DocEntry) => (e?.data.separator ? [`---${e.data.separator}---`] : []);
  const orderOf = (e?: DocEntry) => e?.data.order ?? 100;

  const meta = [...dirs].map((dir) => {
    // This dir's own pages, minus any sub-folder landing page (which belongs to
    // that sub-folder and is auto-attached by fumadocs — see isFolderIndex).
    const childPages = entries
      .filter((e) => dirOf(e.id) === dir && !isFolderIndex(e.id))
      .map((e) => ({ name: nameOf(e.id), order: orderOf(e), entry: e }));

    // Immediate sub-folders, each ordered/labelled by its landing-page entry
    // (whose id equals the sub-dir path). Listing the folder here places it in
    // reading order; its label comes from that page's title (e.g. "API").
    const childFolders = [...dirs]
      .filter((d) => d && dirOf(d) === dir)
      .map((d) => {
        const entry = entries.find((e) => e.id === d);
        return { name: nameOf(d), order: orderOf(entry), entry };
      });

    // The root's own index page is listed first; sub-folder landing pages are
    // auto-attached, never listed as siblings.
    const rootIndex = dir === '' ? entries.find((e) => e.id === 'index') : undefined;

    // Pages and sub-folders interleaved by frontmatter `order`, so a folder
    // sits exactly where its landing page's order places it.
    const ordered = [...childPages, ...childFolders]
      .filter((it) => it.name !== 'index')
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

    const items: string[] = [];
    if (rootIndex) items.push(...sep(rootIndex), 'index');
    for (const it of ordered) items.push(...sep(it.entry), it.name);

    return {
      type: 'meta' as const,
      path: `${dir ? dir + '/' : ''}meta.json`,
      data: { pages: items },
    };
  });

  return [...pages, ...meta];
}

/**
 * Present the `api` sub-folder as flat sidebar sections rather than a
 * collapsible accordion:
 *   • its endpoint pages become a flat "API Reference" category — a separator
 *     followed by the pages — in the folder's original position (above
 *     Resources); and
 *   • its landing page (the REST API guide at `/docs/api`) moves up under the
 *     "Integrations" category, beside the MCP server page, labelled "API".
 * Site-specific surgery: the docs have exactly one content sub-folder.
 */
function organizeApiSection(tree: Root): Root {
  const apiUrl = `${DOCS_BASE_URL}/api`;
  const mcpUrl = `${DOCS_BASE_URL}/mcp`;
  const children = [...tree.children];

  const folderIndex = children.findIndex(
    (n) => n.type === 'folder' && n.index?.url === apiUrl
  );
  if (folderIndex === -1) return tree;

  const folder = children[folderIndex] as Folder;
  const guide = folder.index;
  const endpoints = folder.children;

  // Replace the accordion with a flat "API Reference" category.
  const refSeparator = {
    type: 'separator',
    name: 'API Reference',
    $id: `${folder.$id}:ref`,
  } as unknown as Node;
  children.splice(folderIndex, 1, refSeparator, ...endpoints);

  // Move the guide under Integrations (right after the MCP server page).
  if (guide) {
    const mcpIndex = children.findIndex(
      (n) => n.type === 'page' && n.url === mcpUrl
    );
    const at = mcpIndex === -1 ? folderIndex : mcpIndex + 1;
    children.splice(at, 0, { ...guide, name: 'API' });
  }

  return { ...tree, children };
}

let cached: LoaderOutput<any> | undefined;

/** fumadocs loader output: page tree, page lookup, and URL generation. The
 *  page tree is post-processed so the API docs render as flat categories
 *  (see {@link organizeApiSection}). */
export async function getDocsSource() {
  if (!cached) {
    const source = loader({
      baseUrl: DOCS_BASE_URL,
      source: { files: await buildFiles() },
    });
    const rawGetPageTree = source.getPageTree.bind(source);
    let tree: Root | undefined;
    source.getPageTree = (() =>
      (tree ??= organizeApiSection(rawGetPageTree()))) as typeof source.getPageTree;
    cached = source;
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

// ── Page-tree navigation helpers ─────────────────────────────────────────

/** Flatten the page tree into reading order (folder index page, then its
 *  children), skipping separators. Drives previous/next navigation. */
export function flattenTree(tree: Root): Item[] {
  const out: Item[] = [];
  const walk = (nodes: Node[]) => {
    for (const node of nodes) {
      if (node.type === 'folder') {
        if (node.index) out.push(node.index);
        walk(node.children);
      } else if (node.type === 'page') {
        out.push(node);
      }
    }
  };
  walk(tree.children);
  return out;
}

export interface PageNeighbours {
  previous?: Item;
  next?: Item;
}

/** Previous/next pages around `currentUrl` in reading order. */
export function getNeighbours(tree: Root, currentUrl: string): PageNeighbours {
  const pages = flattenTree(tree);
  const i = pages.findIndex((p) => p.url === currentUrl);
  if (i === -1) return {};
  return { previous: pages[i - 1], next: pages[i + 1] };
}

export interface Crumb {
  name: string;
  url?: string;
}

/** Trail of ancestor folders down to the current page, prefixed with a
 *  "Docs" root crumb. The current page is the last, unlinked, crumb. */
export function getBreadcrumbs(tree: Root, currentUrl: string): Crumb[] {
  const trail: Crumb[] = [];
  const find = (nodes: Node[], parents: Folder[]): boolean => {
    for (const node of nodes) {
      if (node.type === 'separator') continue;
      if (node.type === 'folder') {
        if (find(node.children, [...parents, node])) return true;
        if (node.index?.url === currentUrl) {
          push(parents, node);
          return true;
        }
      } else if (node.url === currentUrl) {
        push(parents, undefined, node);
        return true;
      }
    }
    return false;
  };
  const push = (parents: Folder[], folder?: Folder, page?: Item) => {
    for (const p of parents) {
      trail.push({ name: String(p.name), url: p.index?.url });
    }
    if (folder) trail.push({ name: String(folder.name) });
    if (page) trail.push({ name: String(page.name) });
  };

  find(tree.children, []);

  const root: Crumb = { name: 'Docs', url: DOCS_BASE_URL };
  // The docs home is the root itself — no need to repeat it as a child crumb.
  if (currentUrl === DOCS_BASE_URL) return [{ name: 'Docs' }];
  return [root, ...trail];
}

/** Non-hidden docs in reading order, each with its computed route path. */
export async function getOrderedDocs(): Promise<
  { entry: DocEntry; path: string }[]
> {
  const entries = (await getCollection('docs')).filter((e) => !e.data.hidden);
  return entries.sort(byOrder).map((entry) => {
    const slug = entryToSlug(entry.id);
    return { entry, path: slug ? `${DOCS_BASE_URL}/${slug}` : DOCS_BASE_URL };
  });
}

// ── Tags ─────────────────────────────────────────────────────────────────

/** Distinct tags across all (non-hidden) docs, sorted. Powers search filters. */
export async function getAllTags(): Promise<string[]> {
  const entries = (await getCollection('docs')).filter((e) => !e.data.hidden);
  const set = new Set<string>();
  for (const e of entries) for (const t of e.data.tags ?? []) set.add(t);
  return [...set].sort();
}

// ── Last modified (git) ────────────────────────────────────────────────────

const CONTENT_DIR = join(process.cwd(), 'src', 'content', 'docs');
const lastModifiedCache = new Map<string, string | null>();

/** ISO timestamp of the last git commit that touched a doc, or null when git
 *  is unavailable (e.g. a shallow CI checkout or fresh working copy). */
export function getLastModified(entryId: string): string | null {
  if (lastModifiedCache.has(entryId)) return lastModifiedCache.get(entryId)!;

  let iso: string | null = null;
  const file =
    [`${entryId}.mdx`, `${entryId}.md`].find((f) =>
      existsSync(join(CONTENT_DIR, f))
    ) ?? null;
  if (file) {
    try {
      const out = execFileSync(
        'git',
        ['log', '-1', '--format=%cI', '--', file],
        { cwd: CONTENT_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      ).trim();
      iso = out || null;
    } catch {
      iso = null;
    }
  }
  lastModifiedCache.set(entryId, iso);
  return iso;
}
