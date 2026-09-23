<script>
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page as pageStore } from '$app/stores';

  export let limit;
  export let page;
  export let count;

  export let noSearchParams = false;
  export let limitLocked = false;
  /** Two pagers on one page need two names for screen readers. */
  export let label = 'Paginacja';

  const keep = () => {
    const sp = new URLSearchParams($pageStore.url.search);
    sp.delete('p');
    sp.delete('l');
    const rest = sp.toString();
    return rest ? `&${rest}` : '';
  };

  const setLimit = (l) => {
    if (noSearchParams) limit = l;
    else browser && goto(`?l=${l}&p=1${keep()}`);
  };
  const setPage = (p) => {
    if (noSearchParams) page = p;
    else browser && goto(`?l=${limit}&p=${p}${keep()}`, { noScroll: noSearchParams });
  };

  const limits = [25, 50, 100];

  $: pagesCount = Math.ceil(count / limit) || 0;
  $: page > pagesCount && pagesCount > 0 && setPage(1);

  const prev = () => setPage(Math.max(1, page - 1));
  const next = () => setPage(Math.min(page + 1, pagesCount || 1));

  // Editable page number: follows `page`, invalid input snaps back.
  let draft = String(page);
  $: draft = String(page);
  function jump() {
    const n = Number.parseInt(draft, 10);
    if (!Number.isFinite(n)) return void (draft = String(page));
    const target = Math.min(Math.max(n, 1), pagesCount || 1);
    draft = String(target);
    if (target !== page) setPage(target);
  }
</script>

{#if pagesCount > 1 || !limitLocked}
  <nav class="pg" aria-label={label}>
    <div class="pg__nav">
      <button class="pg__btn" type="button" disabled={page <= 1} on:click={prev} aria-label="Poprzednia strona">
        <svg viewBox="0 0 34 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M33 8H2m7-6L2 8l7 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <button class="pg__btn" type="button" disabled={page >= pagesCount} on:click={next} aria-label="Następna strona">
        <svg viewBox="0 0 34 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M1 8h31m-7-6 7 6-7 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <form class="pg__at tnum" on:submit|preventDefault={jump}>
        <input
          class="pg__field"
          style:--digits={String(pagesCount || 1).length}
          type="text"
          inputmode="numeric"
          autocomplete="off"
          aria-label="Strona (z {pagesCount || 1})"
          bind:value={draft}
          on:focus={(e) => e.currentTarget.select()}
          on:blur={jump}
          on:keydown={(e) => e.key === 'Escape' && ((draft = String(page)), e.currentTarget.blur())} />
        <span class="pg__of" aria-hidden="true">/ {pagesCount || 1}</span>
      </form>
    </div>

    {#if !limitLocked}
      <label class="select pg__limit">
        <span class="visually-hidden">Produktów na stronie</span>
        <select value={limit} on:change={(e) => setLimit(Number(e.currentTarget.value))}>
          {#each limits as l}
            <option value={l}>{l} na stronę</option>
          {/each}
        </select>
      </label>
    {/if}
  </nav>
{/if}

<style>
  .pg {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--sp-3);
    user-select: none;
  }

  .pg__nav {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
  }

  /* Arrows only, named by aria-label. */
  .pg__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.25rem;
    padding: 0 var(--sp-5);
    border: none;
    border-radius: var(--r-pill);
    background-color: rgba(17, 17, 16, 0.06);
    color: var(--ink);
    cursor: pointer;
    transition:
      background-color var(--dur-fast) var(--ease),
      color var(--dur-fast) var(--ease);
  }
  .pg__btn:hover:not(:disabled) {
    background-color: rgba(17, 17, 16, 0.12);
  }
  .pg__btn:disabled {
    background-color: rgba(17, 17, 16, 0.03);
    color: var(--ink-300);
    cursor: not-allowed;
  }
  .pg__btn svg {
    width: 1.75rem;
    height: 0.875rem;
  }

  .pg__at {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    margin-left: var(--sp-4);
    color: var(--ink-500);
    font-size: var(--fs-sm);
    font-weight: 700;
  }
  /* Width fits the page count's digits. */
  .pg__field {
    box-sizing: content-box;
    width: calc(var(--digits, 1) * 1ch);
    height: 1.75rem;
    padding: 0 var(--sp-2);
    border: 1px solid var(--ink-300);
    border-radius: var(--r-pill);
    corner-shape: squircle;
    background-color: transparent;
    color: var(--ink);
    font: inherit;
    font-variant-numeric: tabular-nums;
    text-align: center;
    /* Undo the bar's user-select: none. */
    -webkit-user-select: text;
    user-select: text;
    transition: border-color var(--dur-fast) var(--ease);
  }
  .pg__field:hover {
    border-color: var(--ink-600);
  }
  .pg__field:focus {
    outline: none;
  }
  .pg__field:focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }

  @media (max-width: 34.9375rem) {
    .pg {
      justify-content: center;
    }
    .pg__limit {
      display: none;
    }
  }
</style>
