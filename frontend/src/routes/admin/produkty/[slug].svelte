<script context="module">
  export async function load({ params }) {
    return {
      props: { slug: params.slug }
    };
  }
</script>

<script>
  import api from '$lib/api';
  import { auth, readme } from '$lib/auth';
  import { error } from '$lib/error';

  import { onMount } from 'svelte';
  import Title from '$lib/admin/Title.svelte';
  import Content from '$lib/admin/Content.svelte';

  import Input from '$lib/components/Input.svelte';
  import Button from '$lib/components/Input.svelte';

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
  <Title path={[{ href: '/produkty', name: 'Produkty' }]} title={product.name} />
  <Content>
    <div class="box main">
      <h2>Główne</h2>
      <!-- <Input bind:product.name></Input> -->
      <p>{product.name}</p>
      <pre>{JSON.stringify(product, null, 2)}</pre>
    </div>
  </Content>
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
