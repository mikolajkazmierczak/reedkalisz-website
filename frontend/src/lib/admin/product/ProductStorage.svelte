<script>
  import api from '$lib/api';
  import Input from '$lib/admin/input/Input.svelte';
  import Button from '$lib/admin/input/Button.svelte';
  import Picker from '$lib/admin/library/Picker.svelte';

  export let product;

  let colors;

  async function read() {
    const resColors = await api.items('colors').readByQuery({
      fields: ['id', 'name', 'color', 'enabled']
    });
    colors = resColors.data.map(d => ({
      id: d.id,
      text: `${d.enabled ? '' : '[Wyłączony] '}${d.name} (${d.color})`
    }));
  }

  function pushStorage() {
    product.storage.push({
      enabled: true,
      img: [],
      amount: null,
      api_color_code: '',
      color_first: null,
      color_second: null,
      multicolor: false
    });
    product = product;
  }
  function removeStorage(i) {
    product.storage.splice(i, 1);
    product = product;
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

  read();
</script>

<section class="ui-section">
  <h2 class="ui-h2">Magazyn</h2>
  <div class="ui-section__row">
    {#each product.storage as storage, i (storage)}
      <div class="ui-box ui-box--element" class:ui-box--uneditable={!storage.enabled}>
        <div class="ui-pair">
          <Input type="checkbox" bind:value={storage.enabled}>Włączone</Input>
          <Button icon="delete.svg" on:click={() => removeStorage(i)} dangerous>Usuń</Button>
        </div>
        <div class="imgs">
          <h3 class="ui-h3">Zdjęcia</h3>
          <div class="imgs-wrapper">
            {#each storage.img as img, j (img)}
              <div class="img">
                <Picker bind:selected={img.img} />
                <div class="actions">
                  <Input type="checkbox" bind:value={img.enabled}>Włączone</Input>
                  <Input type="checkbox" bind:value={img.show_in_gallery}>W galerii</Input>
                  <Button icon="delete.svg" on:click={() => removeStorageImg(i, j)} dangerous>Usuń</Button>
                </div>
              </div>
            {/each}
            <Button icon="add.svg" on:click={() => pushStorageImg(i)}>Dodaj</Button>
          </div>
        </div>
        <div class="ui-pair">
          <Input type="number" bind:value={storage.amount}>Ilość</Input>
          <Input bind:value={storage.api_color_code}>Kod koloru w API</Input>
        </div>
        <div class="ui-pair">
          <Input type="select" bind:value={storage.color_first} options={colors}>Kolor 1</Input>
          <Input type="select" bind:value={storage.color_second} options={colors}>Kolor 2</Input>
        </div>
        <Input type="checkbox" bind:value={storage.multicolored}>Wielokolorowe</Input>
      </div>
    {/each}

    <div class="ui-section__col">
      <Button icon="add.svg" on:click={pushStorage}>Dodaj</Button>
    </div>
  </div>
</section>

<style>
  .imgs {
    --border: solid 1px rgba(0, 0, 0, 0.1);
    border-top: var(--border);
    border-bottom: var(--border);
    padding: 1rem 0;
  }
  .imgs-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 1rem;
    padding-top: 1rem;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 0.75rem;
  }
</style>
