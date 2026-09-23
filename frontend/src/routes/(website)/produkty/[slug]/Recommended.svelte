<script>
  import { page as pageStore } from '$app/stores';

  import CategorySlider from '#c/CategorySlider.svelte';

  $: ({ product } = $pageStore.data);

  export let categorySlug;
</script>

{#if product}
  <div class="recommended">
    <h2>Podobne produkty</h2>
    <CategorySlider slug={categorySlug} filterIds={[product.id]} />
  </div>
{/if}

<style>
  .recommended {
    display: flex;
    flex-direction: column;
    gap: var(--sp-4);
  }
  h2 {
    padding-bottom: var(--sp-3);
    border-bottom: 1px solid var(--border);
    font-size: var(--fs-h2);
  }
</style>
