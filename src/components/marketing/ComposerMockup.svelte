<script lang="ts">
  /**
   * Hero composer — a faithful, editable miniature of the app's real composer
   * (resources/js/components/compose). Platform tabs with brand tiles + count
   * chips and a severity underline, an editor, a "Single post / N-post thread"
   * char counter, a Media/Override/Auto-split toolbar, and a Save/Publish bar.
   *
   * Limits match the README: X ≤280, Bluesky ≤300 graphemes, LinkedIn ≤3000.
   */
  import { Image as ImageIcon, Shuffle, Split, Send } from '@lucide/svelte';

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

  let active = $state<string>('x');
  let autoSplit = $state(true);
  let override = $state(false);
  let text = $state(
    'Shipped Shoutrrr 1.0 today 🚀 The open-source social scheduler: draft once, then fan it out to X, Bluesky, and LinkedIn at the same time — with a live per-network character count and auto-threading. Self-host it free, or use our managed Cloud soon. No per-seat pricing. Grab it on GitHub and deploy in a minute.',
  );

  // Grapheme-ish length so emoji count as one.
  const len = $derived([...text].length);

  type Sev = 'ok' | 'warn' | 'over';
  function compute(limit: number) {
    const sections = autoSplit ? Math.max(1, Math.ceil(len / limit)) : 1;
    let state: Sev = 'ok';
    if (sections === 1) {
      if (len > limit) state = 'over';
      else if (len > limit * 0.9) state = 'warn';
    }
    return { sections, state };
  }

  const activeAcct = $derived(ACCOUNTS.find((a) => a.id === active)!);
  const activeInfo = $derived(compute(activeAcct.limit));

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
</script>

<div
  class="relative z-10 overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-card"
>
  <!-- platform tabs -->
  <div
    class="flex items-end gap-0.5 overflow-x-auto overflow-y-hidden border-b border-line px-3 pt-2"
    role="tablist"
    aria-label="Accounts"
  >
    {#each ACCOUNTS as a (a.id)}
      {@const info = compute(a.limit)}
      {@const isActive = a.id === active}
      <button
        type="button"
        role="tab"
        aria-selected={isActive}
        onclick={() => (active = a.id)}
        class="group relative flex shrink-0 items-center gap-2 rounded-t-md px-3 pb-2.5 pt-2 text-[12.5px] font-medium tracking-[-0.005em] transition-colors"
        class:text-ink={isActive}
        class:text-ink-300={!isActive}
      >
        <span class={`grid size-[18px] place-items-center rounded-[5px] ${a.tile}`}>
          {@html GLYPHS[a.platform]}
        </span>
        <span>{a.handle}</span>
        {#if override && isActive}
          <span class="size-1.5 rounded-full bg-lime" title="Override active"></span>
        {/if}
        <span class="font-mono text-[11px] tabular-nums text-ink-300">
          {info.sections > 1 ? `${info.sections}×` : len}
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
      bind:value={text}
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
      {#if activeInfo.sections === 1}
        <span class="mx-px text-ink-300">/</span>
        <span class="text-ink-300">{activeAcct.limit}</span>
      {/if}
    </div>
  </div>

  <!-- toolbar -->
  <div
    class="flex flex-wrap items-center gap-1.5 border-t border-line bg-surface-sunken px-3 pb-2.5 pt-2 sm:px-[14px]"
  >
    <button
      type="button"
      class="inline-flex h-7 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-[12px] text-ink-300 transition-colors hover:border-line hover:bg-surface hover:text-ink"
    >
      <ImageIcon class="size-3.5" />
      <span>Media</span>
      <span
        class="rounded-full bg-ink px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none tabular-nums text-white"
        >1</span
      >
    </button>
    <div class="ml-auto"></div>
    <button
      type="button"
      onclick={() => (override = !override)}
      data-active={override}
      class="inline-flex h-7 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-[12px] text-ink-300 transition-colors hover:border-line hover:bg-surface hover:text-ink data-[active=true]:border-line data-[active=true]:bg-surface data-[active=true]:text-ink"
    >
      <Split class="size-3.5" />
      <span>{override ? 'Override on' : 'Override'}</span>
    </button>
    <button
      type="button"
      onclick={() => (autoSplit = !autoSplit)}
      data-active={autoSplit}
      class="inline-flex h-7 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-[12px] text-ink-300 transition-colors hover:border-line hover:bg-surface hover:text-ink data-[active=true]:border-line data-[active=true]:bg-surface data-[active=true]:text-ink"
    >
      <Shuffle class="size-3.5" />
      <span>Auto-split</span>
    </button>
  </div>

  <!-- submit bar -->
  <div
    class="flex items-center justify-end gap-1.5 border-t border-line px-4 py-3"
  >
    <button
      type="button"
      class="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12.5px] font-medium text-ink-700 transition-colors hover:bg-surface-sunken"
      >Save draft</button
    >
    <button
      type="button"
      class="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-lime-ring bg-lime px-3 text-[12.5px] font-medium text-lime-deep shadow-[0_1px_2px_0_rgb(0_0_0/0.04)] transition-[filter] hover:brightness-[1.04]"
    >
      <Send class="size-3.5" />
      <span>Publish now</span>
      <kbd
        class="ml-0.5 hidden h-4 items-center rounded border border-lime-deep/25 bg-lime-deep/10 px-1 font-mono text-[10px] font-normal leading-none text-lime-deep/90 sm:inline-flex"
        >⌘↵</kbd
      >
    </button>
  </div>
</div>
