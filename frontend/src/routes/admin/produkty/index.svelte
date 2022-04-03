<script>
  import api from '$lib/api';
  import { auth, readme } from '$lib/auth';
  import { error } from '$lib/error';
  import datetime from '$lib/datetime';

  import { goto } from '$app/navigation';

  import { onMount } from 'svelte';
  import Title from '$lib/admin/Title.svelte';
  import Content from '$lib/admin/Content.svelte';
  import Table from '$lib/admin/Table.svelte';

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
          'user_created.first_name',
          'user_created.last_name',
          'date_created',
          'user_updated.first_name',
          'user_updated.last_name',
          'date_updated'
        ]
      });
      console.log(res);
      products = res.data;
    } catch (err) {
      $error = 'TOKEN';
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
  <Title title="Produkty" />
  <Content>
    <Table
      {filters}
      head={[
        { centered: true, icon: { src: 'shown.svg', alt: 'włączony' } },
        { centered: true, icon: { src: 'discount.svg', alt: 'promocja' } },
        { centered: true, icon: { src: 'new.svg', alt: 'nowość' } },
        { title: 'ID' },
        { title: 'Kod' },
        { title: 'Nazwa' },
        { title: 'Dodano' },
        { title: 'Ostatnia edycja' },
        { title: 'Autor' },
        { title: 'Ostatnia aktualizacja' }
      ]}
      items={[{ href: '/produkty/cosmo', data: { centered: true, checkbox: true, checked: true } }, {}]}
    />
    <!-- <div class="wrapper">
      <div class="filters">
        <img src="/icon/filter.svg" alt="Filtry" />
        {#each filters as filter}
          <div class="filter">{@html filter} <img src="/icon/x.svg" alt="Usuń" /></div>
        {/each}
      </div>
      <table class="products">
        <tr class="product head">
          <td class="center"><img src="/icon/shown.svg" alt="Włączony" /></td>
          <td class="center"><img src="/icon/discount.svg" alt="Promocja" /></td>
          <td class="center"><img src="/icon/new.svg" alt="Nowość" /></td>
          <td>ID</td>
          <td>Kod</td>
          <td>Nazwa</td>-->
    <!-- <td><div><img src="/icon/date_created.svg" alt="Dodano" />Dodano</div></td>
          <td><div><img src="/icon/date_updated.svg" alt="Ostatnia edycja" />Ostatnia edycja</div></td>
          <td><div><img src="/icon/user_created.svg" alt="Autor" />Autor</div></td>
          <td><div><img src="/icon/user_updated.svg" alt="Ostatnia aktualizacja" />Ostatnia aktualizacja</div></td> -->
    <!--<td>Dodano</td>
          <td>Ostatnia edycja</td>
          <td>Autor</td>
          <td>Ostatnia aktualizacja</td>
        </tr>
        {#each products as product}
          <tr class="product">
            <td class="center checkbox enabled"><Input type="checkbox" checked={product.enabled} /></td>
            <td class="center checkbox sale"><Input type="checkbox" checked={product.sale} /></td>
            <td class="center checkbox new"><Input type="checkbox" checked={product.new} /></td>
            <td class="id" on:click={() => open(product.slug)}>{product.id}</td>
            <td class="code" on:click={() => open(product.slug)}>{product.code}</td>
            <td on:click={() => open(product.slug)}>{product.name}</td>
            <td class="date_created" on:click={() => open(product.slug)}>
              <DateTime datetime={product.date_created} />
            </td>
            <td class="date_updated" on:click={() => open(product.slug)}>
              <DateTime datetime={product.date_updated} />
            </td>
            <td class="user_created" on:click={() => open(product.slug)}>
              {product.user_created?.first_name}
              {product.user_created?.last_name}
            </td>
            <td class="user_updated" on:click={() => open(product.slug)}>
              {#if product.date_updated}
                {product.user_updated?.first_name}
                {product.user_updated?.last_name}
              {/if}
            </td>
          </tr>
        {/each}
      </table>
      <div class="pagination">
        <div class="prev"><img src="/icon/arrow_left.svg" alt="poprzednie" /></div>
        <div class="next"><img src="/icon/arrow_right.svg" alt="następne" /></div>
      </div>
    </div> -->
  </Content>
{/if}

<style>
  .wrapper {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
  }
  /* filters */
  .filters {
    align-self: stretch;
    display: flex;
    align-items: center;
    border: var(--border);
    border-bottom: none;
    /* margin-bottom: 1rem; */
    padding: 0.5rem;
    height: 40px;
    background-color: var(--light);
  }
  .filters > img {
    margin-right: 0.5rem;
  }
  .filter {
    cursor: pointer;
    display: flex;
    align-items: center;
    border: var(--border);
    border-radius: 20px;
    margin-right: 0.5rem;
    padding: 0.1rem 0.5rem;
    padding-right: 0.3rem;
  }
  .filter:hover {
    background-color: var(--teriary);
  }
  .filter > img {
    height: 20px;
    margin-left: 0.2rem;
  }

  /* products */
  table {
    border: var(--border);
    border-spacing: 0px;
    border-collapse: collapse;
    /* width: 100%; */
  }
  tr {
    --border: solid 1px var(--grey-dark);
    border-bottom: var(--border);
    background-color: var(--light);
  }
  tr:not(.head):hover {
    background-color: rgb(245, 245, 245);
  }
  .head {
    height: 50px;
    background-color: var(--bg-2);
  }

  .products td {
    padding: 0.4rem 0.5rem;
    white-space: nowrap;
  }
  .products td.center {
    text-align: center;
  }
  .product {
    cursor: pointer;
  }
  .product .checkbox {
    background-color: var(--teriary);
  }

  .pagination {
    align-self: stretch;
    display: flex;
    border: var(--border);
    border-top: none;
    /* margin-top: 1rem; */
    padding: 0.5rem;
    height: 40px;
    background-color: var(--light);
  }
</style>
