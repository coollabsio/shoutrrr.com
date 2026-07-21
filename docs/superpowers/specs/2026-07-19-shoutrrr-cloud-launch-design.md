# Shoutrrr Cloud launch — marketing site design

**Date:** 2026-07-19
**Branch:** `shoutrrr-cloud-launch-website`
**Status:** Approved, ready for implementation plan

## Goal

Shoutrrr Cloud is now live at `https://app.shoutrrr.com`. The marketing site
currently says "Cloud coming soon" everywhere. Update the site to a **Cloud-first**
posture — Cloud is the primary call to action — while keeping self-hosting a
fully first-class, clearly-presented option (the "your data, your rules" ethos
stays intact).

## Positioning decisions (settled)

- **Cloud-first.** Primary CTA across the site is **"Get started"** → `app.shoutrrr.com`.
  Self-host is the prominent secondary path.
- **Paid product, no free tier.** Cloud is **$10/mo**, which **includes $5 of X
  (Twitter) API usage**. Self-host is **free forever** (Apache 2.0).
- **Prices appear in ONE place only** — a dedicated Pricing section. No prices in
  the hero, nav, badges, ticks, feature copy, or section headlines.
- **CTA copy is price-free and neutral**: "Get started" (not "Start free" — there
  is no free tier). Secondary: "Self-host" / "Deploy with Docker".

### Copy nuance to confirm during review (non-blocking)

The pricing line is written as **"$10/mo — includes $5 of X (Twitter) API usage."**
Two details can be reworded in review without changing structure:
- Whether the $5 is *included within* the $10 or billed *on top* (spec assumes included).
- Whether $10/mo is flat or per-workspace/seat (spec assumes flat, per account).

## Shared constants

Add alongside the existing `GITHUB` constant wherever CTAs are rendered:

```js
const CLOUD = 'https://app.shoutrrr.com';
```

`GITHUB = 'https://github.com/coollabsio/shoutrrr'` stays unchanged.

## Changes by file

### 1. `src/components/Navigation.astro`

- Replace the `Deploy it` button (currently `href="/#get"`) with **"Get started"**
  → `CLOUD` (keep the lime primary-button styling).
- Add a ghost **"Log in"** text link → `CLOUD` (the app now exists). Desktop:
  place it before the GitHub link; on small screens it may hide like the GitHub
  link does (`hidden sm:inline-flex`) to keep the bar uncluttered.
- Add a **"Pricing"** entry to the `links` array → `/#pricing` (shows in desktop
  nav and mobile menu, like other links).
- Mobile menu action buttons: mirror desktop — replace `Deploy it` with
  **"Get started"** → `CLOUD`; the GitHub button stays.

### 2. `src/pages/index.astro` — Hero

- **Badge:** `Managed Cloud coming soon` → **"Shoutrrr Cloud is live"**, wrapped in
  an `<a href={CLOUD}>` (keep the `Cloud` icon + pill styling). Keep it subtle.
- **H1:** unchanged ("Draft once. Post everywhere. On your own terms.").
- **Subhead:** rewrite to lead with Cloud, no price:
  *"Start on managed Shoutrrr Cloud, or self-host the open-source app — the same
  product, your choice. Write once and fan it out to X, Bluesky, and LinkedIn, or
  queue it on a recurring schedule."*
- **Buttons:** primary **"Get started →"** → `CLOUD`; secondary **"Self-host"** →
  `#pricing` (lands on the two-card section where the Docker CTA lives). Keep the
  tertiary **"See the product"** → `#showcase` text/secondary link.
- **Trust ticks:** price-free — **"Set up in seconds"** and
  **"Self-host anytime, no lock-in."** (keep the lime `Check` icons).

### 3. `src/pages/index.astro` — New Pricing section

Insert a new `<section id="pricing">` **after the value pillars** (`#selfhost`)
and before the interactive showcase. Reuse existing design-system tokens
(lime band like `#showcase`/`bg-surface-sunken` or a lime-soft tint, `data-reveal`,
Fraunces display headings, rounded-2xl bordered cards).

Structure:

- Section eyebrow + heading, e.g. eyebrow **"Cloud or self-host"**, heading
  **"Two ways to run Shoutrrr"**, short subhead: *"Same app, same features. Let us
  run it, or run it yourself."*
- Two equal cards, side by side (stack on mobile):
  - **Shoutrrr Cloud** — price **"$10/mo"**, sub-line *"includes $5 of X (Twitter)
    API usage"*. Bullets: managed & always up to date · we run the infrastructure ·
    set up in seconds · cancel anytime. Primary button **"Get started →"** → `CLOUD`.
    Optionally visually emphasized (lime ring / "Recommended" tag) since Cloud-first.
  - **Self-host** — price **"Free forever"**, sub-line *"Apache 2.0, open source"*.
    Bullets: your infrastructure · your data · no per-seat pricing · one Docker
    image. Secondary button **"Deploy with Docker →"** → `GITHUB` (and/or the
    `docker pull` hint).
- Shared closing line under the cards: *"Same app, same features — your choice."*

### 4. `src/pages/index.astro` — Copy flips

- **Value pillar #1** ("Self-host or Cloud"): body currently
  "…or use our fully managed Cloud when it lands." →
  "…or start in seconds on our managed Cloud — the same app, your choice."
- **Feature "Fast & flexible"**: body currently
  "…with a fully managed Cloud option coming soon." →
  "…self-host it on your own infrastructure, or run it on our managed Cloud. No
  lock-in either way."
- **`#get` CTA section:** flip to Cloud-first.
  - Subhead: lead with Cloud, no price, e.g. *"Get started on managed Cloud in
    seconds — or spin up your own instance, free and open source."*
  - Buttons: primary **"Get started →"** → `CLOUD`; secondary
    **"Deploy with Docker →"** → `GITHUB`.
  - Keep the `docker pull ghcr.io/coollabsio/shoutrrr:latest` mono line as a
    self-host detail.
  - Replace the "…managed Cloud coming soon" footnote with a self-host-oriented
    note or remove it (Cloud is now primary above).
- **FAQ** (`faqs` array): rewrite the three answers that say "coming soon":
  - "Is Shoutrrr really free?" → *self-host is free forever under Apache 2.0;
    managed Cloud is $10/mo (includes $5 of X usage) for teams who'd rather not
    run it themselves.*
  - "Do I have to self-host?" → *No — Shoutrrr Cloud is live; self-hosting stays
    free and open source if you prefer.*
  - "How do I install it?" → keep the Docker instructions; change the trailing
    "managed Cloud is coming soon" → "or skip setup entirely with Shoutrrr Cloud."
  - **Add** one FAQ: *"Cloud or self-host — which should I pick?"* — brief guidance
    (Cloud = zero ops, $10/mo; self-host = full control, free), pointing to
    `#pricing`.

### 5. `src/components/Footer.astro`

- **Tagline** (top-left blurb): drop "coming soon" →
  *"The open-source social scheduler. Draft once, post everywhere, keep your data.
  Self-host it, or start on managed Shoutrrr Cloud."*
- Add **"Shoutrrr Cloud"** (→ `CLOUD`) and **"Log in"** (→ `CLOUD`) links, and a
  **"Pricing"** (→ `/#pricing`) link. Place naturally in the existing columns
  (e.g. Cloud + Pricing in Product, Log in near the top or Resources).
- Bottom strip "Open source · Self-host or Cloud" stays.

### 6. `src/content/docs/getting-started.mdx`

- Add one short callout near the top: *"Prefer not to run it yourself? Shoutrrr
  Cloud is a fully managed option at $10/mo — [app.shoutrrr.com](https://app.shoutrrr.com)."*
  Use the existing docs callout syntax (remark-callout / directive) already in use.

## Out of scope

- No `/pricing` or `/cloud` standalone page (pricing lives in the homepage section).
- No auth, signup, or app work — all CTAs simply link to `app.shoutrrr.com`; the
  app handles login/signup/billing.
- No changes to the Security section, Showcase, or Composer mockup.
- No new pricing tiers or numbers beyond the single $10/mo Cloud plan.

## Design system / consistency

Reuse existing tokens and patterns — lime oklch primary, `bg-lime`/`lime-ring`/
`lime-soft`, Fraunces/Newsreader display via `font-display`, Noto Sans body,
`data-reveal` scroll animations, `data-hover`/`data-hover-lift` on interactive
cards/buttons, `max-w-site` containers, Lucide icons + `BrandIcon`. The new
Pricing section should feel native to the page, not bolted on.

## Testing / verification

- `bun run build` (or `npm run build`) succeeds with no Astro/TS errors.
- Every new/updated CTA resolves: `app.shoutrrr.com` for Cloud/Log in/Get started;
  `#pricing` anchor scrolls to the new section; Docker/GitHub links unchanged.
- No remaining "coming soon" Cloud references anywhere (grep the repo).
- `$10/mo` and `$5` appear **only** inside the Pricing section (and the docs
  callout) — grep to confirm no price leaked into hero/nav/ticks.
- Visual pass at mobile + desktop breakpoints: nav "Get started"/"Log in"/"Pricing",
  hero, pricing cards stack correctly, footer links present.
