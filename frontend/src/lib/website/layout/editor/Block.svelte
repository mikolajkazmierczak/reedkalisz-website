<script>
  import { createEventDispatcher } from 'svelte';
  import { baseUrl } from '$/api';
  import Icon from '$c/Icon.svelte';
  import Button from '@c/Button.svelte';
  import Input from '@c/Input.svelte';
  import Select from '@c/Select.svelte';

  import { FIXED, isUUID } from '#/layout/utils';
  import { toText } from '#/layout/editor/text';
  import LinesField from '#/layout/editor/LinesField.svelte';
  import LinkField from '#/layout/editor/LinkField.svelte';

  const dispatch = createEventDispatcher();

  export let element;
  export let types; // [{ type, label, icon }]
  export let categories; // [{ id: slug, text }]
  export let first = false; // nothing above it to swap with
  export let last = false;

  $: ({ label, icon } = types.find((t) => t.type === element.type));
  $: fixed = FIXED.includes(element.type);
  // a banner's row: its picture, its title on one line, its size
  const thumb = (img) => (isUUID(img) ? `${baseUrl}/assets/${img}?key=mini` : null);
</script>

<div class="bar">
  <Button icon="chevron_left" ghost size="sm" on:click={() => dispatch('back')}>Wszystkie bloki</Button>
</div>

<div class="head">
  <h3 class="ui-h3"><Icon name={icon} width="1.1rem" dark /> {label}</h3>
  {#if !fixed}
    <div class="head__acts">
      <Button
        icon="arrow_up"
        secondary
        edge
        size="sm"
        title="Wyżej"
        disabled={first}
        on:click={() => dispatch('move', -1)} />
      <Button
        icon="arrow_down"
        secondary
        edge
        size="sm"
        title="Niżej"
        disabled={last}
        on:click={() => dispatch('move', 1)} />
      <Button
        icon={element.hide ? 'eye_off' : 'eye'}
        secondary
        edge
        size="sm"
        title={element.hide ? 'Ukryty: pokaż go na stronie' : 'Ukryj na stronie (zostaje w edycji)'}
        on:click={() => (element.hide = !element.hide)} />
      <Button icon="delete" dangerous size="sm" title="Usuń blok" on:click={() => dispatch('remove')} />
    </div>
  {/if}
</div>
{#if element.hide}<p class="note">Ukryty: odwiedzający go nie widzą.</p>{/if}

{#if element.type === 'title'}
  <section class="ui-box">
    <LinesField bind:html={element.title}>Tytuł</LinesField>
    <LinesField bind:html={element.subtitle} rows={3}>Podtytuł</LinesField>
  </section>
  <section class="ui-box">
    <Input type="text" bind:value={element.button} placeholder="Np. Zobacz wszystkie">Przycisk</Input>
    <LinkField bind:uri={element.uri} />
    <p class="hint">Przycisk stoi obok tytułu; bez tekstu albo linku go nie ma.</p>
  </section>
{:else if element.type === 'category'}
  <section class="ui-box">
    <div>
      <div class="ui-label">Kategoria</div>
      <Select bind:value={element.slug} options={categories} label="Kategoria" />
    </div>
    <p class="hint">Pierwsze cztery produkty tej kategorii, z przyciskiem do całej.</p>
  </section>
{:else if element.type === 'tiles'}
  <section class="ui-box">
    <div class="ui-label">Banery</div>
    {#if element.tiles.length}
      <ul class="list">
        {#each [...element.tiles].sort((a, b) => a.row - b.row || a.column - b.column) as tile (tile._id)}
          <li>
            <button class="row" type="button" class:hidden={tile.hide} on:click={() => dispatch('pick', tile._id)}>
              <span class="row__thumb"
                >{#if thumb(tile.img)}<img src={thumb(tile.img)} alt="" />{/if}</span>
              <span class="row__name">{toText(tile.title).replace(/\n/g, ' ') || 'Bez tytułu'}</span>
              <span class="row__size">{tile.width}×{tile.height}</span>
              <Icon name="chevron_right" width="1rem" dark />
            </button>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="hint">Jeszcze nie ma banerów.</p>
    {/if}
    <Button icon="add" dashed on:click={() => dispatch('add')}>Dodaj baner</Button>
    <p class="hint">Albo kliknij puste pole z plusem na stronie: baner stanie dokładnie tam.</p>
    <p class="hint">
      Rozmiar wybranego baneru zmieniają strzałki na jego bokach: na zewnątrz powiększają, do środka zmniejszają. Duże
      strzałki tuż przy nich (po najechaniu) przesuwają go na wolne miejsce obok albo za sąsiedni baner. Na telefonach
      banery stają jeden pod drugim, w tej samej kolejności.
    </p>
  </section>
{:else}
  <section class="ui-box">
    <p class="hint">
      Ten blok jest wbudowany w stronę: zawsze na niej jest i nie ma ustawień. Inne bloki można przesuwać nad i pod
      niego.
    </p>
  </section>
{/if}

<style>
  .bar {
    margin: calc(-1 * var(--quarter)) 0 0 calc(-1 * var(--quarter));
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--quarter) var(--half);
  }
  .head .ui-h3 {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0;
  }
  .head__acts {
    display: flex;
    gap: var(--quarter);
  }
  .note {
    margin: 0;
    color: var(--orange-700);
    font-size: 0.8rem;
    font-weight: 600;
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
    padding: var(--quarter);
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
  .row__thumb {
    flex: none;
    width: var(--cell);
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 0.4rem;
    background-color: var(--grey-100);
  }
  .row__thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .row__name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .row__size {
    color: var(--ink-muted);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }
</style>
