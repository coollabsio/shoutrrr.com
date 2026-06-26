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

const auraTracks: Record<AuraKind, { keyframes: Record<string, string[]>; duration: number; ease: string }> = {
  a: {
    keyframes: { transform: ['translate(0px,0px) scale(1)', 'translate(40px,-30px) scale(1.15)', 'translate(0px,0px) scale(1)'] },
    duration: 14,
    ease: 'ease-in-out',
  },
  b: {
    keyframes: { transform: ['translate(0px,0px) scale(1.1)', 'translate(-50px,40px) scale(0.9)', 'translate(0px,0px) scale(1.1)'] },
    duration: 18,
    ease: 'ease-in-out',
  },
  spin: {
    keyframes: { transform: ['rotate(0deg)', 'rotate(360deg)'] },
    duration: 32,
    ease: 'linear',
  },
};

function auras() {
  document.querySelectorAll<HTMLElement>('[data-aura-anim]').forEach((el) => {
    const kind = (el.dataset.auraAnim as AuraKind) ?? 'a';
    const track = auraTracks[kind] ?? auraTracks.a;
    animate(el, track.keyframes, {
      duration: track.duration,
      repeat: Infinity,
      ease: track.ease,
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
