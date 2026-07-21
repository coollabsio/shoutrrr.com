import type { APIRoute } from 'astro';
import { getOrderedDocs } from '../lib/docs/source';

export const prerender = true;

const INTRO =
  'Shoutrrr is the open-source alternative to Buffer, Typefully, and Hootsuite. ' +
  'Draft once and post everywhere — schedule to X, Bluesky, and LinkedIn. ' +
  'Self-host it free, or use the managed Cloud.';

const CONTEXT =
  'This file indexes the Shoutrrr website and documentation for LLMs. ' +
  'Marketing pages are linked as HTML; every documentation page is also ' +
  'available as clean Markdown at the same path with a `.md` extension.';

const GITHUB = 'https://github.com/coollabsio/shoutrrr';

// Key non-docs pages of the marketing site. These are HTML routes (no Markdown
// twin), so they're linked as-is.
const PAGES = [
  {
    title: 'Home',
    path: '/',
    description:
      'Product overview: self-host or Cloud, multi-account publishing, queue & calendar, and analytics.',
  },
  {
    title: 'Philosophy',
    path: '/philosophy',
    description:
      'Our approach to open source: free, no paywalled features, Apache 2.0, and community-supported.',
  },
  {
    title: 'Sponsor us',
    path: '/sponsorships',
    description:
      'Shoutrrr and coolLabs are self-funded — support the project via GitHub Sponsors or Open Collective.',
  },
];

// llms.txt — a curated index of the whole site for LLMs.
// Spec: https://llmstxt.org
export const GET: APIRoute = async ({ site }) => {
  const origin = site?.origin ?? 'https://shoutrrr.com';
  const docs = await getOrderedDocs();

  const lines = [
    '# Shoutrrr',
    '',
    `> ${INTRO}`,
    '',
    CONTEXT,
    '',
    '## Pages',
    '',
    ...PAGES.map(
      (p) => `- [${p.title}](${origin}${p.path}): ${p.description}`
    ),
    '',
    '## Docs',
    '',
    ...docs.map(({ entry }) => {
      const desc = entry.data.description ? `: ${entry.data.description}` : '';
      return `- [${entry.data.title}](${origin}/docs/${entry.id}.md)${desc}`;
    }),
    '',
    '## Optional',
    '',
    `- [Full documentation](${origin}/llms-full.txt): Every documentation page concatenated into one Markdown file.`,
    `- [Source code](${GITHUB}): The Shoutrrr repository on GitHub.`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
