<script>
  import { page as pageStore } from '$app/stores';

  import api from '$/api';
  import { treeGetAllChildrenIDs } from '%/utils';
  import { fields } from '#/products/fields';

  import Pagination from '#c/Pagination.svelte';
  import Products from '#/products/Products.svelte';

  $: ({ categoriesTree, categoriesItems } = $pageStore.data);

  export let slug;
  export let limit = 3;
  export let filterIds = [];

  let page = 1;
  let count = 0;

  let products = [];

  $: filter = slug && getFilter(slug, filterIds);
  $: filter && fetchRecommended(limit, page);

  function getFilter(slug, filterIds) {
    const category = categoriesItems.find(c => c.slug === slug)?.id;
    if (!category) throw Error('Category not found');
    const getIds = c => [c, ...treeGetAllChildrenIDs(categoriesTree, c)];
    let filter = { categories: { category: { _in: getIds(category) } } };
    if (filterIds.length) {
      filter = { ...filter, id: { _nin: filterIds } }; // exclude some products
    }
    return filter;
  }

  async function fetchRecommended(limit, page) {
    const sort = ['price'];
    const { data, meta } = await api.items('products').readByQuery({ filter, sort, fields, limit, page, meta: '*' });

    count = meta.filter_count;
    products = data;
  }
</script>

{#if products}
  <div class="wrapper">
    <Products {products} />
    <Pagination {limit} bind:page {count} limitLocked noSearchParams />
  </div>
{/if}

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
</style>
