import type { APIRoute } from 'astro';

// Canonical /sitemap.xml — the path crawlers and people expect by default.
//
// @astrojs/sitemap emits the URL list as `sitemap-0.xml` plus its own
// `sitemap-index.xml`, but it can't be renamed to `sitemap.xml`. So we serve a
// sitemap *index* here that points at the integration's generated URL file,
// keeping @astrojs/sitemap as the single source of truth for the actual URLs
// (marketing + docs) — this file never needs touching when pages change.
//
// entryLimit defaults to 45,000 URLs per file, so a single `sitemap-0.xml`
// covers this site for the foreseeable future; revisit if we ever split.
export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://shoutrrr.com');
  const loc = new URL('sitemap-0.xml', base).href;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<sitemap><loc>${loc}</loc></sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
