<script>
  import { createEventDispatcher } from 'svelte';
  import Icon from '$c/Icon.svelte';
  import Button from '@c/Button.svelte';
  import { plural } from '@/plural';

  import { FIXED } from '#/layout/utils';
  import { toText } from '#/layout/editor/text';

  const dispatch = createEventDispatcher();

  export let layout;
  export let types; // [{ type, label, icon }], every block's
  export let categories; // [{ id: slug, text }]
  export let addable; // the types a block can be added of

  const kind = (type) => types.find((t) => t.type === type);
  // what's in a block, in a few words
  function about(element) {
    if (element.type === 'title') return toText(element.title).replace(/\n/g, ' ');
    if (element.type === 'tiles') return plural(element.tiles.length, 'baner', 'banery', 'banerów');
    if (element.type === 'category') return categories.find((c) => c.id === element.slug)?.text.replace(/^[\d.]+ /, '');
    if (FIXED.includes(element.type)) return 'wbudowany';
    return '';
  }
</script>

<p class="lead">Kliknij blok albo baner na stronie, żeby go zmienić. Zmiany widać od razu; zostają po „Zapisz”.</p>

<section class="ui-box">
  <div class="ui-label">Bloki na stronie</div>
  <ol class="list">
    {#each layout as element (element._id)}
      <li>
        <button class="row" type="button" class:hidden={element.hide} on:click={() => dispatch('pick', element._id)}>
          <Icon name={kind(element.type).icon} width="1.1rem" dark />
          <span class="row__text">
            <span class="row__name">{kind(element.type).label}</span>
            <span class="row__about">{about(element) ?? ''}</span>
          </span>
          {#if element.hide}<Icon name="eye_off" width="1rem" dark />{/if}
          <Icon name="chevron_right" width="1rem" dark />
        </button>
      </li>
    {/each}
  </ol>
</section>

<section class="ui-box">
  <div class="ui-label">Dodaj blok</div>
  <div class="adds">
    {#each addable as type}
      <Button icon={kind(type).icon} dashed on:click={() => dispatch('add', type)}>{kind(type).label}</Button>
    {/each}
  </div>
  <p class="hint">Nowy blok staje na samej górze; przesuń go strzałkami na miejsce.</p>
</section>

<style>
  .lead {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.4;
  }
  .hint {
    margin: 0;
    color: var(--ink-muted);
    font-size: 0.75rem;
    line-height: 1.35;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: var(--quarter);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .row {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--half);
    width: 100%;
    padding: var(--quarter) var(--half);
    border: 1px solid var(--edge);
    border-radius: var(--field-radius);
    corner-shape: squircle;
    background-color: var(--paper-field);
    text-align: left;
  }
  .row:hover {
    border-color: var(--navy-500);
  }
  .row.hidden {
    opacity: 0.55;
  }
  .row__text {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .row__name {
    font-size: 0.85rem;
    font-weight: 600;
  }
  .row__about {
    overflow: hidden;
    color: var(--ink-muted);
    font-size: 0.75rem;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .adds {
    display: flex;
    flex-wrap: wrap;
    gap: var(--quarter);
  }
</style>
