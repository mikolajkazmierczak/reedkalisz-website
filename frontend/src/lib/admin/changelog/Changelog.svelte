<script context="module">
  // the last version this browser showed the changelog of (a convenience: in a private window it opens every time)
  const KEY = 'admin-changelog-seen';
  export function readSeen() {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  }
  function writeSeen(version) {
    try {
      localStorage.setItem(KEY, version);
    } catch {
      // not kept
    }
  }

  // -> < 0, 0, > 0, as a - b; a missing one is older than any
  export function compare(a, b) {
    const parts = (v) => (v ?? '0.0.0').split('.').map(Number);
    const [x, y] = [parts(a), parts(b)];
    return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
  }

  // 2026-10-02 -> 02.10.2026
  export const date = (iso) => iso.split('-').reverse().join('.');

  // a highlight's paragraph -> its runs, every other one (between **) bold: [{ text, bold }]
  const runs = (paragraph) => paragraph.split('**').map((text, i) => ({ text, bold: i % 2 === 1 }));
</script>

<script>
  import { createEventDispatcher } from 'svelte';
  import Modal from '@c/Modal.svelte';
  import Button from '@c/Button.svelte';
  import { changelog, version } from './changelog.js';

  // Every version, newest first; the ones out since the changelog was last seen here with their version pills in yellow
  // (`seen`: that version, see Nav). Closing it counts as seen.
  export let seen = readSeen();
  const dispatch = createEventDispatcher();

  const isNew = (v) => !!seen && compare(v, seen) > 0;

  // the versions whose full list of changes is open
  let open = new Set();
  function toggle(v) {
    open.has(v) ? open.delete(v) : open.add(v);
    open = open;
  }

  function close() {
    writeSeen(version);
    dispatch('close');
  }
</script>

<Modal title="Historia zmian" maxWidth="40rem" on:close={close}>
  <div class="list">
    {#each changelog as { version: v, date: d, title, highlight, all }}
      <section>
        <!-- the version in a pill (yellow when out since the changelog was last seen here), the title, the date -->
        <h4>
          <span class="version" class:new={isNew(v)}>{isNew(v) ? 'NOWE · ' : ''}v{v}</span>
          <span class="title">{title}</span>
          <span class="date">{date(d)}</span>
        </h4>
        <!-- what matters in prose, every change behind a button -->
        {#each highlight as paragraph}
          <p class="prose">
            {#each runs(paragraph) as { text, bold }}{#if bold}<b>{text}</b>{:else}{text}{/if}{/each}
          </p>
        {/each}
        {#if all.length}
          <div class="more">
            <Button dashed size="sm" icon={open.has(v) ? 'chevron_up' : 'add'} on:click={() => toggle(v)}>
              {open.has(v) ? 'Zwiń pełne zmiany' : 'Pełne zmiany'}
            </Button>
          </div>
        {/if}
        {#if open.has(v)}
          <ul>
            {#each all as change}
              {#if typeof change === 'string'}
                <li>{change}</li>
              {:else}
                <li class="group">
                  <b>{change.label}</b>
                  <ul>
                    {#each change.items as item}<li>{item}</li>{/each}
                  </ul>
                </li>
              {/if}
            {/each}
          </ul>
        {/if}
      </section>
    {/each}
  </div>
</Modal>

<style>
  .list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  section {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  h4 {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: 0.5rem;
    row-gap: 0.25rem;
    margin-bottom: 0.15rem;
  }
  /* blue, the optional boxes' yellow when it's out since the changelog was last seen */
  .version {
    padding: 0.1rem 0.55rem;
    border-radius: 1rem;
    font-size: 0.8rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    color: var(--blue-700);
    background-color: var(--blue-100);
  }
  .version.new {
    color: var(--orange-700);
    background-color: var(--ply-yellow);
  }
  .title {
    font-size: 1.05rem;
    font-weight: 700;
  }
  .date {
    font-size: 0.85rem;
    font-weight: 400;
    color: var(--grey-500);
    font-variant-numeric: tabular-nums;
  }
  ul {
    margin: 0;
    padding-left: 1.1rem;
  }
  li {
    line-height: 1.4;
  }
  /* a highlight: plain paragraphs, a little apart */
  .prose {
    margin: 0;
    line-height: 1.5;
  }
  .prose + .prose {
    margin-top: 0.35rem;
  }
  .more {
    display: flex;
    margin-top: 0.25rem;
  }
  /* a group of the full list: its heading, its changes under it */
  li.group {
    list-style: none;
    margin-left: -1.1rem;
    margin-top: 0.4rem;
  }
  li.group:first-child {
    margin-top: 0.25rem;
  }
  li.group ul {
    list-style: disc; /* (not the circles of a list in a list) */
  }
</style>
