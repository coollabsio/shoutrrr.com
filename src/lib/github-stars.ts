import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SHOUTRRR_REPO } from './docs/github-releases';

/**
 * Build-time GitHub star-count fetcher for the nav's compact GitHub link.
 *
 * Mirrors the changelog fetcher: one request per build (memoized in-process so
 * all pages share a single fetch), an on-disk cache to keep HMR reloads instant
 * and stay under GitHub's unauthenticated 60 req/hr limit, and a stale-cache
 * fallback so a GitHub blip never fails a build. The site is static, so the
 * count refreshes on redeploy. Set GITHUB_TOKEN to raise the rate limit.
 */

const CACHE_DIR = join(process.cwd(), '.cache');
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour
const cachePath = join(CACHE_DIR, 'github-stars.json');

interface StarsCache {
  fetchedAt: number;
  repo: string;
  stars: number;
}

function readCache(): StarsCache | null {
  if (!existsSync(cachePath)) return null;
  try {
    return JSON.parse(readFileSync(cachePath, 'utf8')) as StarsCache;
  } catch {
    return null;
  }
}

function writeCache(stars: number): void {
  try {
    mkdirSync(CACHE_DIR, { recursive: true });
    const payload: StarsCache = {
      fetchedAt: Date.now(),
      repo: SHOUTRRR_REPO,
      stars,
    };
    writeFileSync(cachePath, JSON.stringify(payload));
  } catch {
    // A non-writable cache dir shouldn't break the build; we just refetch.
  }
}

async function fetchStars(ttlMs: number): Promise<number | null> {
  const cached = readCache();
  if (
    cached &&
    cached.repo === SHOUTRRR_REPO &&
    Date.now() - cached.fetchedAt < ttlMs
  ) {
    return cached.stars;
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'shoutrrr.com-nav',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`https://api.github.com/repos/${SHOUTRRR_REPO}`, {
      headers,
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText}`);
    const data = (await res.json()) as { stargazers_count?: number };
    if (typeof data.stargazers_count !== 'number') {
      throw new Error('response missing stargazers_count');
    }
    writeCache(data.stargazers_count);
    return data.stargazers_count;
  } catch (err) {
    // Network error or rate limit: serve stale cache if we have any.
    if (cached) {
      console.warn(
        `[nav] GitHub stars fetch failed (${String(err)}); using cached count.`
      );
      return cached.stars;
    }
    console.warn(
      `[nav] GitHub stars fetch failed (${String(err)}); no cache available.`
    );
    return null;
  }
}

let memo: Promise<number | null> | undefined;

/**
 * Star count for the Shoutrrr repo, memoized for the whole build so every page
 * that renders the nav shares one fetch. Resolves to `null` when unavailable.
 */
export function getStarCount({
  ttlMs = DEFAULT_TTL_MS,
}: { ttlMs?: number } = {}): Promise<number | null> {
  if (!memo) memo = fetchStars(ttlMs);
  return memo;
}

/** Compact star count for the badge, e.g. 1234 → "1.2k", 12345 → "12k". */
export function formatStarCount(n: number): string {
  if (n >= 10000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}
