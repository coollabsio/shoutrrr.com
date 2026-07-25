# Shoutrrr Cloud Launch — Marketing Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the shoutrrr.com marketing site from "Cloud coming soon" to a Cloud-first posture — Shoutrrr Cloud is live at `app.shoutrrr.com` — while keeping self-hosting a first-class, clearly-presented option.

**Architecture:** Pure content/markup edits to an Astro 5 static marketing site. No JS logic, no data model, no new dependencies. Changes touch four files plus one new homepage section. All Cloud CTAs link to `https://app.shoutrrr.com`; the app handles signup/login/billing. Prices appear in exactly one dedicated Pricing section (plus one docs callout).

**Tech Stack:** Astro 5, Tailwind CSS 3, Lucide icons (`lucide-astro`), custom `BrandIcon` component, `data-reveal`/`data-hover` motion attributes, Fraunces/Newsreader display font via `font-display`.

**Reference spec:** `docs/superpowers/specs/2026-07-19-shoutrrr-cloud-launch-design.md`

## Global Constraints

- Cloud URL is exactly `https://app.shoutrrr.com` — used for "Get started", "Log in", and all Cloud CTAs.
- Primary CTA copy is **"Get started"** — never "Start free" (there is no free tier).
- Prices (`$10/mo`, `$5`) appear **ONLY** in the new Pricing section on the homepage and in the one docs callout. Never in nav, hero, badges, ticks, feature copy, or section headings.
- Cloud pricing line reads: **"$10/mo"** with sub-line **"includes $5 of X (Twitter) API usage"**.
- Self-host pricing reads: **"Free forever"** / Apache 2.0.
- Reuse existing design tokens only (lime oklch, `bg-lime`, `lime-ring`, `lime-soft`, `font-display`, `data-reveal`, `data-hover`, `max-w-site`). No new colors, fonts, or dependencies.
- No `/pricing` or `/cloud` standalone page. No auth/app work. No changes to Security section, Showcase, or Composer mockup.
- There is no unit-test harness for Astro pages/markup. Verification for every task = `astro build` succeeds + targeted `grep` assertions. The build command is `npx astro build` (project uses Astro's CLI; `bun run build` or `npm run build` also work).

---

## File Structure

- **Modify** `src/components/Navigation.astro` — add `CLOUD` const, "Pricing" link, "Get started" button, "Log in" link (desktop + mobile).
- **Modify** `src/pages/index.astro` — add `CLOUD` const; rewrite hero; insert new `#pricing` section; flip copy in value pillar #1, "Fast & flexible" feature, `#get` CTA section, and FAQ.
- **Modify** `src/components/Footer.astro` — add `CLOUD` const, tagline flip, Cloud/Log in/Pricing links.
- **Modify** `src/content/docs/getting-started.mdx` — add one Cloud callout near the top.

---

### Task 1: Navigation — Cloud-first CTAs and Pricing link

**Files:**
- Modify: `src/components/Navigation.astro`

**Interfaces:**
- Produces: nav renders a "Pricing" link to `/#pricing`, a lime "Get started" button to `https://app.shoutrrr.com`, and a "Log in" link to the same, on both desktop and mobile.

- [ ] **Step 1: Add the `CLOUD` constant and the Pricing nav link**

In the frontmatter (`src/components/Navigation.astro:6-16`), add `CLOUD` next to `GITHUB` and add a Pricing entry to `links`. Replace the `links` array and `GITHUB` line so the frontmatter reads:

```astro
const links = [
  { href: '/#features', label: 'Features' },
  { href: '/#showcase', label: 'Product' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#security', label: 'Security' },
  { href: '/docs', label: 'Docs' },
  { href: '/philosophy', label: 'Philosophy' },
  { href: '/sponsorships', label: 'Sponsors' },
  { href: 'https://coollabs.io/discord', label: 'Community' },
  { href: '/#faq', label: 'FAQ' },
];
const GITHUB = 'https://github.com/coollabsio/shoutrrr';
const CLOUD = 'https://app.shoutrrr.com';
```

- [ ] **Step 2: Replace the desktop actions (GitHub / Deploy it) with Log in + Get started**

Replace the desktop "Actions" block. The current GitHub link (`src/components/Navigation.astro:52-56`) and the `Deploy it` button (`:57-61`) become:

```astro
      <a
        href={CLOUD}
        class="hidden items-center gap-1.5 rounded-[9px] px-3 py-2 text-sm font-medium text-ink-700 no-underline transition-colors hover:bg-surface-sunken sm:inline-flex"
        >Log in</a
      >
      <a
        href={GITHUB}
        aria-label="GitHub"
        class="hidden items-center gap-1.5 rounded-[9px] px-3 py-2 text-sm font-medium text-ink-700 no-underline transition-colors hover:bg-surface-sunken sm:inline-flex"
        ><BrandIcon name="github" class="h-[18px] w-[18px]" /></a
      >
      <a
        href={CLOUD}
        class="rounded-[9px] border border-lime-ring bg-lime px-3.5 py-2 text-sm font-semibold text-lime-deep no-underline transition-[filter] hover:brightness-[1.04] sm:px-4"
        >Get started</a
      >
```

(GitHub becomes an icon-only ghost button to make room for "Log in"; the primary CTA is now "Get started" → Cloud.)

- [ ] **Step 3: Update the mobile menu action buttons**

Replace the mobile action grid (`src/components/Navigation.astro:95-106`) so the second button is "Get started" → Cloud:

```astro
        <div class="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-4">
          <a
            href={GITHUB}
            class="inline-flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm font-semibold text-ink-700 no-underline transition-colors hover:bg-surface-sunken"
            ><BrandIcon name="github" class="h-[18px] w-[18px]" /> GitHub</a
          >
          <a
            href={CLOUD}
            class="inline-flex items-center justify-center rounded-xl border border-lime-ring bg-lime px-4 py-3 text-sm font-semibold text-lime-deep no-underline transition-[filter] hover:brightness-[1.04]"
            >Get started</a
          >
        </div>
```

(The mobile menu already renders every `links` entry, so "Pricing" and a "Log in" route via `/#pricing` and the links list; the Cloud "Get started" is the primary action button. "Log in" is reachable on desktop; on mobile the primary Cloud action covers signup, and users can tap "Get started" then log in there.)

- [ ] **Step 4: Build and grep to verify**

Run: `npx astro build`
Expected: build completes with no errors.

Run: `grep -c "app.shoutrrr.com" src/components/Navigation.astro`
Expected: `3` (Log in, Get started desktop, Get started mobile).

Run: `grep -n "Deploy it\|/#get" src/components/Navigation.astro`
Expected: no output (old CTA removed).

- [ ] **Step 5: Commit**

```bash
git add src/components/Navigation.astro
git commit -m "feat(marketing): Cloud-first nav — Get started, Log in, Pricing link"
```

---

### Task 2: Hero — Cloud-first badge, subhead, buttons, ticks

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `CLOUD` constant (added in this task's Step 1; independent of Task 1's copy).
- Produces: hero badge links to Cloud; primary "Get started →" button → Cloud; secondary "Self-host" → `#pricing`; price-free ticks.

- [ ] **Step 1: Add the `CLOUD` constant**

In the frontmatter, next to `const GITHUB = 'https://github.com/coollabsio/shoutrrr';` (`src/pages/index.astro:22`), add:

```astro
const CLOUD = 'https://app.shoutrrr.com';
```

- [ ] **Step 2: Update the hero badge to "Shoutrrr Cloud is live"**

Replace the badge block (`src/pages/index.astro:105-111`) with a linked badge:

```astro
      <a
        href={CLOUD}
        data-reveal
        class="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface-sunken px-3 py-1.5 text-[12.5px] font-medium text-ink-600 no-underline transition-colors hover:border-line-strong"
      >
        <Cloud class="h-4 w-4 text-lime-text" stroke-width={1.8} />
        Shoutrrr Cloud is live →
      </a>
```

- [ ] **Step 3: Rewrite the hero subhead (no price, Cloud-first)**

Replace the paragraph text at `src/pages/index.astro:126-130` (keep the surrounding `<p>` with its `data-reveal`/classes) with:

```
        Shoutrrr is the open-source alternative to Buffer, Typefully, and
        Hootsuite. Start on managed Shoutrrr Cloud, or self-host the open-source
        app — the same product, your choice. Write a post once and fan it out to
        X, Bluesky, and LinkedIn at the same time, or queue it on a recurring
        schedule.
```

- [ ] **Step 4: Replace the hero buttons (Get started / Self-host)**

Replace the two anchor buttons (`src/pages/index.astro:137-150`) with:

```astro
        <a
          href={CLOUD}
          data-hover
          data-hover-lift="-3"
          class="rounded-[11px] border border-lime-ring bg-lime px-[22px] py-[13px] text-center text-[15px] font-semibold text-lime-deep no-underline transition-[filter] hover:brightness-[1.04]"
          >Get started →</a
        >
        <a
          href="#pricing"
          data-hover
          data-hover-lift="-3"
          class="rounded-[11px] border border-line-strong bg-surface px-[22px] py-[13px] text-center text-[15px] font-semibold text-ink-700 no-underline transition-colors hover:bg-surface-sunken"
          >Self-host</a
        >
```

- [ ] **Step 5: Replace the hero trust ticks (price-free)**

Replace the two tick spans (`src/pages/index.astro:157-164`) with:

```astro
        <span class="flex items-center gap-1.5"
          ><Check class="h-4 w-4 text-lime-text" stroke-width={2.5} /> Set up in
          seconds</span
        >
        <span class="flex items-center gap-1.5"
          ><Check class="h-4 w-4 text-lime-text" stroke-width={2.5} /> Self-host
          anytime, no lock-in</span
        >
```

- [ ] **Step 6: Build and grep to verify**

Run: `npx astro build`
Expected: build completes with no errors.

Run: `grep -n "coming soon\|Deploy Shoutrrr\|One-command Docker" src/pages/index.astro | grep -i "hero\|badge" ; grep -c "Shoutrrr Cloud is live" src/pages/index.astro`
Expected: last command prints `1`.

Run: `grep -n '\$10\|\$5' src/pages/index.astro`
Expected: no output yet (prices added only in Task 3).

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(marketing): Cloud-first hero — live badge, Get started CTA, price-free ticks"
```

---

### Task 3: New Pricing section

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `CLOUD` and `GITHUB` constants (already in frontmatter after Task 2).
- Produces: a `<section id="pricing">` reachable from nav `/#pricing` and hero "Self-host" button, containing the two pricing cards. This is the ONLY place `$10`/`$5` appear on the homepage.

- [ ] **Step 1: Insert the Pricing section after the value pillars**

Insert this block immediately after the value pillars `</section>` (which closes at `src/pages/index.astro:221`, the section with `id="selfhost"`) and before the `<!-- ===== INTERACTIVE SHOWCASE ===== -->` comment:

```astro
  <!-- ===== PRICING ===== -->
  <section id="pricing" class="border-y border-line-soft bg-surface-sunken">
    <div class="mx-auto max-w-site px-6 py-24">
      <div data-reveal class="mx-auto mb-11 max-w-[620px] text-center">
        <div
          class="mb-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-lime-text"
        >
          Cloud or self-host
        </div>
        <h2
          class="font-display text-[clamp(30px,4vw,44px)] font-medium leading-[1.08]"
        >
          Two ways to run Shoutrrr
        </h2>
        <p class="mt-3.5 text-base leading-[1.6] text-ink-500">
          Same app, same features. Let us run it for you, or run it yourself —
          the open-source app is free forever.
        </p>
      </div>
      <div class="mx-auto grid max-w-[860px] gap-5 md:grid-cols-2">
        <!-- Cloud card (recommended) -->
        <div
          data-reveal
          data-hover
          class="relative flex flex-col rounded-2xl border border-lime-ring bg-surface p-8"
        >
          <div
            class="absolute right-5 top-5 rounded-full bg-lime-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-lime-deep"
          >
            Recommended
          </div>
          <div class="mb-1 flex items-center gap-2 text-lime-deep">
            <Cloud class="h-5 w-5" stroke-width={1.8} />
            <span class="font-display text-[21px] font-medium">Shoutrrr Cloud</span>
          </div>
          <div class="mt-3 flex items-baseline gap-1.5">
            <span class="font-display text-[40px] font-medium leading-none">$10</span>
            <span class="text-[15px] text-ink-400">/ month</span>
          </div>
          <p class="mt-1.5 text-[13.5px] text-ink-400">
            includes $5 of X (Twitter) API usage
          </p>
          <ul class="mt-6 flex flex-col gap-3 text-[14.5px] text-ink-600">
            <li class="flex items-start gap-2.5">
              <Check class="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-lime-text" stroke-width={2.5} />
              Fully managed and always up to date
            </li>
            <li class="flex items-start gap-2.5">
              <Check class="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-lime-text" stroke-width={2.5} />
              We run the infrastructure — no servers to babysit
            </li>
            <li class="flex items-start gap-2.5">
              <Check class="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-lime-text" stroke-width={2.5} />
              Set up in seconds, cancel anytime
            </li>
          </ul>
          <a
            href={CLOUD}
            data-hover
            data-hover-lift="-3"
            class="mt-8 rounded-[11px] border border-lime-ring bg-lime px-[22px] py-[13px] text-center text-[15px] font-semibold text-lime-deep no-underline transition-[filter] hover:brightness-[1.04]"
            >Get started →</a
          >
        </div>

        <!-- Self-host card -->
        <div
          data-reveal
          data-reveal-delay="0.08"
          data-hover
          class="flex flex-col rounded-2xl border border-line-soft bg-surface p-8"
        >
          <div class="mb-1 flex items-center gap-2 text-ink-700">
            <Server class="h-5 w-5" stroke-width={1.8} />
            <span class="font-display text-[21px] font-medium">Self-host</span>
          </div>
          <div class="mt-3 flex items-baseline gap-1.5">
            <span class="font-display text-[40px] font-medium leading-none">Free</span>
            <span class="text-[15px] text-ink-400">forever</span>
          </div>
          <p class="mt-1.5 text-[13.5px] text-ink-400">
            Apache 2.0, open source
          </p>
          <ul class="mt-6 flex flex-col gap-3 text-[14.5px] text-ink-600">
            <li class="flex items-start gap-2.5">
              <Check class="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-ink-400" stroke-width={2.5} />
              Your infrastructure, your data
            </li>
            <li class="flex items-start gap-2.5">
              <Check class="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-ink-400" stroke-width={2.5} />
              No per-seat pricing, ever
            </li>
            <li class="flex items-start gap-2.5">
              <Check class="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-ink-400" stroke-width={2.5} />
              One Docker image — web, worker, scheduler
            </li>
          </ul>
          <a
            href={GITHUB}
            data-hover
            data-hover-lift="-3"
            class="mt-8 inline-flex items-center justify-center gap-2 rounded-[11px] border border-line-strong bg-surface px-[22px] py-[13px] text-center text-[15px] font-semibold text-ink-700 no-underline transition-colors hover:bg-surface-sunken"
            ><BrandIcon name="docker" class="h-[18px] w-[18px]" /> Deploy with Docker →</a
          >
        </div>
      </div>
      <p data-reveal class="mt-8 text-center text-[13.5px] text-ink-400">
        Same app, same features — your choice.
      </p>
    </div>
  </section>
```

Note: `Cloud`, `Server`, `Check`, and `BrandIcon` are already imported at the top of `index.astro` (lines 3, 16, 19, 20) — no new imports needed.

- [ ] **Step 2: Build and grep to verify**

Run: `npx astro build`
Expected: build completes with no errors.

Run: `grep -c 'id="pricing"' src/pages/index.astro`
Expected: `1`.

Run: `grep -o '\$10\|\$5\|Free' src/pages/index.astro | sort | uniq -c`
Expected: shows `$10` and `$5` each once (both inside the pricing section).

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(marketing): add Cloud vs self-host pricing section"
```

---

### Task 4: Copy flips — pillars, feature, CTA section, FAQ

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `CLOUD`, `GITHUB` constants; `#pricing` section (Task 3).
- Produces: no "coming soon" Cloud copy remains on the homepage; `#get` CTA is Cloud-first.

- [ ] **Step 1: Flip value pillar #1 body**

In the `pillars` array, replace the first pillar's `body` (`src/pages/index.astro:28`):

```
    body: 'Run it on your own box with a single Docker image, or start in seconds on our managed Cloud — the same app, your choice.',
```

- [ ] **Step 2: Flip the "Fast & flexible" feature body**

In the `features` array, replace the "Fast & flexible" `body` (`src/pages/index.astro:51`):

```
  { icon: Zap, title: 'Fast & flexible', body: 'A single, snappy interface — self-host it on your own infrastructure, or run it on our managed Cloud. No lock-in either way.' },
```

- [ ] **Step 3: Rewrite the three "coming soon" FAQ answers and add a Cloud-vs-self-host FAQ**

Replace the affected entries in the `faqs` array (`src/pages/index.astro:73-83`). Replace the "Is Shoutrrr really free?", "Do I have to self-host?", and "How do I install it?" objects, and add a new entry after them, so that region reads:

```js
  {
    q: 'Is Shoutrrr really free?',
    a: 'The open-source app is free forever under Apache 2.0 — self-host it with no paid seats or locked features. Managed Shoutrrr Cloud is $10/mo (which includes $5 of X usage) for teams who would rather not run it themselves.',
  },
  {
    q: 'Do I have to self-host?',
    a: 'No. Shoutrrr Cloud is live — sign up and start posting in seconds. Self-hosting stays free and open source if you would rather run it yourself.',
  },
  {
    q: 'How do I install it?',
    a: 'Self-hosting: pull the prebuilt Docker image — it bundles the web app, queue worker, and scheduler in one container and defaults to SQLite with no external services. Prefer zero setup? Skip it entirely with Shoutrrr Cloud.',
  },
  {
    q: 'Cloud or self-host — which should I pick?',
    a: 'Pick Cloud if you want zero ops: we run and update everything for $10/mo. Pick self-host if you want full control of your infrastructure and data — it is free and open source. Same app either way. See pricing above.',
  },
```

- [ ] **Step 4: Make the `#get` CTA section Cloud-first**

Replace the CTA subhead paragraph (`src/pages/index.astro:340-346`), the two buttons (`:347-363`), and the trailing Cloud footnote (`:369-374`).

Subhead — replace the `<p>` text content with:

```
          Get started on managed Cloud in seconds — or spin up your own
          instance, free and open source. Same app, your choice.
```

Buttons — replace the two anchors so Cloud is primary:

```astro
          <a
            href={CLOUD}
            data-hover
            data-hover-lift="-3"
            class="inline-flex items-center gap-2 rounded-xl border border-lime-ring bg-lime px-[26px] py-3.5 text-[15px] font-semibold text-lime-deep no-underline transition-[filter] hover:brightness-[1.04]"
            ><Cloud class="h-[18px] w-[18px]" stroke-width={1.8} /> Get started →</a
          >
          <a
            href={GITHUB}
            data-hover
            data-hover-lift="-3"
            class="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-surface px-[26px] py-3.5 text-[15px] font-semibold text-ink-700 no-underline transition-colors hover:bg-surface-sunken"
            ><BrandIcon name="docker" class="h-[18px] w-[18px]" /> Deploy with Docker →</a
          >
```

Footnote — replace the "…managed Cloud coming soon" block (`:369-374`) with a self-host-oriented note:

```astro
        <div
          class="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-400"
        >
          <Server class="h-4 w-4 text-lime-text" stroke-width={1.8} /> …or
          self-host free with the command above
        </div>
```

(The `docker pull ghcr.io/coollabsio/shoutrrr:latest` mono line at `:364-368` stays as the self-host detail.)

- [ ] **Step 5: Build and grep to verify no "coming soon" remains**

Run: `npx astro build`
Expected: build completes with no errors.

Run: `grep -in "coming soon" src/pages/index.astro`
Expected: no output.

Run: `grep -c "Shoutrrr Cloud\|managed Cloud" src/pages/index.astro`
Expected: a positive count (Cloud referenced as live in pillars/feature/FAQ/CTA).

- [ ] **Step 6: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat(marketing): flip homepage copy to Cloud-live (pillars, feature, CTA, FAQ)"
```

---

### Task 5: Footer — Cloud, Log in, Pricing links; drop "coming soon"

**Files:**
- Modify: `src/components/Footer.astro`

**Interfaces:**
- Produces: footer tagline no longer says "coming soon"; footer links include Shoutrrr Cloud, Log in, and Pricing.

- [ ] **Step 1: Add `CLOUD` const and update the columns**

In the frontmatter, add the constant after `const GITHUB` (`src/components/Footer.astro:3`):

```astro
const CLOUD = 'https://app.shoutrrr.com';
```

Then update the `cols` array so Product includes Cloud + Pricing and Resources includes Log in. Replace the Product and Resources column objects (`src/components/Footer.astro:10-18` and `:28-36`):

```js
  {
    title: 'Product',
    links: [
      { href: CLOUD, label: 'Shoutrrr Cloud' },
      { href: '/#pricing', label: 'Pricing' },
      { href: '/#features', label: 'Features' },
      { href: '/#showcase', label: 'Composer' },
    ],
  },
```

```js
  {
    title: 'Resources',
    links: [
      { href: CLOUD, label: 'Log in' },
      { href: '/#pricing', label: 'Self-hosting' },
      { href: '/#security', label: 'Security' },
      { href: 'https://coollabs.io/discord', label: 'Community' },
    ],
  },
```

- [ ] **Step 2: Flip the footer tagline**

Replace the tagline paragraph text (`src/components/Footer.astro:50-53`):

```
        The open-source social scheduler. Draft once, post everywhere, keep your
        data. Self-host it free, or start on managed Shoutrrr Cloud.
```

- [ ] **Step 3: Build and grep to verify**

Run: `npx astro build`
Expected: build completes with no errors.

Run: `grep -in "coming soon" src/components/Footer.astro`
Expected: no output.

Run: `grep -c "app.shoutrrr.com" src/components/Footer.astro`
Expected: `3` (const, Cloud link, Log in link).

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat(marketing): footer Cloud/Log in/Pricing links, drop coming-soon"
```

---

### Task 6: Docs — Cloud callout in getting-started

**Files:**
- Modify: `src/content/docs/getting-started.mdx`

**Interfaces:**
- Produces: a `:::tip` callout near the top of the self-hosting guide pointing to Shoutrrr Cloud. This is the only place outside the homepage Pricing section where `$10/mo` appears.

- [ ] **Step 1: Insert the callout after the intro paragraph**

Insert this block immediately after the intro paragraph that ends "...if you need to scale out." (after `src/content/docs/getting-started.mdx:10`, before the ```` ```bash ```` docker pull block at line 12):

```mdx
:::tip
Prefer not to run it yourself? **Shoutrrr Cloud** is a fully managed option at
$10/mo — sign up at [app.shoutrrr.com](https://app.shoutrrr.com).
:::
```

(This uses the same `:::tip` callout directive already used elsewhere in the docs, e.g. `getting-started.mdx:52`.)

- [ ] **Step 2: Build and grep to verify**

Run: `npx astro build`
Expected: build completes with no errors (the docs page renders the callout).

Run: `grep -c "app.shoutrrr.com" src/content/docs/getting-started.mdx`
Expected: `1`.

- [ ] **Step 3: Commit**

```bash
git add src/content/docs/getting-started.mdx
git commit -m "docs: add Shoutrrr Cloud callout to self-hosting guide"
```

---

### Task 7: Final verification sweep

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `npx astro build`
Expected: build completes with no errors or warnings about broken links.

- [ ] **Step 2: Assert no stale "coming soon" Cloud copy anywhere**

Run: `grep -rin "cloud.*coming soon\|coming soon.*cloud\|when it lands" src/`
Expected: no output.

- [ ] **Step 3: Assert prices are confined to Pricing section + docs callout**

Run: `grep -rn '\$10\|\$5' src/ | grep -v "getting-started.mdx"`
Expected: only lines inside the `#pricing` section of `src/pages/index.astro` (the `$10` price, `$5` sub-line). No matches in Navigation, Footer, hero, or elsewhere.

- [ ] **Step 4: Assert Cloud URL wired everywhere expected**

Run: `grep -rc "app.shoutrrr.com" src/components/Navigation.astro src/components/Footer.astro src/pages/index.astro src/content/docs/getting-started.mdx`
Expected: Navigation `3`, Footer `3`, index.astro `≥4` (badge, hero button, pricing card, CTA section), getting-started `1`.

- [ ] **Step 5: Manual visual check (dev server)**

Run: `npx astro dev` and open the site. Confirm:
- Nav shows Pricing, Log in, Get started; mobile menu works.
- Hero badge says "Shoutrrr Cloud is live", "Get started"/"Self-host" buttons work; "Self-host" scrolls to Pricing.
- Pricing section: two cards, Cloud "Recommended" $10/mo, Self-host Free forever; cards stack on mobile.
- `#get` CTA leads with "Get started"; footer has Cloud/Log in/Pricing and no "coming soon".

- [ ] **Step 6: Final commit (if any tweaks made during the sweep)**

```bash
git add -A
git commit -m "chore(marketing): Cloud launch verification tweaks"
```

---

## Self-Review notes

- **Spec coverage:** Nav (Task 1) · Hero badge/subhead/buttons/ticks (Task 2) · Pricing section (Task 3) · pillar/feature/CTA/FAQ flips (Task 4) · Footer (Task 5) · Docs callout (Task 6) · verification incl. price-confinement and no-"coming soon" greps (Tasks 4/5/7). All spec sections mapped.
- **Constants:** `CLOUD = 'https://app.shoutrrr.com'` is added independently in each of Navigation.astro, index.astro, Footer.astro (three separate files — no shared import in this codebase's pattern).
- **Prices:** `$10`/`$5` introduced only in Task 3 (Pricing section) and Task 6 (docs callout); Task 7 Step 3 enforces confinement.
- **CTA copy:** "Get started" used consistently; "Start free" never used.
- **Icons:** all icons used in new markup (`Cloud`, `Server`, `Check`, `BrandIcon`, `Menu`, `X`, `ChevronRight`) are already imported in their respective files.
