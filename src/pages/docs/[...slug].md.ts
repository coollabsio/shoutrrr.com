import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { getReleasesMarkdown, SHOUTRRR_REPO } from '../../lib/docs/github-releases';

export const prerender = true;

// Raw Markdown source for each doc, served at /docs/<id>.md — the clean,
// chrome-free version LLMs and "copy as markdown" tooling can consume.
// Keyed by entry id (so the home page is /docs/index.md, unambiguously).
export async function getStaticPaths() {
  const entries = await getCollection('docs');
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as { entry: CollectionEntry<'docs'> };
  const desc = entry.data.description ? `> ${entry.data.description}\n\n` : '';
  // The changelog's MDX source is a component import; emit generated Markdown.
  const source =
    entry.id === 'changelog'
      ? await getReleasesMarkdown(SHOUTRRR_REPO)
      : entry.body?.trim() ?? '';
  const body = `# ${entry.data.title}\n\n${desc}${source}\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
