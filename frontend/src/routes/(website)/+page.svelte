<script>
  import { goto } from '$app/navigation';
  import { fly } from 'svelte/transition';

  import Categories from './Categories.svelte';
  import Products from './Products.svelte';
  import { categories } from '#/stores';

  export let data;
  $: ({ products } = data);

  let categoryID = null;
  let lastCategoryID = null;
  $: if (categoryID !== lastCategoryID) {
    lastCategoryID = categoryID;
    const href = categoryID ? `?c=${categoryID}` : '/';
    goto(href, { replaceState: true, noScroll: true });
  }
</script>

<svelte:head>
  <!-- TODO: those should be fragments (or a singleton? but probably a bad idea) -->
  <title>Strona główna | REED Kalisz</title>
  <meta
    name="description"
    content="Firma Reed przedstawia gadżety dla firm, takie jak długopisy reklamowe, kalendarze czy kubki. Oferujemy również cyfrowy druk niskonakładowy i grawerowanie laserowe."
  />
</svelte:head>

<h1>Gadżety reklamowe</h1>

<Categories categories={$categories.find(c => c.id == 88).children} bind:categoryID />

<Products {products} />

<style>
  h1 {
    margin-top: 3rem;
    font-weight: 900;
    font-size: 3rem;
  }
</style>
