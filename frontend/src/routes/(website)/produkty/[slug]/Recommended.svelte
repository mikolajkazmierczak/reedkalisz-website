<script>
  import { page as pageStore } from '$app/stores';

  import CategorySlider from '#c/CategorySlider.svelte';

  $: ({ product } = $pageStore.data);

  export let categorySlug;
</script>

{#if product}
  <div class="recommended">
    <h2>Podobne produkty</h2>
    <CategorySlider limit={3} slug={categorySlug} filterIds={[product.id]} />
  </div>
{/if}

<style>
  .recommended {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  h2 {
    margin-top: 3rem;
    margin-bottom: 1rem;
    font-weight: normal;
  }
</style>
