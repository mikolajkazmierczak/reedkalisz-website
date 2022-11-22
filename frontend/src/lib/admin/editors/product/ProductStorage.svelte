<script>
  import api from '$/api';
  import { moveItem } from '$/utils';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Picker from '@c/library/Picker.svelte';

  export let product;

  let colors;

  async function read() {
    const fields = ['id', 'enabled', 'name', 'color'];
    const res = await api.items('colors').readByQuery({ fields });
    colors = [
      { id: null, text: '---' },
      ...res.data.map(({ id, enabled, name, color }) => {
        return { id, text: `${enabled ? '' : '[Wyłączony] '}${name} (${color})` };
      })
    ];
  }

  function pushStorage() {
    product.storage.push({
      enabled: true,
      img: [],
      amount: null,
      api_color_code: '',
      color_first: null,
      color_second: null,
      multicolored: false
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
      show_in_gallery: true
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

  read();
</script>

<section class="ui-section">
  <h2 class="ui-h2">Warianty</h2>
  <div class="ui-section__row">
    {#each product.storage as storage, i (storage)}
      <div class="ui-box ui-box--element" class:ui-box--uneditable={!storage.enabled}>
        <div class="ui-pair storage-actions">
          <Input type="checkbox" bind:value={storage.enabled}>Włączone</Input>
          <div>
            {#if !i == 0} <Button icon="arrow_left" on:click={() => moveStorage(i, -1)} square /> {/if}
            {#if i < product.storage.length - 1}
              <Button icon="arrow_right" on:click={() => moveStorage(i, 1)} square />
            {/if}
            <Button icon="delete" on:click={() => removeStorage(i)} dangerous />
          </div>
        </div>

        <div class="ui-pair">
          <Input type="number" bind:value={storage.amount} api>Ilość</Input>
          <Input bind:value={storage.api_color_code}>Kod koloru w API</Input>
        </div>
        <div class="ui-pair">
          <Input type="select" bind:value={storage.color_first} options={colors}>Kolor 1</Input>
          <Input type="select" bind:value={storage.color_second} options={colors}>Kolor 2</Input>
        </div>
        <Input type="checkbox" bind:value={storage.multicolored}>Wielokolorowe</Input>

        <div class="imgs-wrapper">
          <h3 class="ui-h3">Zdjęcia</h3>
          <div class="imgs">
            {#each storage.img as img, j (img)}
              <div class="img" class:main={j == 0}>
                <div class="img-actions img-actions--buttons">
                  <div>
                    {#if !j == 0} <Button icon="arrow_left" on:click={() => moveStorageImg(i, j, -1)} square /> {/if}
                    {#if j < storage.img.length - 1}
                      <Button icon="arrow_right" on:click={() => moveStorageImg(i, j, 1)} square />
                    {/if}
                  </div>
                  <Button icon="delete" on:click={() => removeStorageImg(i, j)} square dangerous />
                </div>
                <Picker bind:selected={img.img} />
                <div class="img-actions img-actions--switches">
                  <Input type="checkbox" bind:value={img.enabled}>Włączone</Input>
                  <Input type="checkbox" bind:value={img.show_in_gallery}>
                    <span title={'Czy pokazywać zdjęcie również na końcu galerii'}>Galeria&nbsp;🛈</span>
                  </Input>
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

<style>
  .imgs-wrapper {
    border-top: var(--border-light);
    padding-top: 1rem;
  }
  .imgs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 1rem;
    padding-top: 1rem;
  }
  .img {
    padding: 0.25rem;
    border-radius: var(--border-radius);
    outline: var(--border-light);
  }
  .img.main {
    outline: var(--outline-dashed);
  }

  .storage-actions div {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .img-actions {
    display: flex;
  }
  .img-actions--buttons {
    justify-content: space-between;
    gap: 0.3rem;
    padding-bottom: 0.25rem;
  }
  .img-actions--buttons div {
    display: flex;
    gap: 0.3rem;
  }
  .img-actions--switches {
    flex-direction: column;
    gap: 0.5rem;
    padding-top: 0.5rem;
  }
</style>
