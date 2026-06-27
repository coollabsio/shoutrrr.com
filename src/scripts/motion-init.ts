/**
 * Motion choreography for the marketing site, powered by motion.dev.
 *
 * Three jobs:
 *  1. Scroll-reveal anything tagged `data-reveal` (with optional per-item delay
 *     for staggered groups).
 *  2. Drift the ambient aura blobs tagged `data-aura-anim`.
 *  3. Lift cards/buttons tagged `data-hover` on pointer enter.
 *
 * All motion is suppressed under `prefers-reduced-motion` — the resting states
 * in global.css already leave content fully visible without JS or motion.
 */
import { animate, hover, inView } from 'motion';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const easeOut = [0.22, 0.61, 0.36, 1] as const;

function reveals() {
  inView(
    '[data-reveal]',
    (el) => {
      const target = el as HTMLElement;
      const delay = parseFloat(target.dataset.revealDelay ?? '0');
      animate(
        target,
        { opacity: [0, 1], transform: ['translateY(18px)', 'translateY(0px)'] },
        { duration: 0.7, delay, ease: easeOut },
      );
    },
    { amount: 0.2, margin: '0px 0px -10% 0px' },
  );
}

type AuraKind = 'a' | 'b' | 'spin';

// Each blob drifts on its own slow, organic path — independent x/y/scale plus a
// gentle opacity "breathe" — rather than one transform string, which Motion
// interpolates far more smoothly. The 'spin' blob rotates instead. Every track
// returns to its first frame so the infinite loop is seamless.
const auraTracks: Record<
  AuraKind,
  { keyframes: Record<string, number[]>; duration: number; ease: 'easeInOut' | 'linear' }
> = {
  a: {
    keyframes: {
      x: [0, 38, -14, 0],
      y: [0, -28, 16, 0],
      scale: [1, 1.16, 0.95, 1],
      opacity: [1, 0.8, 0.92, 1],
    },
    duration: 16,
    ease: 'easeInOut',
  },
  b: {
    keyframes: {
      x: [0, -46, 18, 0],
      y: [0, 34, -20, 0],
      scale: [1.08, 0.9, 1.14, 1.08],
      opacity: [1, 0.72, 0.9, 1],
    },
    duration: 21,
    ease: 'easeInOut',
  },
  spin: {
    keyframes: {
      rotate: [0, 360],
      scale: [1, 1.12, 1],
    },
    duration: 30,
    ease: 'linear',
  },
};

function auras() {
  document.querySelectorAll<HTMLElement>('[data-aura-anim]').forEach((el, i) => {
    const kind = (el.dataset.auraAnim as AuraKind) ?? 'a';
    const track = auraTracks[kind] ?? auraTracks.a;
    animate(el, track.keyframes, {
      // Nudge each blob's duration so the two aura instances drift out of phase
      // rather than looping in lockstep.
      duration: track.duration * (1 + i * 0.04),
      ease: track.ease,
      repeat: Infinity,
    });
  });
}

function hovers() {
  hover('[data-hover]', (el) => {
    const target = el as HTMLElement;
    const lift = parseFloat(target.dataset.hoverLift ?? '-4');
    animate(target, { transform: `translateY(${lift}px)` }, { duration: 0.22, ease: easeOut });
    return () => {
      animate(target, { transform: 'translateY(0px)' }, { duration: 0.3, ease: easeOut });
    };
  });
}

// Everything here is motion. Under prefers-reduced-motion we run none of it —
// the reduced-motion rules in global.css already reveal [data-reveal] content
// without JS, so nothing stays hidden.
if (!reduce) {
  reveals();
  auras();
  hovers();
}
