<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '@c/Button.svelte';
  import Modal from '@c/Modal.svelte';
  import File from '@c/library/File.svelte';
  import Tooltip from '$c/Tooltip.svelte';
  import { swatch } from '$/colors';
  import { colors } from '@/globals';
  import { findColor } from './utils.js';

  // Images from the api, waiting for an admin (found by a scan, or about to be imported with their products): the ones
  // taken off the list are never offered again, the rest is imported. "Później" decides nothing - the next scan
  // offers them again.
  export let title;
  // [{ product: { id | _uid, code, name }, href (an imported one's), candidates: [{ source, title, storages }] }]
  export let groups;
  export let busy = false;

  const dispatch = createEventDispatcher();

  let rejected = new Set(); // "product|source"
  const key = (group) => group.product.id ?? group.product._uid;
  const id = (group, candidate) => `${key(group)}|${candidate.source}`;
  function toggle(id) {
    rejected.has(id) ? rejected.delete(id) : rejected.add(id);
    rejected = rejected;
  }

  $: total = groups.reduce((sum, g) => sum + g.candidates.length, 0);
  $: accepted = total - rejected.size;

  // the name Directus gives a file imported from a url
  const basename = (source) => {
    const name = new URL(source).pathname.split('/').pop();
    try {
      return decodeURI(name);
    } catch {
      return name; // a stray '%' (as in '50%.jpg') isn't an escape
    }
  };
  const variants = (candidate) =>
    candidate.storages.length
      ? `Warianty: ${candidate.storages.map((s) => s.api_color_code || '—').join(', ')}`
      : 'Galeria produktu';

  // a variant's colour: ours (an imported variant's id, a name we have, our multicolour - see uploadItem), else the
  // api's name and hex
  function paint(storage) {
    const ours = storage.multicolored
      ? $colors?.find((c) => c.multicolor)
      : storage.color_first != null && findColor(storage.color_first);
    if (ours) return ours;
    if (typeof storage.color_first !== 'string') return null;
    return { name: storage.color_first, color: storage._color_first_hex, multicolor: storage.multicolored };
  }

  function confirm() {
    const decided = groups.map((g) => ({
      ...g,
      candidates: g.candidates.map((c) => ({ ...c, rejected: rejected.has(id(g, c)) })),
    }));
    dispatch('confirm', decided);
  }
</script>

<Modal type="fill" dotted>
  <div class="head ui-bar">
    <Button icon="ok" disabled={busy} on:click={confirm}>{busy ? 'Dodawanie...' : 'Dodaj'}</Button>
    <div class="ui-counts">
      <span class="ui-stat-value">{accepted}</span>
      <span class="ui-stat-label">Do dodania</span>
      <span class="ui-stat-value">{rejected.size}</span>
      <span class="ui-stat-label">Odrzucone</span>
    </div>
    <span class="ui-divider" />
    <h3>{title}</h3>
    <small class="muted">Kliknij zdjęcie, żeby je odrzucić. Skaner już nigdy ich nie zaproponuje.</small>
    <span class="later">
      <Button secondary edge disabled={busy} on:click={() => dispatch('later')}>Później</Button>
      <Tooltip><small>Zostaniesz zapytany o import tych zdjęć przy kolejnym skanie.</small></Tooltip>
    </span>
  </div>

  <div class="list">
    {#each groups as group (key(group))}
      <div class="product">
        <div class="heading">
          <!-- an imported one opens in a new tab, as the API list's (its cube) -->
          {#if group.href}
            <Button
              tone="info"
              edge
              icon="cube"
              title="Otwórz zaimportowany produkt"
              on:click={() => window.open(group.href, '_blank', 'noreferrer')} />
          {/if}
          <h3 class="ui-h3">{group.product.code} {group.product.name}</h3>
        </div>
        <div class="ui-tiles">
          {#each group.candidates as candidate (candidate.source)}
            <File
              src={candidate.source}
              title={candidate.title}
              filename_download={basename(candidate.source)}
              note={variants(candidate)}
              marked={rejected.has(id(group, candidate))}
              remove="Odrzuć"
              backing="var(--grey-100)"
              on:click={() => toggle(id(group, candidate))}>
              <svelte:fragment slot="tag">
                {#if candidate.storages.length}
                  {@const color = paint(candidate.storages[0])}
                  <span class="swatch" style:background={swatch(color, null)} />
                  <span class="tag-text">{color?.name ?? candidate.storages[0].api_color_code}</span>
                  {#if candidate.storages.length > 1}+{candidate.storages.length - 1}{/if}
                {:else}
                  Galeria
                {/if}
              </svelte:fragment>
            </File>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</Modal>

<style>
  .swatch {
    flex: none;
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 50%;
    border: 1px solid rgb(0 0 0 / 0.2);
  }
  .tag-text {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* a bar as the pages' (ui-bar): from the left, wrapping when there's no room */
  .head {
    flex: none;
    justify-content: flex-start;
    gap: 0.5rem 1rem;
    margin: 0;
  }
  h3 {
    margin: 0;
  }
  /* spaced as the picker's sections (see Library) */
  .heading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  .muted {
    color: var(--grey-500);
  }
  /* only the list scrolls; the head and buttons stay */
  .list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .later {
    display: flex;
    margin-left: auto;
  }
</style>
