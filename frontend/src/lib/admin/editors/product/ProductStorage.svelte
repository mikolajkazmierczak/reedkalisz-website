<script>
  import { globals, colors, companies } from '@/globals';
  import { isApiCompany } from '@/sync';
  import { moveItem } from '%/utils';
  import { parseAmount, AMOUNT } from '$/storage';
  import Tooltip from '$c/Tooltip.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Picker from '@c/library/Picker.svelte';
  import { swatch } from '$/colors';

  export let product;
  export let fileContext = null; // { used, history } file ids, for the picker
  export let scanner = { variant: () => false }; // what the API scanner overwrites (see scannerFields)

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
  function moveStorage(i, d) {
    product.storage = moveItem(product.storage, i, d);
  }

  function pushStorageImg(i) {
    product.storage[i].img.push({
      img: null,
      enabled: true,
      show_in_gallery: true,
    });
    product = product;
  }
  function removeStorageImg(i, j) {
    product.storage[i].img.splice(j, 1);
    product = product;
  }
  function moveStorageImg(i, j, d) {
    product.storage[i].img = moveItem(product.storage[i].img, j, d);
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
              {#if !i == 0}
                <Button small icon="arrow_left" on:click={() => moveStorage(i, -1)} square />
              {/if}
              {#if i < product.storage.length - 1}
                <Button small icon="arrow_right" on:click={() => moveStorage(i, 1)} square />
              {/if}
              <Button small icon="delete" on:click={() => removeStorage(i)} dangerous />
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
                Ilość{#if state.state !== AMOUNT}<small>{state.label}</small>{/if}
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

          <div class="imgs-wrapper">
            <h3 class="ui-h3">Zdjęcia</h3>
            <div class="imgs">
              {#each storage.img as img, j (img)}
                <div class="img" class:hidden={!img.enabled}>
                  <div class="img-actions img-actions--top">
                    <Input type="checkbox" size="small" bind:value={img.enabled}>Pokaż</Input>
                    <Button small icon="delete" on:click={() => removeStorageImg(i, j)} square dangerous />
                  </div>
                  <Picker bind:selected={img.img} {fileContext} />
                  <div class="img-actions img-actions--bottom">
                    <span class="tip">
                      <Input type="checkbox" bind:value={img.show_in_gallery}>Galeria</Input>
                      <Tooltip><small>Dołącza zdjęcie na końcu głównej galerii</small></Tooltip>
                    </span>
                    <span class="order">
                      {#if j > 0}
                        <Button small icon="arrow_left" on:click={() => moveStorageImg(i, j, -1)} square />
                      {/if}
                      {#if j < storage.img.length - 1}
                        <Button small icon="arrow_right" on:click={() => moveStorageImg(i, j, 1)} square />
                      {/if}
                    </span>
                  </div>
                </div>
              {/each}
              <Button icon="add" on:click={() => pushStorageImg(i)}>Dodaj</Button>
            </div>
          </div>
        </div>
      {/each}

      <div class="ui-section__col">
        <Button icon="add" on:click={pushStorage}>Dodaj</Button>
      </div>
    </div>
  </section>
{/if}

<style>
  .imgs-wrapper {
    border-top: var(--border-light);
    padding-top: 1rem;
  }
  .imgs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(6.25rem, 1fr));
    gap: 1rem;
    padding-top: 1rem;
  }
  /* framed as the variant's box */
  .img {
    padding: 0.25rem;
    border-radius: var(--border-radius);
    corner-shape: squircle;
    border: var(--border-light);
  }

  /* (not halves: on a phone the buttons go under the toggles) */
  .storage-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .storage-actions > div:last-child {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
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
    gap: 0.3rem;
    --label-size: 0.75rem; /* the small checkbox's name, to fit a narrow tile */
  }
  .img-actions--top {
    justify-content: space-between;
    padding-bottom: 0.25rem;
  }
  .img-actions--bottom {
    justify-content: space-between;
    padding-top: 0.25rem;
  }
  .order {
    display: flex;
    gap: 0.3rem;
  }
  /* a hidden one: grey, as a hidden variant's box */
  .img.hidden {
    background-color: var(--grey-100);
  }

  /* the whole checkbox shows what it does */
  .tip {
    display: flex;
  }
</style>
