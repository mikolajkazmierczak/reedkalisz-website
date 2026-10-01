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
</script>

<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '@c/Button.svelte';
  import Modal from '@c/Modal.svelte';
  import { scrolled } from '@/scrolled';
  import { changelog, version } from './changelog.js';

  // Every version, newest first; the ones out since the changelog was last seen here with their titles in orange
  // (`seen`: that version, see Nav). Closing it counts as seen.
  export let seen = readSeen();
  const dispatch = createEventDispatcher();
  let scroller; // what scrolls: the bar over it frosts as the versions go under it, as the pages' bars do

  const isNew = (v) => !!seen && compare(v, seen) > 0;
  const date = (iso) => iso.split('-').reverse().join('.');

  function close() {
    writeSeen(version);
    dispatch('close');
  }
</script>

<!-- (the box without its padding: the versions scroll under the bar, edge to edge) -->
<Modal
  maxWidth="40rem"
  on:close={close}
  role="dialog"
  aria-modal="true"
  aria-labelledby="changelog-title"
  style="padding: 0; gap: 0; overflow: hidden">
  <div class="scroll" bind:this={scroller}>
    <div class="head ui-topbar" use:scrolled={scroller}>
      <h3 id="changelog-title">Historia zmian</h3>
      <Button icon="close" size="sm" secondary on:click={close}>Zamknij</Button>
    </div>
    <div class="list">
      {#each changelog as { version: v, date: d, title, synopsis, changes }}
        <section>
          <h4 class:new={isNew(v)}>
            {isNew(v) ? 'NOWE ZMIANY · ' : ''}v{v} <span class="date">· {date(d)}</span>
          </h4>
          <p><b>{title}</b>: {synopsis}</p>
          <ul>
            {#each changes as change}
              <li>
                {#if typeof change === 'string'}{change}{:else}{#if change.big}<b>{change.label}</b
                    >{:else}{change.label}{/if}: {change.text}{/if}
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  </div>
</Modal>

<style>
  .scroll {
    overflow-y: auto;
    min-height: 0;
  }
  /* the title stays over the versions: as much above as under it */
  .head {
    z-index: 1;
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 1.5rem;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 0.25rem 1.5rem 1.25rem;
  }
  section {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  /* the version and its date: blue, orange when it's out since the changelog was last seen */
  h4 {
    font-weight: 700;
    color: var(--blue-700);
  }
  h4.new {
    color: var(--orange-500);
  }
  /* the date fainter than the version beside it */
  .date {
    color: inherit;
    opacity: 0.55;
  }
  ul {
    margin: 0;
    padding-left: 1.1rem;
  }
  li {
    line-height: 1.4;
  }
</style>
