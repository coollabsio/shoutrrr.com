# Dark mode for shoutrrr.com — design

**Date:** 2026-07-24
**Status:** Approved (design), pending implementation plan

## Summary

Add a dark theme to the whole shoutrrr.com marketing site (marketing pages +
`/docs`). Selection is **manual toggle only**: default light, user-flipped,
persisted to `localStorage`. OS `prefers-color-scheme` is intentionally ignored.
Palette is **soft charcoal** with a vibrant lime accent.

## Decisions (locked)

| Question | Decision |
|----------|----------|
| Theme selection | Manual toggle only. Default light. Persisted in `localStorage`. OS preference ignored. |
| Scope | Whole site: marketing pages (home, philosophy, sponsorships) **and** `/docs` (sidebar, TOC, prose, search). |
| Palette character | Soft charcoal background (`oklch ~0.205`), not near-black. Vibrant lime accent. |
| Intentionally-dark sections | Today's `bg-ink-900/800` blocks become subtly *raised charcoal panels* in dark mode. |

## Current state (why this approach)

- Colors are **hardcoded oklch literals** in `tailwind.config.cjs` — nothing can
  flip today.
- ~391 color-utility usages across 14 files; **zero** `dark:` variants exist.
- `global.css` sets `color-scheme: light` on `:root` and holds raw-oklch literals
  in `.docs-prose` (code blocks, callouts, links, borders).
- `Layout.astro` head has an inline `<script>` that adds the `.js` class before
  first paint — the natural spot for a no-flash theme init.

## Architecture

### Token architecture (core)

Make the **semantic** tokens variable-driven instead of literal:

1. In `global.css`, define CSS variables under `:root` (light) and `html.dark`
   (dark) for the semantic tokens:
   - `--background`, `--foreground`
   - `--surface`, `--surface-sunken`, `--surface-raised`
   - `--line`, `--line-soft`, `--line-strong`
   - muted text ramp: `--ink-200` … `--ink-700` (secondary/tertiary text)
   - lime family: `--lime`, `--lime-deep`, `--lime-ring`, `--lime-soft`, `--lime-text`
2. In `tailwind.config.cjs`, point those tokens at `var(--token)` instead of
   literals. Set `darkMode: 'class'`.
3. **Result:** the ~80% bulk (`bg-surface`, `text-ink`, `border-line`, etc.) flips
   automatically with no component edits — no sea of `dark:` variants.

### Hand-tuned edge cases

These do **not** auto-flip cleanly and need explicit handling:

- **`bg-ink-900` / `bg-ink-800` dark sections** — deliberately dark blocks on
  today's light page. In dark mode they must become subtly *raised charcoal
  panels* (a token distinct from the page background) so they still read as a
  separate surface. Audit each `bg-ink-*` usage during implementation.
- **Aura gradient blobs** (`Aura.astro`) — softer, lower-opacity glows in dark so
  they don't blow out against charcoal.
- **Shadows** (`boxShadow.card`, `boxShadow.panel`) — deeper / higher-contrast in
  dark, or reduced in favor of borders since shadows read weakly on dark.
- **`.docs-prose` raw literals** in `global.css` — code blocks, inline code,
  callouts/admonitions, blockquotes, table headers, hairlines, link colors all
  use literal oklch. Add `html.dark .docs-prose …` overrides (or convert to the
  new vars where a token already fits).

### Dark palette (soft charcoal)

- **Background** warm-neutral charcoal `oklch(~0.205 0 0)`; **raised surface** a
  touch lighter (`~0.24`); **sunken** slightly darker.
- **Hairlines** low-contrast light-on-dark (`~0.30–0.34`).
- **Foreground** near-white (`~0.95`); muted ramp for secondary text.
- **Lime accent** nudged slightly brighter / less saturated to stay vibrant
  without glare; **text-on-lime** stays the deep lime-ink so buttons keep their
  look.
- `color-scheme: dark` on `html.dark` so native controls/scrollbars match.

### Toggle UX

- Sun/moon toggle button in the **nav** (`Navigation.astro`), Lucide icons,
  styled to match existing nav buttons. Accessible label + `aria-pressed`.
- **No-flash init:** extend the existing inline `<head>` script to read
  `localStorage.theme` and add `html.dark` **before first paint**.
- On click: toggle `html.dark`, persist `localStorage.theme` (`'dark'`/`'light'`),
  swap the icon, and update `<meta name="theme-color">` so mobile browser chrome
  matches.
- Default = light when nothing is stored.

## Testing

- Toggle on each page (home, philosophy, sponsorships, a docs page) — colors flip
  coherently, no orphaned light-on-light or dark-on-dark elements.
- Hard-reload while in dark mode — **no white flash** before paint.
- Contrast check: lime buttons, raised charcoal panels (ex-`ink-900`), docs code
  blocks, callouts, and secondary text remain legible (aim WCAG AA for body text).
- Aura blobs and shadows look intentional in dark, not blown-out or invisible.
- Mobile browser chrome (`theme-color`) matches the active theme.

## Out of scope

- Following OS `prefers-color-scheme`.
- Per-page or time-based automatic switching.
- Redesigning layouts — this is a theming change only.
