<script>
  import { page } from '$lib/admin/stores';
  import { onMount } from 'svelte';

  import api from '$lib/api';
  import { uuid } from '$lib/utils';

  $page = 'Dashboard';

  let test;

  onMount(async () => {
    const res = await api.items('price_views').readByQuery({
      // fields: ['*.*']
    });
    test = res.data;
  });

  function create() {
    api.items('colors').createOne({
      name: 'test',
      color: '#aaa',
      enabled: true,
      uuid: uuid()
    });
  }
</script>

<p>Cicho tu.<br />Zbyt cicho...</p>
<pre>{JSON.stringify(test, null, 2)}</pre>
<!-- <button on:click={create}>nowy</button> -->
