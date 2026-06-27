<script lang="ts">
  /**
   * Hero composer — a faithful, editable miniature of the app's real composer
   * (resources/js/components/compose). Platform tabs with brand tiles + count
   * chips and a severity underline, an editor, a "Single post / N-post thread"
   * char counter, a Media/Override/Auto-split toolbar, and a Save/Publish bar.
   *
   * Limits match the README: X ≤280, Bluesky ≤300 graphemes, LinkedIn ≤3000.
   */
  import { animate } from 'motion';
  import BarChart3 from '@lucide/svelte/icons/bar-chart-3';
  import Check from '@lucide/svelte/icons/check';
  import Heart from '@lucide/svelte/icons/heart';
  import ImageIcon from '@lucide/svelte/icons/image';
  import LoaderCircle from '@lucide/svelte/icons/loader-circle';
  import MessageCircle from '@lucide/svelte/icons/message-circle';
  import Repeat2 from '@lucide/svelte/icons/repeat-2';
  import Send from '@lucide/svelte/icons/send';
  import Shuffle from '@lucide/svelte/icons/shuffle';
  import Split from '@lucide/svelte/icons/split';
  import { onDestroy, onMount } from 'svelte';
  import { getCharCounter } from './char-counter.js';
  import {
    getPlatformText,
    isOverrideActive,
    setPlatformText,
    togglePlatformOverride,
  } from './platform-overrides.js';

  type Account = {
    id: string;
    platform: 'x' | 'linkedin' | 'bluesky';
    handle: string;
    limit: number;
    tile: string; // brand tile classes
  };

  // Monochrome brand marks, identical to the app's PlatformGlyph.
  const GLYPHS = {
    x: '<svg viewBox="0 0 1200 1227" fill="currentColor" width="11" height="11"><path d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"/></svg>',
    linkedin: '<svg viewBox="0 0 256 256" fill="currentColor" width="11" height="11"><path d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453"/></svg>',
    bluesky: '<svg viewBox="0 0 256 226" fill="currentColor" width="11" height="11"><path d="M55.491 15.172c29.35 22.035 60.917 66.712 72.509 90.686 11.592-23.974 43.159-68.651 72.509-90.686C221.686-.727 256-13.028 256 26.116c0 7.818-4.482 65.674-7.111 75.068-9.138 32.654-42.436 40.983-72.057 35.942 51.775 8.812 64.946 38 36.501 67.187-54.021 55.433-77.644-13.908-83.696-31.676-1.11-3.257-1.63-4.78-1.637-3.485-.008-1.296-.527.228-1.637 3.485-6.052 17.768-29.675 87.11-83.696 31.676-28.445-29.187-15.274-58.375 36.5-67.187-29.62 5.041-62.918-3.288-72.056-35.942C4.482 91.79 0 33.934 0 26.116 0-13.028 34.314-.727 55.491 15.172Z"/></svg>',
  };

  const ACCOUNTS: Account[] = [
    { id: 'x', platform: 'x', handle: '@acme', limit: 280, tile: 'border border-line bg-white text-black' },
    { id: 'li', platform: 'linkedin', handle: 'Acme Inc', limit: 3000, tile: 'bg-blue-600 text-white' },
    { id: 'bs', platform: 'bluesky', handle: '@acme.bsky', limit: 300, tile: 'bg-sky-500 text-white' },
  ];

  const CONFETTI_COLORS = [
    '#65a30d',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#bef264',
    '#fde047',
    '#fef08a',
  ];

  const CONFETTI_PIECES = Array.from({ length: 96 }, (_, i) => {
    const lane = i % 24;
    const row = Math.floor(i / 24);
    const x = -330 + lane * 27 + (row % 2) * 13;
    const lift = -125 - ((i * 37) % 125);
    const rotation = -360 + ((i * 71) % 760);
    const delay = (i * 19) % 150;
    const size = 5 + ((i * 7) % 6);
    const start = 74 + ((i * 11) % 13);
    const radius = i % 3 === 0 ? '999px' : '2px';
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];

    return `--x:${x}px; --lift:${lift}px; --r:${rotation}deg; --delay:${delay}ms; --size:${size}px; --start:${start}%; --radius:${radius}; --color:${color};`;
  });

  let active = $state<string>('x');
  let autoSplit = $state(true);
  let draft = $state({
    baseText:
      'Shipped Shoutrrr 1.0 today 🚀 The open-source social scheduler: draft once, then fan it out to X, Bluesky, and LinkedIn at the same time — with a live per-network character count and auto-threading. Self-host it free, or use our managed Cloud soon. No per-seat pricing. Grab it on GitHub and deploy in a minute.',
    overrides: {} as Record<string, boolean>,
    overrideTexts: {} as Record<string, string>,
  });
  let publishStatus = $state<'idle' | 'publishing' | 'published'>('idle');
  let confettiRun = $state(0);
  let showXPreview = $state(false);
  const text = $derived(getPlatformText(draft, active));

  // How the post lands on X — the payoff of the autoplay loop. Engagement is
  // illustrative; the copy is the first beat of the real hero draft.
  const xPost = {
    text: 'Shipped Shoutrrr 1.0 today 🚀 The open-source social scheduler: draft once, then fan it out to X, Bluesky, and LinkedIn at the same time — with a live per-network character count and auto-threading.',
    time: 'now',
    replies: '18',
    reposts: '64',
    likes: '291',
    views: '6.2K',
  };

  const easeOut = [0.22, 0.61, 0.36, 1] as const;
  const easeGlide = [0.6, 0.01, 0.18, 1] as const;

  // Cursor tip sits ~5.5px in from the SVG's top-left at this render size.
  const CURSOR_TIP = 5.5;

  let cardEl: HTMLDivElement;
  let publishBtnEl: HTMLButtonElement;
  let cursorEl: HTMLElement;

  // The autoplay loop is a canned demo; the moment a real user touches the
  // composer we stand down for good and let them drive.
  let userEngaged = false;
  // Bumping this aborts whatever the loop is mid-await on.
  let loopGen = 0;
  let prefersReduced = false;

  type Sev = 'ok' | 'warn' | 'over';
  function textLength(value: string) {
    // Grapheme-ish length so emoji count as one.
    return [...value].length;
  }

  function compute(value: string, limit: number) {
    return getCharCounter({ length: textLength(value), limit, autoSplit }) as {
      sections: number;
      state: Sev;
      countLabel: string;
    };
  }

  const activeAcct = $derived(ACCOUNTS.find((a) => a.id === active)!);
  const len = $derived(textLength(text));
  const activeInfo = $derived(compute(text, activeAcct.limit));
  const override = $derived(isOverrideActive(draft.overrides, active));
  const isPublishing = $derived(publishStatus === 'publishing');
  const isPublished = $derived(publishStatus === 'published');

  const sevUnderline: Record<Sev, string> = {
    ok: 'bg-ink',
    warn: 'bg-amber-500',
    over: 'bg-red-500',
  };
  const sevCount: Record<Sev, string> = {
    ok: 'text-ink',
    warn: 'text-amber-600',
    over: 'text-red-500',
  };

  let manualResetTimer: ReturnType<typeof setTimeout> | undefined;

  function clearPublishTimers() {
    if (manualResetTimer) clearTimeout(manualResetTimer);
  }

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  function resetComposer() {
    clearPublishTimers();
    publishStatus = 'idle';
    showXPreview = false;
  }

  // The shared publish beat: spinner → published + confetti → X preview.
  // `gen` lets the autoplay loop bail out cleanly if the user takes over.
  async function runPublishBeat(gen: number) {
    publishStatus = 'publishing';
    await sleep(680);
    if (gen !== loopGen) return;
    publishStatus = 'published';
    confettiRun += 1; // confetti bursts here — "in between" publish and preview
    await sleep(600); // let the "Published" ✓ land and the confetti reach full spread
    if (gen !== loopGen) return;
    showXPreview = true;
  }

  // Manual click from a real user. Stops the autoplay for good, then runs the
  // same beat and returns to the editable composer.
  function publishNow() {
    if (isPublishing) return;
    pauseAutoplay();
    const gen = ++loopGen;
    resetComposer();
    runPublishBeat(gen).then(() => {
      manualResetTimer = setTimeout(resetComposer, 3400);
    });
  }

  // ── Autoplay choreography ────────────────────────────────────────────
  // A fake cursor drifts in from the card's centre, glides to "Publish now",
  // presses it, and the post lands on X. Then it all resets and replays.

  function cursorHome() {
    const c = cardEl.getBoundingClientRect();
    return { x: c.width / 2 - CURSOR_TIP, y: c.height * 0.46 };
  }

  function publishTarget() {
    const c = cardEl.getBoundingClientRect();
    const b = publishBtnEl.getBoundingClientRect();
    return {
      x: b.left - c.left + b.width / 2 - CURSOR_TIP,
      y: b.top - c.top + b.height / 2 - CURSOR_TIP,
    };
  }

  function pauseAutoplay() {
    if (userEngaged) return;
    userEngaged = true;
    loopGen += 1; // abort the in-flight loop
    if (cursorEl) animate(cursorEl, { opacity: 0 }, { duration: 0.2 });
    resetComposer();
  }

  async function autoplayLoop() {
    const gen = loopGen;
    const home = cursorHome();
    await animate(cursorEl, { x: home.x, y: home.y, opacity: 0, scale: 1 }, { duration: 0 });

    while (gen === loopGen && !userEngaged) {
      resetComposer();

      // drift in
      await animate(cursorEl, { opacity: [0, 1], scale: [0.6, 1] }, { duration: 0.4, ease: easeOut });
      if (gen !== loopGen) break;

      // glide to the Publish button
      const t = publishTarget();
      await animate(cursorEl, { x: t.x, y: t.y }, { duration: 0.95, ease: easeGlide });
      if (gen !== loopGen) break;
      await sleep(180);

      // press
      await animate(cursorEl, { scale: [1, 0.82, 1] }, { duration: 0.28, ease: easeOut });
      if (gen !== loopGen) break;

      // cursor lifts away while the post sends
      animate(cursorEl, { opacity: 0, y: t.y + 16 }, { duration: 0.45, ease: easeOut });

      await runPublishBeat(gen);
      if (gen !== loopGen) break;

      // dwell on the X preview — long enough to take in the tweet
      await sleep(2900);
      if (gen !== loopGen) break;

      // Reset the composer and park the cursor *behind* the preview while it
      // still fully covers the card — so the snap from "Published" back to the
      // editable draft is never seen. Only then fade the preview away to reveal
      // an already-fresh composer.
      publishStatus = 'idle';
      await animate(cursorEl, { x: home.x, y: home.y, opacity: 0, scale: 1 }, { duration: 0 });

      showXPreview = false;
      await sleep(450); // let the preview's 0.45s fade-out complete…
      if (gen !== loopGen) break;
      await sleep(650); // …then breathe before the cursor drifts back in
      if (gen !== loopGen) break;
    }
  }

  onMount(() => {
    prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Start when the composer scrolls into view; never restart once the user
    // has engaged.
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started && !userEngaged) {
            started = true;
            autoplayLoop();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(cardEl);

    // Any genuine interaction (click, tab into the editor) stands the demo down.
    cardEl.addEventListener('pointerdown', pauseAutoplay);
    cardEl.addEventListener('focusin', pauseAutoplay);

    return () => {
      io.disconnect();
      cardEl.removeEventListener('pointerdown', pauseAutoplay);
      cardEl.removeEventListener('focusin', pauseAutoplay);
    };
  });

  onDestroy(() => {
    loopGen += 1;
    clearPublishTimers();
  });

  function toggleOverride() {
    draft = {
      ...draft,
      overrides: togglePlatformOverride(draft.overrides, active),
    };
  }

  function updateText(event: Event) {
    pauseAutoplay();
    draft = setPlatformText(draft, active, (event.currentTarget as HTMLTextAreaElement).value);
  }
</script>

<div
  bind:this={cardEl}
  class="relative z-10 w-full min-w-0 overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-card"
>
  <!-- platform tabs -->
  <div
    class="flex items-end gap-0.5 overflow-x-auto overflow-y-hidden border-b border-line px-3 pt-2"
    role="tablist"
    aria-label="Accounts"
  >
    {#each ACCOUNTS as a (a.id)}
      {@const accountText = getPlatformText(draft, a.id)}
      {@const accountLen = textLength(accountText)}
      {@const info = compute(accountText, a.limit)}
      {@const isActive = a.id === active}
      <button
        type="button"
        role="tab"
        aria-selected={isActive}
        onclick={() => (active = a.id)}
        class="group relative flex shrink-0 items-center gap-1.5 rounded-t-md px-2.5 pb-2.5 pt-2 text-[12px] font-medium tracking-[-0.005em] transition-colors sm:gap-2 sm:px-3 sm:text-[12.5px]"
        class:text-ink={isActive}
        class:text-ink-300={!isActive}
      >
        <span class={`grid size-[18px] place-items-center rounded-[5px] ${a.tile}`}>
          {@html GLYPHS[a.platform]}
        </span>
        <span class="max-w-[84px] truncate sm:max-w-none">{a.handle}</span>
        {#if isOverrideActive(draft.overrides, a.id)}
          <span class="size-1.5 rounded-full bg-lime" title="Override active"></span>
        {/if}
        <span class="font-mono text-[11px] tabular-nums text-ink-300">
          {#if isPublishing}
            <LoaderCircle class="size-3 animate-spin text-ink-300" aria-label="Publishing" />
          {:else if isPublished}
            <Check class="size-3 text-lime-deep" aria-label="Published" />
          {:else}
            {info.sections > 1 ? `${info.sections}×` : accountLen}
          {/if}
        </span>
        <!-- active / severity underline -->
        <span
          class={`pointer-events-none absolute inset-x-2 -bottom-px h-0.5 rounded-t-sm transition-opacity ${sevUnderline[info.state]}`}
          class:opacity-100={isActive}
          class:opacity-0={!isActive}
        ></span>
      </button>
    {/each}
  </div>

  <!-- editor -->
  <div class="px-4 pt-4 sm:px-[26px]">
    <textarea
      value={text}
      oninput={updateText}
      rows="5"
      aria-label="Draft post"
      spellcheck="false"
      class="w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-[1.55] text-ink-800 outline-none focus-visible:outline-none"
    ></textarea>
  </div>

  <!-- char counter -->
  <div
    class="flex min-h-6 items-center justify-between gap-3 px-4 pb-3.5 text-[12px] text-ink-300 sm:px-[26px]"
  >
    <div class="flex min-w-0 items-center gap-2.5">
      {#if activeInfo.sections > 1}
        <span
          class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[oklch(0.96_0_0)] px-2.5 py-0.5 text-[11.5px] font-medium text-ink"
        >
          <span class="size-[5px] rounded-full bg-ink"></span>
          {activeInfo.sections}-post thread
        </span>
      {:else}
        <span class="truncate text-[11.5px]">Single post</span>
      {/if}
    </div>
    <div
      class={`inline-flex shrink-0 items-baseline gap-0.5 font-mono text-[12px] tabular-nums ${activeInfo.state !== 'ok' ? sevCount[activeInfo.state] : ''}`}
    >
      <span class={activeInfo.state === 'ok' ? 'text-ink' : ''}>{len}</span>
      <span class={activeInfo.state === 'over' ? 'text-red-500' : 'text-ink-300'}>/</span>
      <span class={activeInfo.state === 'over' ? 'text-red-500' : 'text-ink-300'}>{activeAcct.limit}</span>
    </div>
  </div>

  <!-- toolbar -->
  <div
    class="flex flex-wrap items-center gap-1.5 border-t border-line bg-surface-sunken px-3 pb-2.5 pt-2 sm:px-[14px]"
  >
    <button
      type="button"
      class="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-transparent px-2.5 text-[12px] text-ink-300 transition-colors hover:border-line hover:bg-surface hover:text-ink sm:h-7"
    >
      <ImageIcon class="size-3.5" />
      <span>Media</span>
      <span
        class="rounded-full bg-ink px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none tabular-nums text-white"
        >1</span
      >
    </button>
    <div class="hidden min-[360px]:ml-auto min-[360px]:block"></div>
    <button
      type="button"
      onclick={toggleOverride}
      data-active={override}
      class="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-transparent px-2.5 text-[12px] text-ink-300 transition-colors hover:border-line hover:bg-surface hover:text-ink data-[active=true]:border-line data-[active=true]:bg-surface data-[active=true]:text-ink sm:h-7"
    >
      <Split class="size-3.5" />
      <span>{override ? 'Override on' : 'Override'}</span>
    </button>
    <button
      type="button"
      onclick={() => (autoSplit = !autoSplit)}
      data-active={autoSplit}
      class="inline-flex h-[34px] items-center gap-1.5 rounded-md border border-transparent px-2.5 text-[12px] text-ink-300 transition-colors hover:border-line hover:bg-surface hover:text-ink data-[active=true]:border-line data-[active=true]:bg-surface data-[active=true]:text-ink sm:h-7"
    >
      <Shuffle class="size-3.5" />
      <span>Auto-split</span>
    </button>
  </div>

  <!-- submit bar -->
  <div
    class="flex flex-wrap items-center justify-end gap-1.5 border-t border-line px-4 py-3"
  >
    <button
      type="button"
      class="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12.5px] font-medium text-ink-700 transition-colors hover:bg-surface-sunken sm:h-8"
      >Save draft</button
    >
    <button
      bind:this={publishBtnEl}
      type="button"
      onclick={publishNow}
      disabled={isPublishing}
      class="relative inline-flex h-9 items-center justify-center gap-1.5 overflow-visible rounded-md border border-lime-ring bg-lime px-3 text-[12.5px] font-medium text-lime-deep shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] transition-[filter,transform] hover:brightness-[1.04] active:scale-[0.985] disabled:cursor-wait disabled:brightness-95 sm:h-8"
      class:published-pop={isPublished}
    >
      {#if isPublishing}
        <LoaderCircle class="size-3.5 animate-spin" />
        <span>Publishing…</span>
      {:else if isPublished}
        <Check class="size-3.5" />
        <span>Published</span>
      {:else}
        <Send class="size-3.5" />
        <span>Publish now</span>
        <kbd
          class="ml-0.5 hidden h-4 items-center rounded border border-lime-deep/25 bg-lime-deep/10 px-1 font-mono text-[10px] font-normal leading-none text-lime-deep/90 sm:inline-flex"
          >⌘↵</kbd
        >
      {/if}
    </button>
  </div>

  <!-- X preview — the payoff: how the draft lands once it's posted -->
  <div
    class="x-preview pointer-events-none absolute inset-0 z-20 flex flex-col bg-surface p-4 sm:p-5"
    class:x-preview--on={showXPreview}
    aria-hidden={!showXPreview}
  >
    <div class="mb-3 flex items-center gap-2 text-[12.5px] font-semibold text-ink-500">
      <span class="grid size-5 place-items-center rounded-full bg-black text-white">
        {@html GLYPHS.x}
      </span>
      <span>Live on X</span>
      <span
        class="ml-auto inline-flex items-center gap-1 rounded-full bg-lime-soft px-2 py-0.5 text-[11px] font-medium text-lime-deep"
      >
        <Check class="size-3" /> Published
      </span>
    </div>

    <div class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-white">
      <div class="flex gap-3 p-4">
        <span class="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-white">
          <img src="/shoutrrr.png" alt="" class="size-8" />
        </span>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1 text-[15px] leading-tight">
            <span class="font-bold text-[#0f1419]">Shoutrrr</span>
            <svg
              class="size-[18px] shrink-0 text-[#1d9bf0]"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"
              />
            </svg>
            <span class="truncate text-[#536471]">@shoutrrr</span>
            <span class="text-[#536471]">·</span>
            <span class="shrink-0 text-[#536471]">{xPost.time}</span>
          </div>
          <p class="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-[1.45] text-[#0f1419]">
            {xPost.text}
          </p>
          <div class="mt-3 flex max-w-[340px] items-center justify-between text-[#536471]">
            <span class="inline-flex items-center gap-1.5 text-[12.5px] tabular-nums">
              <MessageCircle class="size-[15px]" />{xPost.replies}
            </span>
            <span class="inline-flex items-center gap-1.5 text-[12.5px] tabular-nums">
              <Repeat2 class="size-[15px]" />{xPost.reposts}
            </span>
            <span class="inline-flex items-center gap-1.5 text-[12.5px] tabular-nums">
              <Heart class="size-[15px]" />{xPost.likes}
            </span>
            <span class="inline-flex items-center gap-1.5 text-[12.5px] tabular-nums">
              <BarChart3 class="size-[15px]" />{xPost.views}
            </span>
          </div>
        </div>
      </div>
      <p class="mt-auto border-t border-line px-4 py-3 text-[12px] text-ink-300">
        Also delivered to <span class="font-medium text-ink-600">LinkedIn</span> and
        <span class="font-medium text-ink-600">Bluesky</span> · 0 errors.
      </p>
    </div>
  </div>

  {#if confettiRun}
    <div class="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden="true">
      {#each CONFETTI_PIECES as piece, i (`${confettiRun}-${i}`)}
        <span class="confetti" style={piece}></span>
      {/each}
    </div>
  {/if}

  <!-- autoplay cursor: parked off-state until the loop drives it -->
  <span
    bind:this={cursorEl}
    class="pointer-events-none absolute left-0 top-0 z-40 will-change-transform"
    style="opacity:0"
    aria-hidden="true"
  >
    <svg width="22" height="22" viewBox="0 0 24 24" class="drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]">
      <path
        d="M6 6 L6 21 L10.2 16.8 L12.8 22.2 L15.2 21 L12.6 15.8 L18.4 15.8 Z"
        fill="#fff"
        stroke="#111827"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
    </svg>
  </span>
</div>

<style>
  .published-pop {
    animation: published-pop 520ms cubic-bezier(0.2, 1.4, 0.3, 1);
  }

  /* X preview overlay — fades + lifts in, then hides without intercepting
     clicks on the composer underneath. */
  .x-preview {
    opacity: 0;
    transform: scale(0.985) translateY(6px);
    visibility: hidden;
    transition:
      opacity 0.45s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1),
      visibility 0s linear 0.45s;
  }

  .x-preview--on {
    opacity: 1;
    transform: scale(1) translateY(0);
    visibility: visible;
    transition:
      opacity 0.5s cubic-bezier(0.22, 0.61, 0.36, 1),
      transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1),
      visibility 0s;
  }

  .confetti {
    position: absolute;
    left: var(--start);
    bottom: 42px;
    width: var(--size);
    height: calc(var(--size) * 1.45);
    border-radius: var(--radius);
    background: var(--color);
    box-shadow: 0 1px 2px rgb(22 101 52 / 0.18);
    opacity: 0;
    animation: confetti-pop 1250ms cubic-bezier(0.13, 0.7, 0.22, 1) var(--delay) both;
  }

  @keyframes published-pop {
    0%,
    100% {
      transform: scale(1);
    }

    45% {
      transform: scale(1.06);
    }
  }

  @keyframes confetti-pop {
    0% {
      opacity: 0;
      transform: translate3d(0, 0, 0) rotate(0deg) scale(0.7);
    }

    12% {
      opacity: 1;
    }

    48% {
      opacity: 1;
      transform: translate3d(calc(var(--x) * 0.55), var(--lift), 0) rotate(calc(var(--r) * 0.55))
        scale(1);
    }

    100% {
      opacity: 0;
      transform: translate3d(var(--x), 40px, 0) rotate(var(--r)) scale(0.85);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .published-pop,
    .confetti {
      animation: none;
    }

    .confetti {
      display: none;
    }

    .x-preview,
    .x-preview--on {
      transition: none;
      transform: none;
    }
  }
</style>
