<script>
  import { page as pageStore } from '$app/stores';

  import CategorySlider from '#c/CategorySlider.svelte';

  $: ({ product, similar } = $pageStore.data);

  export let categorySlug;
</script>

{#if product}
  <div class="recommended">
    <h2>Podobne produkty</h2>
    <CategorySlider slug={categorySlug} filterIds={[product.id]} preloaded={similar} />
  </div>
{/if}

<style>
  .recommended {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
  }
  /* Same head as the page's other sections. */
  h2 {
    padding-bottom: var(--sp-2);
    border-bottom: var(--rule);
    font-size: var(--fs-h2);
  }
</style>
