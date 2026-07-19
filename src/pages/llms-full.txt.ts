import type { APIRoute } from 'astro';
import { getOrderedDocs } from '../lib/docs/source';
import { getReleasesMarkdown, SHOUTRRR_REPO } from '../lib/docs/github-releases';

export const prerender = true;

// llms-full.txt — the entire documentation inlined as one Markdown document.
export const GET: APIRoute = async () => {
  const docs = await getOrderedDocs();

  const sections = await Promise.all(
    docs.map(async ({ entry }) => {
      const desc = entry.data.description
        ? `> ${entry.data.description}\n\n`
        : '';
      // The changelog's MDX source is a component import; emit generated Markdown.
      const source =
        entry.id === 'changelog'
          ? await getReleasesMarkdown(SHOUTRRR_REPO)
          : entry.body?.trim() ?? '';
      return `# ${entry.data.title}\n\n${desc}${source}`;
    })
  );

  const body = ['# Shoutrrr Documentation', ...sections].join('\n\n---\n\n');

  return new Response(body + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
