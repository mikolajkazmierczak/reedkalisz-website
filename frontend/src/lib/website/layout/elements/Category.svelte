<script>
  import { page } from '$app/stores';
  import CategorySlider from '#c/CategorySlider.svelte';

  import { editing } from '#/layout/store';
  import Input from '#/layout/Input.svelte';
  import Button from '#/layout/Button.svelte';
  import FloatingInputs from '#/layout/FloatingInputs.svelte';

  export let element;
  export let categories;

  let inputsOpen = false;

  // this block's first page: from the server's render, or - arriving from another page - from the promise of them all
  // (streamed, see the homepage's load); worked out again only when that or the category changes, so the slider
  // isn't sent a new promise on every update
  let from = null;
  let slug = null;
  let preloaded = null;
  $: if ($page.data.sliders !== from || element.slug !== slug) pick($page.data.sliders, element.slug);
  function pick(sliders, s) {
    from = sliders;
    slug = s;
    preloaded = typeof sliders?.then === 'function' ? sliders.then((all) => all?.[s] ?? null) : (sliders?.[s] ?? null);
  }

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
    <CategorySlider limit={4} slug={element.slug} {preloaded} />
  </div>
{:else}
  <CategorySlider limit={4} slug={element.slug} {preloaded} />
{/if}

<style>
  .editing {
    position: relative;
    border: 2px dashed var(--main-2);
  }
</style>
