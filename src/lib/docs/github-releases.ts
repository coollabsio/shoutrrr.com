import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

/**
 * Build-time GitHub Releases fetcher with an on-disk cache.
 *
 * The site is static (SSG), so releases are pulled once per build and baked
 * into the changelog page — a redeploy is what refreshes them. The disk cache
 * exists to (a) keep dev HMR reloads instant, (b) avoid GitHub's unauthenticated
 * rate limit (60 req/hr) across repeated builds, and (c) fall back to the last
 * good response if the API is unreachable so a GitHub blip never fails a build.
 *
 * Set GITHUB_TOKEN in the build environment to raise the rate limit to 5000/hr.
 */

const CACHE_DIR = join(process.cwd(), '.cache');
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

/** The repository whose releases power the docs changelog. */
export const SHOUTRRR_REPO = 'coollabsio/shoutrrr';

export interface Release {
  /** Git tag, e.g. "v0.8.0". */
  tag: string;
  /** Release title (falls back to the tag when GitHub has no name). */
  name: string;
  /** URL to the release on GitHub. */
  url: string;
  /** ISO 8601 publish timestamp, or null for drafts. */
  publishedAt: string | null;
  isPrerelease: boolean;
  /** Release notes rendered from Markdown to sanitized HTML. */
  bodyHtml: string;
}

interface RawRelease {
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string | null;
  prerelease: boolean;
  draft: boolean;
  body: string | null;
}

interface CacheFile {
  fetchedAt: number;
  data: RawRelease[];
}

const cachePath = (repo: string) =>
  join(CACHE_DIR, `github-releases-${repo.replace('/', '__')}.json`);

function readCache(repo: string): CacheFile | null {
  const file = cachePath(repo);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as CacheFile;
  } catch {
    return null;
  }
}

function writeCache(repo: string, data: RawRelease[]): void {
  try {
    mkdirSync(CACHE_DIR, { recursive: true });
    const payload: CacheFile = { fetchedAt: Date.now(), data };
    writeFileSync(cachePath(repo), JSON.stringify(payload));
  } catch {
    // A non-writable cache dir shouldn't break the build; we just refetch.
  }
}

/** Fetch raw releases for `repo`, using the disk cache when it's still fresh. */
async function fetchRaw(repo: string, ttlMs: number): Promise<RawRelease[]> {
  const cached = readCache(repo);
  if (cached && Date.now() - cached.fetchedAt < ttlMs) {
    return cached.data;
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'shoutrrr.com-changelog',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/releases?per_page=100`,
      { headers }
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText}`);
    const data = (await res.json()) as RawRelease[];
    writeCache(repo, data);
    return data;
  } catch (err) {
    // Network error or rate limit: serve stale cache if we have any.
    if (cached) {
      console.warn(
        `[changelog] GitHub fetch failed (${String(err)}); using cached releases.`
      );
      return cached.data;
    }
    console.warn(
      `[changelog] GitHub fetch failed (${String(err)}); no cache available.`
    );
    return [];
  }
}

const markdown = unified()
  .use(remarkParse)
  .use(remarkGfm)
  // No `allowDangerousHtml`: raw HTML in release notes is escaped to text, not
  // executed — this is our sanitization. Standard Markdown + GFM still render.
  .use(remarkRehype)
  .use(rehypeStringify);

async function renderNotes(body: string | null): Promise<string> {
  if (!body || !body.trim()) return '';
  const file = await markdown.process(body);
  return String(file);
}

/**
 * Published releases for `repo`, newest first, with notes rendered to HTML.
 * Drafts are dropped. Safe to call at build time from an Astro component.
 */
export async function getReleases(
  repo: string,
  { ttlMs = DEFAULT_TTL_MS }: { ttlMs?: number } = {}
): Promise<Release[]> {
  const raw = await fetchRaw(repo, ttlMs);
  const published = raw.filter((r) => !r.draft);

  const releases = await Promise.all(
    published.map(async (r) => ({
      tag: r.tag_name,
      name: r.name?.trim() || r.tag_name,
      url: r.html_url,
      publishedAt: r.published_at,
      isPrerelease: r.prerelease,
      bodyHtml: await renderNotes(r.body),
    }))
  );

  return releases.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });
}

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

/**
 * Same releases as {@link getReleases}, but as a plain-Markdown document —
 * used by the `.md` and `llms.txt` endpoints where the changelog page's MDX
 * source (a component import) would otherwise be meaningless.
 */
export async function getReleasesMarkdown(
  repo: string,
  { ttlMs = DEFAULT_TTL_MS }: { ttlMs?: number } = {}
): Promise<string> {
  const raw = await fetchRaw(repo, ttlMs);
  const published = raw
    .filter((r) => !r.draft)
    .sort((a, b) => {
      const ta = a.published_at ? Date.parse(a.published_at) : 0;
      const tb = b.published_at ? Date.parse(b.published_at) : 0;
      return tb - ta;
    });

  if (published.length === 0) {
    return `See releases at https://github.com/${repo}/releases.`;
  }

  return published
    .map((r) => {
      const name = r.name?.trim() || r.tag_name;
      const date = fmtDate(r.published_at);
      const heading = date ? `## ${name} — ${date}` : `## ${name}`;
      const tag = r.prerelease ? `${r.tag_name} (pre-release)` : r.tag_name;
      const body = r.body?.trim() || '_No release notes._';
      return `${heading}\n\n${tag} · ${r.html_url}\n\n${body}`;
    })
    .join('\n\n---\n\n');
}
