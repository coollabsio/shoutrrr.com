import type { APIRoute } from 'astro';
import { getOrderedDocs } from '../lib/docs/source';

export const prerender = true;

const INTRO =
  'Shoutrrr is the open-source alternative to Buffer, Typefully, and Hootsuite. ' +
  'Draft once and post everywhere — schedule to X, Bluesky, and LinkedIn. ' +
  'Self-host it free, or use the managed Cloud.';

// llms.txt — a curated index of the documentation for LLMs.
// Spec: https://llmstxt.org
export const GET: APIRoute = async ({ site }) => {
  const origin = site?.origin ?? 'https://shoutrrr.com';
  const docs = await getOrderedDocs();

  const lines = [
    '# Shoutrrr',
    '',
    `> ${INTRO}`,
    '',
    '## Docs',
    '',
    ...docs.map(({ entry }) => {
      const desc = entry.data.description ? `: ${entry.data.description}` : '';
      return `- [${entry.data.title}](${origin}/docs/${entry.id}.md)${desc}`;
    }),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
