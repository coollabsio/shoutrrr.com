<script lang="ts">
  /**
   * Product tour — each tab is a faithful, light-themed replica of the real
   * app screen it names (resources/js/components/compose, posts/calendar,
   * analytics). Shadcn tokens are mapped onto the marketing palette
   * (muted→grays, primary→lime, border→line).
   */
  import { animate } from 'motion';
  import Logo from './Logo.svelte';
  import Calendar from '@lucide/svelte/icons/calendar';
  import ChevronLeft from '@lucide/svelte/icons/chevron-left';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import ImageIcon from '@lucide/svelte/icons/image';
  import Shuffle from '@lucide/svelte/icons/shuffle';
  import Split from '@lucide/svelte/icons/split';
  import Send from '@lucide/svelte/icons/send';
  import MessageCircle from '@lucide/svelte/icons/message-circle';
  import Repeat2 from '@lucide/svelte/icons/repeat-2';
  import Heart from '@lucide/svelte/icons/heart';
  import BarChart3 from '@lucide/svelte/icons/bar-chart-3';
  import CheckCheck from '@lucide/svelte/icons/check-check';
  import Archive from '@lucide/svelte/icons/archive';

  type Tab = 'composer' | 'calendar' | 'engagement' | 'analytics';
  let tab = $state<Tab>('composer');

  const TABS: { key: Tab; label: string; short: string }[] = [
    { key: 'composer', label: 'Composer', short: 'Composer' },
    { key: 'calendar', label: 'Queue & calendar', short: 'Calendar' },
    { key: 'engagement', label: 'Engagement', short: 'Inbox' },
    { key: 'analytics', label: 'Analytics', short: 'Analytics' },
  ];

  const GLYPHS = {
    x: '<svg viewBox="0 0 1200 1227" fill="currentColor" width="10" height="10"><path d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z"/></svg>',
    linkedin: '<svg viewBox="0 0 256 256" fill="currentColor" width="10" height="10"><path d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453"/></svg>',
    bluesky: '<svg viewBox="0 0 256 226" fill="currentColor" width="10" height="10"><path d="M55.491 15.172c29.35 22.035 60.917 66.712 72.509 90.686 11.592-23.974 43.159-68.651 72.509-90.686C221.686-.727 256-13.028 256 26.116c0 7.818-4.482 65.674-7.111 75.068-9.138 32.654-42.436 40.983-72.057 35.942 51.775 8.812 64.946 38 36.501 67.187-54.021 55.433-77.644-13.908-83.696-31.676-1.11-3.257-1.63-4.78-1.637-3.485-.008-1.296-.527.228-1.637 3.485-6.052 17.768-29.675 87.11-83.696 31.676-28.445-29.187-15.274-58.375 36.5-67.187-29.62 5.041-62.918-3.288-72.056-35.942C4.482 91.79 0 33.934 0 26.116 0-13.028 34.314-.727 55.491 15.172Z"/></svg>',
  };

  // ── Composer tab data ──────────────────────────────────────────────
  const composerTabs = [
    { id: 'x', platform: 'x', handle: '@shoutrrr', chip: '3×', active: true, tile: 'border border-line bg-white text-black' },
    { id: 'li', platform: 'linkedin', handle: 'Shoutrrr', chip: '1', active: false, tile: 'bg-blue-600 text-white' },
    { id: 'bs', platform: 'bluesky', handle: '@shoutrrr.bsky', chip: '3×', active: false, tile: 'bg-sky-500 text-white' },
  ];

  // The base draft, split into the 3 X-sized sections the auto-splitter produces.
  // Lengths sum to ~635 → three posts at the 280 limit, justifying "3-post thread".
  const sections = [
    { count: 224, text: 'Shipped Shoutrrr 1.0 today 🚀\n\nThe open-source social scheduler is here: draft once, then fan it out to X, LinkedIn, Instagram, and more at the same time — with a live per-network character count and auto-threading. No per-seat pricing.' },
    { count: 206, text: 'Run it your way.\n\nSelf-host the open-source app free on your own box, or start on our fully managed Cloud. Your posts, your audience, your data — Apache 2.0, runs anywhere Docker does.' },
    { count: 150, text: 'Get started in about a minute:\n\ndocker pull ghcr.io/coollabsio/shoutrrr\n\nStar it on GitHub and deploy today → github.com/coollabsio/shoutrrr' },
  ];
  const threadTotal = sections.reduce((s, x) => s + x.count, 0);
  // Same content as it lands on X, with illustrative engagement.
  const tweets = [
    { text: sections[0].text, time: '1h', replies: '23', reposts: '88', likes: '512', views: '21K' },
    { text: sections[1].text, time: '1h', replies: '7', reposts: '19', likes: '143', views: '9.4K' },
    { text: sections[2].text, time: '58m', replies: '11', reposts: '34', likes: '176', views: '7.8K' },
  ];

  // ── Calendar tab data ──────────────────────────────────────────────
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  type Chip = { p: keyof typeof GLYPHS; t: string; txt: string };
  type Cell = { n: number; out?: boolean; today?: boolean; chips?: Chip[] };
  const cells: Cell[] = [
    { n: 31, out: true }, { n: 1 }, { n: 2 }, { n: 3 },
    { n: 4, chips: [{ p: 'x', t: '9:00a', txt: 'Launch' }, { p: 'linkedin', t: '1:30p', txt: 'Recap' }] },
    { n: 5 }, { n: 6 },
    { n: 7 }, { n: 8 }, { n: 9, chips: [{ p: 'bluesky', t: '8:00a', txt: 'Tips' }] }, { n: 10 },
    { n: 11, chips: [{ p: 'x', t: '9:00a', txt: 'Thread' }] }, { n: 12 }, { n: 13 },
    { n: 14 }, { n: 15 },
    { n: 16, chips: [{ p: 'x', t: '9:00a', txt: 'AMA' }, { p: 'linkedin', t: '2:00p', txt: 'Case study' }] },
    { n: 17 }, { n: 18, chips: [{ p: 'linkedin', t: '11:00a', txt: 'Hiring' }] }, { n: 19 }, { n: 20 },
    { n: 21 }, { n: 22 }, { n: 23, chips: [{ p: 'x', t: '9:00a', txt: 'Recap' }] }, { n: 24 },
    { n: 25, chips: [{ p: 'bluesky', t: '9:00a', txt: 'Notes' }] },
    { n: 26, today: true, chips: [{ p: 'x', t: '10:00a', txt: 'Launch recap' }] }, { n: 27 },
    { n: 28 }, { n: 29 }, { n: 30 },
    { n: 1, out: true }, { n: 2, out: true }, { n: 3, out: true }, { n: 4, out: true },
  ];
  // Mobile shows a compact agenda instead of the dense grid (same as the app).
  const agenda = cells.filter((c) => !c.out && c.chips && c.chips.length);

  // ── Engagement tab data ────────────────────────────────────────────
  // The unified reply inbox: every mention & comment across networks in one
  // triage list, with the selected conversation open on the right.
  type Reply = {
    id: string;
    platform: keyof typeof GLYPHS;
    name: string;
    handle: string; // '' for LinkedIn, which shows names not @handles
    initials: string;
    time: string;
    text: string;
    on: string;
    unread?: boolean;
    replied?: boolean;
    selected?: boolean;
  };
  const replies: Reply[] = [
    {
      id: 'r1', platform: 'x', name: 'Priya Nair', handle: '@priyabuilds', initials: 'PN',
      time: '12m', unread: true, selected: true, on: 'Shipped Shoutrrr 1.0 today',
      text: "Been waiting for an open-source scheduler that isn't per-seat. Does it handle Bluesky threads too?",
    },
    {
      id: 'r2', platform: 'x', name: 'Marco Reyes', handle: '@marcodev', initials: 'MR',
      time: '34m', replied: true, on: 'Run it your way',
      text: 'Just deployed with the Docker one-liner — took two minutes flat. 🙌',
    },
    {
      id: 'r3', platform: 'bluesky', name: 'devsandra', handle: '@devsandra.bsky', initials: 'DS',
      time: '1h', unread: true, on: 'Shipped Shoutrrr 1.0 today',
      text: 'How does auto-split pick the break points — sentence boundaries?',
    },
    {
      id: 'r4', platform: 'linkedin', name: 'Liang Wei', handle: '', initials: 'LW',
      time: '2h', on: 'Run it your way',
      text: 'Congrats on the launch — self-hosting this for our team this week.',
    },
    {
      id: 'r5', platform: 'x', name: 'Tomás Alvarez', handle: '@tomdesigns', initials: 'TA',
      time: '3h', on: 'Shipped Shoutrrr 1.0 today',
      text: 'The live per-network character count is such a nice touch.',
    },
  ];
  const engFilters = ['All', 'Unread', 'X', 'LinkedIn', 'Bluesky'];
  // The open conversation (Priya's mention) as it reads on the right.
  const convoPost =
    'Shipped Shoutrrr 1.0 today 🚀 The open-source social scheduler is here: draft once, fan it out to X, LinkedIn, and Bluesky at the same time.';
  const convo = [
    { ours: false, text: "Been waiting for an open-source scheduler that isn't per-seat. Does it handle Bluesky threads too?", time: '12m' },
    { ours: true, text: 'It does — auto-threading works on X and Bluesky from the same draft. Give it a spin and let me know how it feels 🚀', time: '4m' },
  ];

  // ── Analytics tab data ─────────────────────────────────────────────
  const lineColors = ['oklch(0.705 0.213 47.604)', 'oklch(0.5 0.13 250)', 'oklch(0.68 0.15 230)'];
  const accounts = [
    { platform: 'x', name: '@acme', followers: '28.4k' },
    { platform: 'linkedin', name: 'Acme Inc', followers: '12.1k' },
    { platform: 'bluesky', name: '@acme.bsky', followers: '6.8k' },
  ] as const;
  const ranked = [
    { rank: 1, title: 'Shipped Shoutrrr 1.0 today', plats: ['x', 'linkedin'], date: 'Jun 16', eng: '4,210', top: true },
    { rank: 2, title: 'Why we self-host everything', plats: ['x'], date: 'Jun 11', eng: '2,980', top: false },
    { rank: 3, title: 'Composer deep-dive thread', plats: ['bluesky'], date: 'Jun 9', eng: '1,540', top: false },
  ] as const;
  const ranges = ['7d', '14d', '30d', '90d'];

  function enter(node: HTMLElement) {
    // Respect the user's motion preference — no fade on tab switch under reduce.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    animate(
      node,
      { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0px)'] },
      { duration: 0.35, ease: [0.22, 0.61, 0.36, 1] },
    );
  }
</script>

<!-- tabs -->
<div
  class="mb-6 flex flex-wrap justify-center gap-2 sm:mb-7"
  role="tablist"
  aria-label="Product tour"
>
  {#each TABS as t (t.key)}
    <button
      id={`tab-${t.key}`}
      role="tab"
      aria-selected={tab === t.key}
      aria-controls={`panel-${t.key}`}
      onclick={() => (tab = t.key)}
      class="rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors sm:px-[18px] sm:py-2.5 sm:text-sm"
      class:bg-lime={tab === t.key}
      class:text-lime-deep={tab === t.key}
      class:border-lime-ring={tab === t.key}
      class:bg-surface={tab !== t.key}
      class:text-ink-600={tab !== t.key}
      class:border-line-strong={tab !== t.key}
    >
      <span class="sm:hidden">{t.short}</span>
      <span class="hidden sm:inline">{t.label}</span>
    </button>
  {/each}
</div>

<div
  class="flex min-h-[460px] flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-panel"
>
  {#key tab}
    <div
      use:enter
      id={`panel-${tab}`}
      role="tabpanel"
      aria-labelledby={`tab-${tab}`}
      tabindex="0"
      class="flex flex-1 flex-col outline-none"
    >
      {#if tab === 'composer'}
        <!-- ░░ COMPOSER ░░ -->
        <div class="flex flex-1 flex-col md:grid md:grid-cols-[1.25fr_1fr] md:items-stretch">
          <div class="flex flex-col md:border-r md:border-line">
            <!-- platform tabs -->
            <div class="flex items-end gap-1 overflow-x-auto overflow-y-hidden border-b border-line px-3 pt-2.5">
              {#each composerTabs as a (a.id)}
                <div
                  class="relative flex shrink-0 items-center gap-2 rounded-t-md px-3 pb-3 pt-1.5 text-[12.5px] font-medium"
                  class:text-ink={a.active}
                  class:text-ink-300={!a.active}
                >
                  <span class={`grid size-[18px] place-items-center rounded-[5px] ${a.tile}`}>
                    {@html GLYPHS[a.platform as keyof typeof GLYPHS]}
                  </span>
                  <span>{a.handle}</span>
                  <span class="font-mono text-[11px] tabular-nums text-ink-300">{a.chip}</span>
                  {#if a.active}
                    <span class="pointer-events-none absolute inset-x-2 -bottom-px h-0.5 rounded-t-sm bg-ink"></span>
                  {/if}
                </div>
              {/each}
            </div>
            <!-- editor: the draft, split inline by section-break markers
                 exactly like the real Shoutrrr composer (sm-rule / sm-chip). -->
            <div class="flex-1 px-4 pt-4 sm:px-5 sm:pt-5">
              {#each sections as s, i (i)}
                {#if i > 0}
                  <div class="my-3.5 flex select-none items-center gap-2">
                    <span class="h-px flex-1" style="background:linear-gradient(to right,transparent,oklch(0.92 0 0))"></span>
                    <span class="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-2 py-[3px] font-mono text-[10.5px] tabular-nums text-ink-300">
                      <span class="font-medium text-ink">0{i + 1}/03</span>
                      <span class="size-[3px] rounded-full" style="background:oklch(0.55 0 0 / 0.5)"></span>
                      <span>{s.count}/280</span>
                    </span>
                    <span class="h-px flex-1" style="background:linear-gradient(to left,transparent,oklch(0.92 0 0))"></span>
                  </div>
                {/if}
                <p class="whitespace-pre-wrap break-words text-[15px] leading-[1.55] text-ink-800">{s.text}</p>
              {/each}
            </div>
            <!-- char counter -->
            <div class="flex items-center justify-between px-4 py-3.5 text-[12px] text-ink-300 sm:px-5">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.96_0_0)] px-2.5 py-0.5 text-[11.5px] font-medium text-ink">
                <span class="size-[5px] rounded-full bg-ink"></span>
                3-post thread
              </span>
              <span class="font-mono tabular-nums"><span class="text-ink">{threadTotal}</span></span>
            </div>
            <!-- toolbar -->
            <div class="flex items-center gap-1.5 border-t border-line bg-surface-sunken px-3 py-2.5">
              <span class="inline-flex h-7 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-[12px] text-ink-300">
                <ImageIcon class="size-3.5" /><span>Media</span>
                <span class="rounded-full bg-ink px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none text-white">1</span>
              </span>
              <div class="ml-auto"></div>
              <span class="inline-flex h-7 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-[12px] text-ink-300">
                <Split class="size-3.5" /><span>Override</span>
              </span>
              <span class="inline-flex h-7 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-[12px] text-ink shadow-[0_1px_2px_0_rgb(0_0_0/0.04)]">
                <Shuffle class="size-3.5" /><span>Auto-split</span>
              </span>
            </div>
            <!-- submit bar -->
            <div class="flex items-center justify-end gap-2 border-t border-line px-4 py-3.5 sm:px-5">
              <span class="inline-flex h-8 items-center rounded-md border border-line bg-surface px-3 text-[12.5px] font-medium text-ink-700">Save draft</span>
              <span class="inline-flex h-8 items-center gap-1.5 rounded-md border border-lime-ring bg-lime px-3 text-[12.5px] font-medium text-lime-deep">
                <Send class="size-3.5" /><span>Publish now</span>
              </span>
            </div>
          </div>
          <!-- live preview: how the thread lands on X -->
          <div class="flex flex-col gap-3 border-t border-line bg-surface-sunken p-4 sm:p-5 md:border-t-0">
            <div class="flex items-center gap-2 text-[13px] font-semibold text-ink-400">
              <span class="grid size-3.5 place-items-center text-ink-600">{@html GLYPHS.x}</span>
              How it lands on X
            </div>
            <div class="overflow-hidden rounded-2xl border border-line bg-white">
              {#each tweets as tw, i (i)}
                <div class="flex gap-3 px-4 pt-3">
                  <!-- avatar + thread connector -->
                  <div class="flex flex-col items-center">
                    <span class="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-white">
                      <Logo class="size-8 text-lime" />
                    </span>
                    {#if i < tweets.length - 1}
                      <span class="my-1 w-0.5 flex-1 rounded bg-line"></span>
                    {/if}
                  </div>
                  <!-- tweet body -->
                  <div class="min-w-0 flex-1 pb-3">
                    <div class="flex items-center gap-1 text-[15px] leading-tight">
                      <span class="font-bold text-[#0f1419]">Shoutrrr</span>
                      <svg class="size-[18px] shrink-0 text-[#1d9bf0]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                      </svg>
                      <span class="truncate text-[#536471]">@shoutrrr</span>
                      <span class="text-[#536471]">·</span>
                      <span class="shrink-0 text-[#536471]">{tw.time}</span>
                    </div>
                    <p class="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-[1.4] text-[#0f1419]">{tw.text}</p>
                    <div class="mt-3 flex max-w-[340px] items-center justify-between text-[#536471]">
                      <span class="inline-flex items-center gap-1.5 text-[12.5px] tabular-nums"><MessageCircle class="size-[15px]" />{tw.replies}</span>
                      <span class="inline-flex items-center gap-1.5 text-[12.5px] tabular-nums"><Repeat2 class="size-[15px]" />{tw.reposts}</span>
                      <span class="inline-flex items-center gap-1.5 text-[12.5px] tabular-nums"><Heart class="size-[15px]" />{tw.likes}</span>
                      <span class="inline-flex items-center gap-1.5 text-[12.5px] tabular-nums"><BarChart3 class="size-[15px]" />{tw.views}</span>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
            <p class="text-[12px] leading-[1.5] text-ink-300">
              Auto-split into a thread for X &amp; Bluesky · posted as one update
              on LinkedIn.
            </p>
          </div>
        </div>
      {:else if tab === 'calendar'}
        <!-- ░░ CALENDAR ░░ -->
        <div class="flex flex-1 flex-col">
          <!-- header -->
          <div class="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-2.5">
            <div class="flex items-center gap-1">
              <span class="grid size-7 place-items-center rounded-md text-ink-400 hover:bg-surface-sunken"><ChevronLeft class="size-3.5" /></span>
              <span class="grid size-7 place-items-center rounded-md text-ink-400 hover:bg-surface-sunken"><ChevronRight class="size-3.5" /></span>
              <span class="ml-1 inline-flex h-7 items-center rounded-md px-2 text-[12px] text-ink-600">Today</span>
              <span class="ml-1 inline-flex h-7 items-center gap-1.5 px-1 text-[15px] font-semibold tracking-tight">
                <Calendar class="size-3.5 text-ink-300" />June 2026
              </span>
            </div>
            <div class="ml-auto flex items-center gap-2.5">
              <span class="hidden text-[11px] text-ink-300 sm:inline">America/New_York</span>
              <div class="inline-flex h-7 overflow-hidden rounded-md border border-line">
                <span class="inline-flex items-center bg-surface-sunken px-2.5 text-[11.5px] font-medium text-ink">Month</span>
                <span class="inline-flex items-center border-l border-line px-2.5 text-[11.5px] font-medium text-ink-300">Week</span>
              </div>
            </div>
          </div>
          <!-- mobile: compact agenda -->
          <div class="flex flex-1 flex-col gap-2 p-4 sm:hidden">
            {#each agenda as day (day.n)}
              <div class="rounded-xl border border-line p-3">
                <div class="mb-2 flex items-center gap-2">
                  <span
                    class={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[12px] font-semibold tabular-nums ${day.today ? 'bg-lime text-lime-deep' : 'text-ink-600'}`}
                    style={day.today ? '' : 'background:oklch(0.96 0 0)'}
                  >{day.n}</span>
                  <span class="text-[12px] font-medium text-ink-400">
                    June 2026{day.today ? ' · Today' : ''}
                  </span>
                </div>
                <div class="space-y-1.5">
                  {#each day.chips ?? [] as chip (chip.txt)}
                    <div class="flex items-center gap-2 text-[13px]">
                      <span class="grid size-4 shrink-0 place-items-center text-ink-500">{@html GLYPHS[chip.p]}</span>
                      <span class="shrink-0 font-mono text-[11px] tabular-nums text-ink-300">{chip.t}</span>
                      <span class="truncate text-ink-700">{chip.txt}</span>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
          <!-- grid (sm+): fills remaining height; rows stretch evenly -->
          <div class="hidden flex-1 flex-col p-4 sm:flex">
            <div class="mb-1.5 grid grid-cols-7 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-300">
              {#each WEEKDAYS as w (w)}
                <div class="px-2 text-center">{w}</div>
              {/each}
            </div>
            <div class="grid flex-1 grid-cols-7 grid-rows-[repeat(5,minmax(64px,1fr))] gap-px overflow-hidden rounded-lg border border-line bg-line">
              {#each cells as c (`${c.n}-${c.out ? 'o' : 'i'}-${c.today ? 't' : ''}`)}
                <div
                  class="relative flex flex-col bg-surface p-1.5"
                  class:bg-surface-sunken={c.out}
                >
                  <div class="flex flex-1 flex-col" class:opacity-40={c.out}>
                    <div class="mb-1">
                      <span
                        class="inline-flex h-[18px] min-w-[18px] items-center justify-center px-1 text-[11px] font-medium tabular-nums"
                        class:rounded-full={c.today}
                        class:bg-lime={c.today}
                        class:text-lime-deep={c.today}
                        class:text-ink-600={!c.today}
                      >{c.n}</span>
                    </div>
                    <div class="space-y-1">
                      {#each (c.chips ?? []).slice(0, 2) as chip (chip.txt)}
                        <div
                          class="relative flex h-[18px] items-center gap-1.5 truncate rounded-sm pl-2 pr-1.5 text-[10.5px] font-medium tabular-nums"
                          style="background:oklch(0.95 0.05 230 / 0.5);color:oklch(0.45 0.13 245)"
                        >
                          <span class="absolute inset-y-0.5 left-0 w-[2px] rounded-full" style="background:oklch(0.6 0.15 240)"></span>
                          <span class="shrink-0 opacity-80">{@html GLYPHS[chip.p]}</span>
                          <span class="hidden shrink-0 opacity-75 sm:inline">{chip.t}</span>
                          <span class="truncate">{chip.txt}</span>
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {:else if tab === 'engagement'}
        <!-- ░░ ENGAGEMENT ░░ -->
        <div class="flex flex-1 flex-col md:grid md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:items-stretch">
          <!-- triage inbox -->
          <div class="flex flex-col md:border-r md:border-line">
            <!-- filter chips -->
            <div class="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden border-b border-line px-3 py-2.5">
              {#each engFilters as f (f)}
                <span
                  class="shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium"
                  class:bg-ink={f === 'All'}
                  class:text-white={f === 'All'}
                  class:text-ink-300={f !== 'All'}
                  class:border={f !== 'All'}
                  class:border-line={f !== 'All'}
                >{f}</span>
              {/each}
              <span class="ml-auto shrink-0 pl-2 text-[11px] tabular-nums text-ink-300">2 unread</span>
            </div>
            <!-- reply list -->
            <div class="flex-1 divide-y divide-line">
              {#each replies as r (r.id)}
                <div
                  class="flex gap-3 border-l-2 px-3 py-3"
                  class:border-lime-ring={r.unread}
                  class:border-transparent={!r.unread}
                  class:bg-surface-sunken={r.selected}
                  style={r.unread && !r.selected ? 'background:oklch(0.841 0.238 128.85 / 0.05)' : ''}
                >
                  <!-- avatar + platform badge -->
                  <div class="relative shrink-0">
                    <span class="grid size-9 place-items-center rounded-full text-[11px] font-semibold text-ink-600" style="background:oklch(0.96 0 0)">{r.initials}</span>
                    <span class="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-surface text-ink-500 ring-1 ring-line">{@html GLYPHS[r.platform]}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-baseline gap-1.5">
                      <span class="min-w-0 truncate text-[13.5px]" class:font-semibold={r.unread} class:font-medium={!r.unread}>{r.name}</span>
                      {#if r.handle}
                        <span class="min-w-0 truncate text-[12px] text-ink-300">{r.handle}</span>
                      {/if}
                      <span class="ml-auto shrink-0 text-[11px] tabular-nums text-ink-300">{r.time}</span>
                    </div>
                    <p class="mt-0.5 line-clamp-2 text-[13px] leading-[1.45]" class:text-ink-700={r.unread} class:text-ink-400={!r.unread}>{r.text}</p>
                    <div class="mt-1 flex items-center gap-1.5 text-[11px] text-ink-300">
                      {#if r.replied}
                        <span class="inline-flex items-center gap-1 font-medium text-lime-text">
                          <CheckCheck class="size-3" />Replied
                        </span>
                      {/if}
                      <span class="min-w-0 truncate">on “{r.on}”</span>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
            <!-- keyboard shortcut hints (desktop, same as the app) -->
            <div class="hidden shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-3 py-2 md:flex">
              {#each [['↑ ↓', 'move'], ['A', 'archive'], ['O', 'open'], ['R', 'reply']] as [k, label] (label)}
                <span class="inline-flex items-center gap-1.5 text-[11px] text-ink-300">
                  <kbd class="rounded border border-line bg-surface-sunken px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-500">{k}</kbd>
                  {label}
                </span>
              {/each}
            </div>
          </div>

          <!-- conversation desk (desktop only; mobile taps into a sheet in the app) -->
          <div class="hidden min-w-0 flex-col bg-surface-sunken md:flex">
            <!-- header -->
            <div class="flex shrink-0 items-center gap-2.5 border-b border-line bg-surface px-4 py-3">
              <div class="relative shrink-0">
                <span class="grid size-8 place-items-center rounded-full text-[11px] font-semibold text-ink-600" style="background:oklch(0.96 0 0)">PN</span>
                <span class="absolute -bottom-0.5 -right-0.5 grid size-3.5 place-items-center rounded-full bg-surface text-ink-500 ring-1 ring-line">{@html GLYPHS.x}</span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="truncate text-[13.5px] font-semibold">Priya Nair</div>
                <div class="truncate text-[11.5px] text-ink-300">X · to @shoutrrr</div>
              </div>
              <span class="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12px] text-ink-400">Open in</span>
              <span class="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-ink-400"><Archive class="size-4" /></span>
            </div>
            <!-- thread -->
            <div class="flex-1 space-y-3.5 p-4">
              <!-- your post excerpt -->
              <div class="rounded-xl border border-line bg-surface p-3">
                <div class="mb-1 text-[10.5px] font-medium uppercase tracking-[0.06em] text-ink-300">Your post</div>
                <p class="line-clamp-2 text-[13px] leading-[1.5] text-ink-500">{convoPost}</p>
              </div>
              {#each convo as m (m.text)}
                {#if m.ours}
                  <div class="flex flex-col items-end gap-1">
                    <div class="max-w-[85%] rounded-2xl rounded-br-sm border border-lime-ring bg-lime px-3.5 py-2.5">
                      <p class="whitespace-pre-wrap break-words text-[13px] leading-[1.45] text-lime-deep">{m.text}</p>
                      <div class="mt-1 text-right text-[10.5px] text-lime-deep/60">You · {m.time}</div>
                    </div>
                  </div>
                {:else}
                  <div class="flex min-w-0 gap-2.5">
                    <span class="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-ink-600" style="background:oklch(0.96 0 0)">PN</span>
                    <div class="max-w-[85%] rounded-2xl rounded-bl-sm border border-line bg-surface px-3.5 py-2.5">
                      <div class="mb-0.5 flex items-baseline gap-1.5">
                        <span class="truncate text-[12px] font-semibold">Priya Nair</span>
                        <span class="shrink-0 text-[10.5px] text-ink-300">· {m.time}</span>
                      </div>
                      <p class="whitespace-pre-wrap break-words text-[13px] leading-[1.45] text-ink-800">{m.text}</p>
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
            <!-- quick reply box -->
            <div class="shrink-0 border-t border-line bg-surface p-3">
              <div class="flex items-end gap-2 rounded-xl border border-line bg-surface px-3 py-2.5">
                <span class="flex-1 text-[13px] text-ink-300">Reply to @priyabuilds…</span>
                <span class="inline-flex h-7 items-center gap-1.5 rounded-md border border-lime-ring bg-lime px-2.5 text-[12px] font-medium text-lime-deep">
                  <Send class="size-3.5" />Reply
                </span>
              </div>
            </div>
          </div>

          <!-- mobile hint: the conversation opens as a sheet in the app -->
          <div class="border-t border-line px-4 py-3 text-center text-[12px] text-ink-300 md:hidden">
            Tap any reply to open the conversation and respond in place.
          </div>
        </div>
      {:else}
        <!-- ░░ ANALYTICS ░░ -->
        <div class="p-5 sm:p-[26px]">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="text-[15px] font-semibold tracking-tight">Follower growth</h3>
              <p class="text-[12px] text-ink-300">Across your accounts · last 30 days</p>
            </div>
            <div class="inline-flex items-center gap-0.5 rounded-lg border border-line bg-surface-sunken p-0.5">
              {#each ranges as r (r)}
                <span
                  class="rounded-md px-2.5 py-1 text-[12px] font-medium"
                  class:bg-surface={r === '30d'}
                  class:text-ink={r === '30d'}
                  class:shadow-sm={r === '30d'}
                  class:text-ink-300={r !== '30d'}
                >{r}</span>
              {/each}
            </div>
          </div>

          <!-- chart -->
          <div class="rounded-xl border border-line bg-surface p-4">
            <svg viewBox="0 0 600 180" class="block h-auto w-full" preserveAspectRatio="none" role="img" aria-label="Follower growth across accounts">
              {#each [45, 90, 135] as y (y)}
                <line x1="0" y1={y} x2="600" y2={y} stroke="oklch(0.92 0 0)" stroke-width="1" stroke-dasharray="3 3" />
              {/each}
              <line x1="520" y1="0" x2="520" y2="180" stroke="oklch(0.841 0.238 128.85)" stroke-width="1.5" stroke-dasharray="3 3" />
              <polyline points="0,150 90,140 180,128 270,120 360,96 450,86 540,60 600,52" fill="none" stroke={lineColors[0]} stroke-width="2" />
              <polyline points="0,160 90,150 180,150 270,132 360,128 450,110 540,104 600,92" fill="none" stroke={lineColors[1]} stroke-width="2" />
              <polyline points="0,168 90,164 180,156 270,150 360,140 450,134 540,120 600,110" fill="none" stroke={lineColors[2]} stroke-width="2" />
            </svg>
          </div>

          <!-- account stat cards -->
          <div class="mt-4 grid grid-cols-3 gap-3">
            {#each accounts as a (a.platform)}
              <div class="rounded-xl border border-line bg-surface px-4 py-3">
                <div class="flex items-center gap-2">
                  <span class="grid size-6 shrink-0 place-items-center rounded-full bg-[oklch(0.96_0_0)] text-ink">
                    {@html GLYPHS[a.platform as keyof typeof GLYPHS]}
                  </span>
                  <span class="truncate text-[11px] text-ink-300">{a.name}</span>
                </div>
                <p class="mt-2 font-display text-[22px] font-medium tabular-nums leading-none">{a.followers}</p>
                <p class="mt-1 text-[11px] text-ink-300">followers</p>
              </div>
            {/each}
          </div>

          <!-- ranked posts -->
          <div class="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
            <div class="border-b border-line px-4 py-2.5">
              <div class="text-[13px] font-semibold tracking-tight">Posts by engagement</div>
            </div>
            <div class="divide-y divide-line px-4">
              {#each ranked as p (p.rank)}
                <div class="flex items-center gap-3 py-2.5">
                  <span
                    class="grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-semibold tabular-nums"
                    style={p.top ? 'background:oklch(0.93 0.06 160);color:oklch(0.5 0.13 160)' : 'background:oklch(0.96 0 0);color:oklch(0.5 0 0)'}
                  >{p.rank}</span>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-[13px] font-medium leading-snug">{p.title}</p>
                    <div class="mt-0.5 flex items-center gap-1.5 text-ink-300">
                      {#each p.plats as pl (pl)}
                        <span>{@html GLYPHS[pl as keyof typeof GLYPHS]}</span>
                      {/each}
                      <span class="text-[11px]">{p.date}</span>
                    </div>
                  </div>
                  <span
                    class="shrink-0 text-[12px] font-semibold tabular-nums"
                    class:text-ink-300={!p.top}
                    style={p.top ? 'color:oklch(0.5 0.13 160)' : ''}
                  >{p.eng}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/key}
</div>
