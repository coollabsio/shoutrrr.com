/**
 * Progressive enhancements for rendered docs content. Everything here is
 * idempotent and degrades gracefully without JS — markup is usable on its own.
 */

function enhanceCodeBlocks() {
  const blocks = document.querySelectorAll<HTMLPreElement>('.docs-prose pre');
  blocks.forEach((pre) => {
    if (pre.dataset.copyReady) return;
    pre.dataset.copyReady = 'true';

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    pre.replaceWith(wrapper);
    wrapper.appendChild(pre);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy';
    btn.setAttribute('aria-label', 'Copy code');
    btn.innerHTML = COPY_ICON;
    wrapper.appendChild(btn);

    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.textContent ?? pre.textContent ?? '';
      try {
        await navigator.clipboard.writeText(code);
        btn.innerHTML = CHECK_ICON;
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = COPY_ICON;
          btn.classList.remove('copied');
        }, 1600);
      } catch {
        /* clipboard unavailable — no-op */
      }
    });
  });
}

const COPY_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const CHECK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

function enhanceImageZoom() {
  const imgs = document.querySelectorAll<HTMLImageElement>('.docs-prose img');
  imgs.forEach((img) => {
    if (img.dataset.zoomReady) return;
    img.dataset.zoomReady = 'true';
    img.classList.add('zoomable');
    img.addEventListener('click', () => openZoom(img));
  });
}

function openZoom(img: HTMLImageElement) {
  const overlay = document.createElement('div');
  overlay.className = 'zoom-overlay';
  const big = document.createElement('img');
  big.src = img.currentSrc || img.src;
  big.alt = img.alt;
  overlay.appendChild(big);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => overlay.classList.add('open'));

  const close = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => overlay.remove(), 200);
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
}

function enhanceTabs() {
  const groups = document.querySelectorAll<HTMLElement>('[data-tabs]');
  groups.forEach((root) => {
    if (root.dataset.tabsReady) return;
    root.dataset.tabsReady = 'true';

    const triggers = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[data-tab-trigger]')
    );
    const panels = Array.from(
      root.querySelectorAll<HTMLElement>('[data-tab-panel]')
    );
    const group = root.dataset.group;

    const activate = (index: number) => {
      triggers.forEach((t, i) =>
        t.setAttribute('aria-selected', String(i === index))
      );
      panels.forEach((p, i) => {
        p.style.display = i === index ? 'block' : 'none';
      });
    };

    triggers.forEach((trigger, index) => {
      trigger.addEventListener('click', () => {
        activate(index);
        if (group) {
          const value = trigger.dataset.value ?? '';
          try {
            localStorage.setItem(`docs-tabs:${group}`, value);
          } catch {
            /* storage blocked — selection still works for this view */
          }
          syncGroup(group, value, root);
        }
      });
    });

    // Restore a previously chosen value for this tab group.
    if (group) {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(`docs-tabs:${group}`);
      } catch {
        stored = null;
      }
      const i = stored
        ? triggers.findIndex((t) => t.dataset.value === stored)
        : -1;
      if (i >= 0) activate(i);
    }
  });
}

/** Switch every tab group with the same name to the chosen label. */
function syncGroup(group: string, value: string, origin: HTMLElement) {
  document
    .querySelectorAll<HTMLElement>(`[data-tabs][data-group="${group}"]`)
    .forEach((root) => {
      if (root === origin) return;
      const triggers = Array.from(
        root.querySelectorAll<HTMLButtonElement>('[data-tab-trigger]')
      );
      const panels = Array.from(
        root.querySelectorAll<HTMLElement>('[data-tab-panel]')
      );
      const i = triggers.findIndex((t) => t.dataset.value === value);
      if (i < 0) return;
      triggers.forEach((t, idx) =>
        t.setAttribute('aria-selected', String(idx === i))
      );
      panels.forEach((p, idx) => {
        p.style.display = idx === i ? 'block' : 'none';
      });
    });
}

function enhanceBanners() {
  document
    .querySelectorAll<HTMLElement>('[data-banner-id]')
    .forEach((banner) => {
      const id = banner.dataset.bannerId!;
      let dismissed = false;
      try {
        dismissed = localStorage.getItem(`docs-banner:${id}`) === '1';
      } catch {
        dismissed = false;
      }
      if (dismissed) {
        banner.remove();
        return;
      }
      banner
        .querySelector('[data-banner-close]')
        ?.addEventListener('click', () => {
          try {
            localStorage.setItem(`docs-banner:${id}`, '1');
          } catch {
            /* ignore */
          }
          banner.remove();
        });
    });
}

function run() {
  enhanceCodeBlocks();
  enhanceImageZoom();
  enhanceTabs();
  enhanceBanners();
}

run();
// Astro view transitions: re-run after swaps.
document.addEventListener('astro:after-swap', run);
