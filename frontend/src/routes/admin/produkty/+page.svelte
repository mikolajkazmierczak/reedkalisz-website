<script>
  import { onMount } from 'svelte';

  import { goto } from '$app/navigation';
  import api from '$lib/api';
  import { auth, readme } from '$lib/auth';
  import { page, edited } from '$lib/admin/stores';
  import datetime from '$lib/datetime';
  import Table from '$lib/admin/Table.svelte';
  import Button from '$lib/admin/input/Button.svelte';

  $page = 'Produkty';
  $edited = false;

  let products;
  let filters = ['<b>Kategoria</b>&nbsp;Długopisy'];

  async function read() {
    try {
      const res = await api.items('products').readByQuery({
        meta: '*',
        limit: 100,
        offset: 0,
        fields: [
          'id',
          'slug',
          'code',
          'name',
          'enabled',
          'sale',
          'new',
          'date_created',
          'date_updated',
          'user_created.first_name',
          'user_created.last_name',
          'user_updated.first_name',
          'user_updated.last_name'
        ]
      });
      products = res.data;
    } catch (err) {
      // $error = 'TOKEN';
      // setTimeout(async () => {
      //   const me = await readme();
      //   if (me) read();
      //   else {
      //     $auth = false;
      //     $error = err;
      //   }
      // }, 2000);
    }
  }

  onMount(read);
  // $: if ($auth && !products) read();
</script>

{#if products}
  <Table
    {filters}
    head={[
      { checkbox: true, icon: { src: 'visibility.svg', alt: 'Włączony' } },
      { checkbox: true, icon: { src: 'new.svg', alt: 'Nowość' } },
      { checkbox: true, icon: { src: 'sale.svg', alt: 'Promocja' } },
      { title: 'ID' },
      { title: 'Kod' },
      { title: 'Nazwa' },
      { title: 'Dodano' },
      { title: '' },
      { title: 'Zaktualizowano' },
      { title: '' }
    ]}
    rows={products.map(p => ({
      href: `/admin/produkty/${p.slug}`,
      data: [
        p.enabled,
        p.new,
        p.sale,
        p.id,
        p.code,
        p.name,
        datetime(p.date_created).str(),
        p.user_created.first_name + ' ' + p.user_created.last_name,
        p?.date_updated ? datetime(p.date_updated).str() : '-',
        p?.user_updated ? p.user_updated.first_name + ' ' + p.user_updated.last_name : '-'
      ]
    }))}
  />
{/if}

<br /><br />
<Button on:click={() => goto('/admin/produkty/+')} icon="add.svg">Dodaj</Button>
