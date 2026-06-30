import type { APIRoute } from 'astro';
import { getOrderedDocs } from '../lib/docs/source';

export const prerender = true;

// llms-full.txt — the entire documentation inlined as one Markdown document.
export const GET: APIRoute = async () => {
  const docs = await getOrderedDocs();

  const sections = docs.map(({ entry }) => {
    const desc = entry.data.description ? `> ${entry.data.description}\n\n` : '';
    return `# ${entry.data.title}\n\n${desc}${entry.body?.trim() ?? ''}`;
  });

  const body = ['# Shoutrrr Documentation', '', ...sections].join('\n\n---\n\n');

  return new Response(body + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
