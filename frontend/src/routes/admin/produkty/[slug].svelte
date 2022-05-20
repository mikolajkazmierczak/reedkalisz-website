<script context="module">
  export async function load({ params }) {
    return {
      props: { slug: params.slug }
    };
  }
</script>

<script>
  import { onMount } from 'svelte';

  import api from '$lib/api';
  import { auth, readme } from '$lib/auth';
  import { page, error } from '$lib/admin/stores';
  import Input from '$lib/admin/Input.svelte';
  import Button from '$lib/admin/Button.svelte';

  $: $page = { title: product?.name, path: [{ href: '/produkty', name: 'Produkty' }] };
  export let slug;

  let product;

  async function read() {
    try {
      const res = await api.items('products').readByQuery({
        fields: ['*.*'],
        filter: { slug: { _eq: slug } }
      });
      product = res.data[0];
    } catch (err) {
      $error = 'TOKEN';
    }
  }

  onMount(read);
  // $: if ($auth && !product && slug) read();
</script>

{#if product}
  <div class="box main">
    <h2>Główne</h2>
    <!-- <Input bind:product.name></Input> -->
    <p>{product.name}</p>
    <pre>{JSON.stringify(product, null, 2)}</pre>
  </div>
{/if}

<style>
  .box {
    padding: 1rem;
    border: solid 2px var(--grey-light);
  }
  .box h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  .main {
    background-color: var(--light);
  }
</style>
