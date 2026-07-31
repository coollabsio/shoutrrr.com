# Marketing site improvement plan — shoutrrr.com

Lens: Emil (design-eng craft) · Apple (fluid motion + materials + type) · find-animation-opportunities (gated) · frontend-design (distinctiveness).

Baseline is strong: token system, dark mode, motion.dev choreography, signature composer autoplay demo, good reduced-motion. This is polish, not a rebuild.

## Verdict
The interface is already close to right and slightly *under*-animated in a few high-value spots (FAQ, feature grid) while being correctly restrained everywhere else. Highest-leverage single fix: **size-aware display tracking** (Apple type) — it touches every heading on the site. Do NOT add more ambient motion; the aura + composer already carry the "alive" feeling.

---

## STATUS: Tier 1 + Tier 2 IMPLEMENTED (build ✓ / tests ✓). Tier 3 not started.
Files touched: `src/styles/global.css`, `src/scripts/motion-init.ts`, `src/pages/index.astro`, `src/components/Navigation.astro`.
Note: visual browser check was blocked (Chrome extension not connected) — verified via build + generated-CSS inspection instead. Recommend a manual light/dark + reduced-motion pass.

## TIER 1 — high leverage, low risk

- [ ] **T1. Size-aware display tracking (Apple §15).** `global.css .font-display` hardcodes `letter-spacing:-0.02em` for ALL display sizes (66px hero → 21px pillar titles). -0.02em is right for the hero, too tight for 21px. Add tracking that loosens as size drops.
  - Add utility classes or per-size overrides: hero/CTA (48px+) `-0.022em`; section h2 (30–46px) `-0.015em`; card titles (21px) `-0.005em`.
- [ ] **T2. `:active` press feedback on primary CTAs (Emil "buttons must feel responsive").** Hero "Get started"/"Self-host", nav "Get started", pricing + CTA buttons have hover brightness + `data-hover-lift` but NO `:active` scale. Composer publish already does `active:scale-[0.985]` — match it.
  - Add `active:scale-[0.98]` + `transition-transform` (~140ms ease-out) to all CTA/link-buttons. Gate is fine — feedback purpose, <160ms.
- [ ] **T3. FAQ accordion height animation (Emil / find-anim: teleporting state).** `index.astro` FAQ uses native `<details>` — chevron rotates 200ms but the panel **snaps** open. Animate height+opacity.
  - JS-light: wrap panel, transition `grid-template-rows 0fr→1fr` + opacity (same trick the mobile menu already uses), 220ms ease-out. Reduced-motion: instant.
- [ ] **T4. Feature grid stagger (find-anim: group entrance).** 9 feature cells share ONE `data-reveal` and pop as a block. Occasional-view section → eligible for 30–80ms stagger.
  - Give each cell `data-reveal` + `data-reveal-delay` stepped 0.04s (cap ~0.28s). Purpose: prevents flat simultaneous pop.

## TIER 2 — refinement, medium effort

- [ ] **T5. Scroll-edge nav border (Apple §12 "scroll edge effects, not hard dividers").** Navbar has a permanent `border-b`. Make the border/shadow fade in only once the page is scrolled (IntersectionObserver sentinel or scroll listener toggling a class). Keeps the translucent bar feeling like a floating material at the top.
- [ ] **T6. Stronger interaction easing token (Emil §3).** Motion uses `easeOut=[0.22,0.61,0.36,1]` — fine for reveals, weak for snappy interactions. Introduce a second curve `--ease-out-strong: cubic-bezier(0.23,1,0.32,1)` for press/hover/accordion so those feel punchier than the ambient reveals. Keep reveal curve as-is.
- [ ] **T7. Reveal tuning (Emil "review next day" / perceived speed).** Reveal is `translateY(18px)`, 700ms. 18px+700ms reads slightly heavy on fast scroll. Trial 12px / 550ms. Verify in slow-mo before committing (subjective — screenshot pass).
- [ ] **T8. Theme-toggle transition (Apple §14 "ease dark↔light changes").** Theme flip is instant/abrupt. Add a short, opt-out-under-reduced-motion cross-fade on `color`/`background` (e.g. `transition: background-color 200ms, color 200ms` on a scoped set), OR a View Transition on the toggle. Keep subtle — don't animate every element.

## TIER 3 — structure/content (beyond motion; conversion)

- [ ] **T9. Real social proof.** Site has zero real proof (the engagement inbox is illustrative). Add a live GitHub-stars badge on the trust strip / near hero, and if available 1–3 real testimonials or "self-hosted by" logos. Biggest conversion gap, purely additive.
- [ ] **T10. Comparison section.** Hero claims "open-source alternative to Buffer, Typefully, Hootsuite" but there's no comparison. A compact feature/price comparison (esp. per-seat pricing angle) would pay off — but only with truthful data.

## REJECTED (find-animation-opportunities Part 2 — deliberately NOT animating)
- Nav link hovers / desktop menu — tens+/day, color transition already enough. No motion.
- Theme toggle icon morph beyond a simple swap — low-frequency but risks gimmick; T8 covers the *page* transition, not a fancy icon animation.
- Composer autoplay — already the signature; leave it. Adding more would dilute it.
- Trust-strip network chips — static is correct; animating them is decoration on a scannable row.
- Aura blobs — already drift; increasing motion here fights the content.
- Showcase tab panel — already has a 350ms enter fade; correct, don't add spring.

## Cross-cutting guardrails
- Only animate `transform`/`opacity`. Keep every UI interaction <300ms; marketing/explanatory may run longer.
- Every new animation ships with `prefers-reduced-motion` handling (gentler, not zero) and hover gated behind `@media (hover:hover) and (pointer:fine)`.
- Distinctiveness (frontend-design): palette leans toward the "serif display + single bright accent" AI-default cluster but is saved by lime (not terracotta) + the editorial italic + the composer signature. Don't add a second loud accent; spend boldness on the composer. Optional: a small secondary signature (e.g. a monospace "publishes independently" ledger motif) if we want more identity — evaluate, don't assume.

## How to verify
- `bun dev` (astro), walk hero → FAQ in light + dark, throttle scroll, DevTools slow-mo on reveals/accordion.
- Toggle `prefers-reduced-motion` — confirm all new motion drops to fade/instant.
- Keyboard-only pass: focus rings intact on new `:active` buttons; accordion operable via keyboard.
- Screenshot before/after at 1280 + 390 widths.
