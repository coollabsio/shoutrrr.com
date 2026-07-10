<script lang="ts">
  import { oramaStaticClient } from 'fumadocs-core/search/client/orama-static';
  import type { SortedResult } from 'fumadocs-core/search';

  /**
   * fumadocs returns result `content` as Markdown, with matched terms wrapped
   * in `<mark>`. Render the common inline syntax (bold/italic/code) to HTML,
   * preserving the highlight marks. Stray HTML is escaped first so the
   * subsequent `{@html}` stays safe.
   */
  function renderContent(md: string): string {
    if (!md) return '';
    const OPEN = 'MARK';
    const CLOSE = '/MARK';
    let s = md.replaceAll('<mark>', OPEN).replaceAll('</mark>', CLOSE);
    s = s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // restore CLOSE before OPEN: 'MARK' is a substring of '/MARK'
    s = s.replaceAll(CLOSE, '</mark>').replaceAll(OPEN, '<mark>');
    // inline code first so markers inside it aren't reinterpreted
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>');
    s = s.replace(/(^|[^_\w])_([^_\s][^_]*?)_/g, '$1<em>$2</em>');
    return s;
  }

  let { tags = [] }: { tags?: string[] } = $props();

  let open = $state(false);
  let query = $state('');
  let results = $state<SortedResult[]>([]);
  let loading = $state(false);
  let inputEl = $state<HTMLInputElement>();
  let triggerEl = $state<HTMLButtonElement>();
  let activeTag = $state<string | null>(null);

  // One client per tag filter — each binds the tag at construction time.
  const clients = new Map<string, ReturnType<typeof oramaStaticClient>>();
  function getClient(tag: string | null) {
    const key = tag ?? '';
    let c = clients.get(key);
    if (!c) {
      c = oramaStaticClient({
        from: '/docs/search.json',
        ...(tag ? { tag } : {}),
      });
      clients.set(key, c);
    }
    return c;
  }

  async function runSearch() {
    const q = query;
    if (!q.trim()) {
      results = [];
      loading = false;
      return;
    }
    loading = true;
    try {
      const r = await getClient(activeTag).search(q);
      results = Array.isArray(r) ? r : [];
    } catch (e) {
      console.error('docs search failed', e);
      results = [];
    } finally {
      loading = false;
    }
  }

  let timer: ReturnType<typeof setTimeout>;
  function onInput() {
    clearTimeout(timer);
    timer = setTimeout(runSearch, 120);
  }

  function setTag(tag: string | null) {
    activeTag = tag;
    runSearch();
  }

  // Move the dialog to <body> so it escapes the sticky sidebar's stacking
  // context (otherwise the navbar and page content paint over it).
  function portal(node: HTMLElement) {
    document.body.appendChild(node);
    return {
      destroy() {
        node.remove();
      },
    };
  }

  // Both the desktop and mobile search islands listen for ⌘K. Only let the
  // one whose trigger is actually on-screen open, so a single dialog appears.
  function openDialog() {
    if (triggerEl && triggerEl.offsetParent === null) return;
    open = true;
    queueMicrotask(() => inputEl?.focus());
  }
  function close() {
    open = false;
    query = '';
    results = [];
    activeTag = null;
  }

  function onKey(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      open ? close() : openDialog();
    } else if (e.key === 'Escape' && open) {
      close();
    }
  }
</script>

<svelte:window on:keydown={onKey} />

<button
  type="button"
  bind:this={triggerEl}
  onclick={openDialog}
  class="search-trigger flex w-full items-center gap-2 rounded-lg border border-line bg-surface-sunken px-3 py-2 text-sm text-ink-400 transition-colors hover:border-line-strong hover:text-ink-500"
>
  <svg
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
  <span class="flex-1 text-left">Search docs…</span>
  <kbd
    class="hidden rounded border border-line bg-surface px-1.5 font-sans text-[11px] text-ink-300 sm:inline"
    >⌘K</kbd
  >
</button>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    use:portal
    class="fixed inset-0 z-[200] flex items-start justify-center bg-ink-900/30 px-4 pt-[12vh] backdrop-blur-sm"
    onclick={close}
  >
    <div
      class="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
      role="dialog"
      aria-modal="true"
      aria-label="Search documentation"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center gap-3 border-b border-line px-4">
        <svg
          class="size-4 shrink-0 text-ink-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          bind:this={inputEl}
          bind:value={query}
          oninput={onInput}
          type="text"
          placeholder="Search the docs…"
          class="search-input w-full bg-transparent py-3.5 text-[15px] text-ink placeholder:text-ink-300"
        />
        <button
          type="button"
          onclick={close}
          class="rounded border border-line px-1.5 py-0.5 text-[11px] text-ink-300 hover:text-ink-500"
          >Esc</button
        >
      </div>

      {#if tags.length > 0}
        <div
          class="flex flex-wrap items-center gap-1.5 border-b border-line px-4 py-2.5"
        >
          <button
            type="button"
            onclick={() => setTag(null)}
            class="tag-chip"
            class:active={activeTag === null}>All</button
          >
          {#each tags as tag (tag)}
            <button
              type="button"
              onclick={() => setTag(tag)}
              class="tag-chip"
              class:active={activeTag === tag}>{tag}</button
            >
          {/each}
        </div>
      {/if}

      <div class="max-h-[55vh] overflow-y-auto p-2">
        {#if loading}
          <p class="px-3 py-6 text-center text-sm text-ink-300">Searching…</p>
        {:else if query.trim() && results.length === 0}
          <p class="px-3 py-6 text-center text-sm text-ink-300">
            No results for “{query}”.
          </p>
        {:else}
          <ul class="flex flex-col">
            {#each results as r (r.id)}
              <li>
                <a
                  href={r.url}
                  class="block rounded-lg px-3 py-2 no-underline transition-colors hover:bg-surface-sunken"
                  class:pl-6={r.type !== 'page'}
                >
                  <!-- content is Markdown w/ <mark> highlights -> render inline -->
                  <span
                    class="result-content block text-sm"
                    class:font-medium={r.type === 'page'}
                    class:text-ink={r.type === 'page'}
                    class:text-ink-500={r.type !== 'page'}
                    >{@html renderContent(r.content)}</span
                  >
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  /* Override the site-wide lime :focus-visible outline with a softer ring. */
  .search-trigger:focus-visible {
    outline: none;
    border-color: oklch(0.79 0.2 128.85);
    box-shadow: 0 0 0 3px oklch(0.841 0.238 128.85 / 0.25);
  }
  /* The dialog row already has a border; the bare input needs no ring. */
  .search-input:focus-visible {
    outline: none;
  }
  /* Tag filter chips. */
  .tag-chip {
    border-radius: 999px;
    border: 1px solid oklch(0.92 0 0);
    background: oklch(0.985 0 0);
    padding: 0.1rem 0.6rem;
    font-size: 12px;
    color: oklch(0.46 0 0);
    transition:
      color 0.15s,
      background 0.15s,
      border-color 0.15s;
  }
  .tag-chip:hover {
    border-color: oklch(0.9 0 0);
    color: oklch(0.205 0 0);
  }
  .tag-chip.active {
    background: oklch(0.96 0.07 128);
    border-color: oklch(0.79 0.2 128.85);
    color: oklch(0.405 0.101 131.063);
    font-weight: 600;
  }
  .tag-chip:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px oklch(0.841 0.238 128.85 / 0.25);
  }

  /* Rendered Markdown inside result content. */
  .result-content :global(mark) {
    background: oklch(0.96 0.07 128);
    color: oklch(0.405 0.101 131.063);
    border-radius: 3px;
    padding: 0 0.15em;
    font-weight: 600;
  }
  .result-content :global(strong) {
    font-weight: 600;
    color: oklch(0.205 0 0);
  }
  .result-content :global(em) {
    font-style: italic;
  }
  .result-content :global(code) {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.85em;
    background: oklch(0.96 0.07 128);
    color: oklch(0.405 0.101 131.063);
    padding: 0.05em 0.3em;
    border-radius: 4px;
  }
</style>
