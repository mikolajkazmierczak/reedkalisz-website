<script>
  import api from '$lib/api';
  import { page } from '$lib/admin/stores';
  $page = 'API';

  import Button from '$lib/admin/input/Button.svelte';
  import WIP from '$lib/components/WIP.svelte';

  function seed() {
    // api.items.
  }
</script>

<!-- <h1>Uwaga!</h1>
<p>Jeśli nie wiesz co robisz, wycofaj się! Ta podstrona to zbiór narzędzi dla programisty.</p>
<p>Pozwalają one na szybkie edycje w bazie danych oraz kontrolę nad połączeniami z zewnętrznymi API.</p>
<p>Można tu doprowadzić do <b>USUNIĘCIA BAZY DANYCH</b>.</p> -->

<!-- <Button action on:click={seed}>seesd</Button> -->

<WIP />
