<script>
  import CategorySlider from '#c/CategorySlider.svelte';

  import { editing } from '#/layout/store';
  import Input from '#/layout/Input.svelte';
  import Button from '#/layout/Button.svelte';
  import FloatingInputs from '#/layout/FloatingInputs.svelte';

  export let element;
  export let categories;

  let inputsOpen = false;

  function toggleInputsOpen() {
    inputsOpen = !inputsOpen;
  }
</script>

<FloatingInputs bind:open={inputsOpen}>
  <Input label="Kategoria" type="select" bind:value={element.slug} options={categories} />
</FloatingInputs>

{#if $editing}
  <div class="editing">
    <Button icon="edit" onclick={toggleInputsOpen} float="top left" />
    <CategorySlider limit={4} slug={element.slug} />
  </div>
{:else}
  <CategorySlider limit={4} slug={element.slug} />
{/if}

<style>
  .editing {
    position: relative;
    border: 2px dashed var(--main-2);
  }
</style>
