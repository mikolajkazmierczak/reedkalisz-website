<script>
  import { globals, colors, companies } from '@/globals';
  import { isApiCompany } from '@/sync';
  import { parseAmount, AMOUNT, NONE } from '$/storage';
  import { createEventDispatcher } from 'svelte';
  import { sortable, moveTo } from '@/sortable';
  import { beside } from '@/beside';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import DragHandle from '@c/DragHandle.svelte';
  import MoveTo from '@c/MoveTo.svelte';
  import Picker from '@c/library/Picker.svelte';
  import { swatch } from '$/colors';

  // The variants, in the order of their codes (set on saving, see order.js), each with its photos: dragged into place
  // by their handles, or moved to the gallery or another variant (`targets`): `on:move` { from, index, to }. Every
  // enabled variant's photos show in the product's gallery on the site too, after its own.
  export let product;
  export let fileContext = null; // { used, history } file ids, for the picker
  export let scanner = { variant: () => false }; // what the API scanner overwrites (see scannerFields)
  export let targets = [];
  export let covers = []; // (see ProductFiles)
  const dispatch = createEventDispatcher();

  $: globals.update(colors);
  $: apiProduct = isApiCompany($companies?.find((c) => c.id === product.company));
  $: colorsOptions =
    $colors &&
    [{ id: null, text: 'Brak', special: true }].concat(
      $colors.map((c) => ({ id: c.id, text: c.name, swatch: swatch(c) })),
    );

  function pushStorage() {
    product.storage.push({
      enabled: true,
      available: false,
      img: [],
      amount: null,
      api_color_code: '',
      api_color_id: '',
      color_first: null,
      color_second: null,
    });
    product = product;
  }
  function removeStorage(i) {
    product.storage.splice(i, 1);
    product = product;
  }
  // in the order shown (`index`: they're read back sorted by it, a photo without one first)
  function pushStorageImg(i) {
    const img = product.storage[i].img;
    img.push({ img: null, enabled: true, index: img.length });
    product = product;
  }
  function removeStorageImg(i, j) {
    product.storage[i].img.splice(j, 1);
    product.storage[i].img.forEach((img, k) => (img.index = k));
    product = product;
  }
  function sortStorageImg(i, from, to) {
    const img = product.storage[i].img;
    if (to < 0 || to >= img.length) return false;
    product.storage[i].img = moveTo(img, from, to);
  }
</script>

{#if $colors}
  <section class="ui-section">
    <h2 class="ui-h2">Warianty</h2>
    <div class="ui-section__row">
      {#each product.storage as storage, i (storage)}
        {@const state = parseAmount({ available: storage.available, amount: storage.amount })}
        <div class="ui-box ui-box--element" class:ui-box--uneditable={!storage.enabled}>
          <div class="storage-actions">
            <div class="toggles">
              <Input type="checkbox" bind:value={storage.enabled}>Widoczny</Input>
              <Input type="checkbox" bind:value={storage.available}>Dostępny</Input>
            </div>
            <div>
              <Button size="sm" icon="delete" on:click={() => removeStorage(i)} dangerous />
            </div>
          </div>

          <!-- the amount and the code; a supplier's id too: in thirds -->
          <div class="ui-pair" class:thirds={apiProduct}>
            <div class="amount" class:amount--overridden={storage.available}>
              <Input
                type="number"
                bind:value={storage.amount}
                api={scanner.variant(storage)}
                disabled={scanner.variant(storage)}>
                <!-- (the site's "Chwilowy brak" doesn't fit beside the label: "Brak" here) -->
                Ilość{#if state.state !== AMOUNT}<small>{state.state === NONE ? 'BRAK' : state.label}</small>{/if}
              </Input>
            </div>
            <Input bind:value={storage.api_color_code}>
              Kod{#if apiProduct}<small>API</small>{/if}
            </Input>
            {#if apiProduct}
              <Input bind:value={storage.api_color_id}>ID<small>API</small></Input>
            {/if}
          </div>
          <div class="ui-pair">
            {#each ['color_first', 'color_second'] as key, k}
              <Input type="select" bind:value={storage[key]} options={colorsOptions}>Kolor {k + 1}</Input>
            {/each}
          </div>

          <div class="imgs" use:sortable={{ sort: (from, to) => sortStorageImg(i, from, to) }}>
            {#each storage.img as img, j (img)}
              <div
                class="img"
                class:ui-cover={img === covers[0]}
                class:ui-cover--hover={img === covers[1]}
                data-sortable>
                <div class="img-actions">
                  <DragHandle disabled={storage.img.length < 2} on:step={(e) => sortStorageImg(i, j, j + e.detail)} />
                  <div>
                    {#if img.img}
                      <MoveTo
                        {targets}
                        here={i}
                        on:move={(e) => dispatch('move', { from: i, index: j, to: e.detail })} />
                    {/if}
                    <Button size="sm" icon="delete" on:click={() => removeStorageImg(i, j)} square dangerous />
                  </div>
                </div>
                <Picker bind:selected={img.img} {fileContext} />
              </div>
            {/each}
            <span class="ui-add" use:beside>
              <!-- a variant without photos: what it adds, there being no heading; with some: quieter, dashed -->
              <Button icon="add" dashed={storage.img.length > 0} on:click={() => pushStorageImg(i)}>
                {storage.img.length ? 'Dodaj' : 'Zdjęcie'}
              </Button>
            </span>
          </div>
        </div>
      {/each}

      <span class="ui-add" use:beside><Button icon="add" on:click={pushStorage}>Dodaj</Button></span>
    </div>
  </section>
{/if}

<style>
  .imgs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(6.25rem, 1fr));
    gap: 0.75rem;
    border-top: var(--border-light);
    padding-top: 1rem;
  }
  /* framed as the variant's box */
  .img {
    padding: 0.5rem;
    border-radius: var(--box-radius);
    corner-shape: squircle;
    border: var(--border-light);
  }

  /* (not halves: on a phone the delete button goes under the toggles) */
  .storage-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .storage-actions > div:last-child {
    display: flex;
  }
  .toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
  }

  .thirds {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .amount--overridden :global(.number-wrapper) {
    opacity: 0.4;
  }

  .img-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.3rem;
    padding-bottom: 0.25rem;
  }
  .img-actions div {
    display: flex;
    gap: 0.3rem;
  }
</style>
