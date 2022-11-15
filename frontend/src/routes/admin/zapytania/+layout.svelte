<script>
  import { page } from '$lib/admin/stores';
  import WIP from '$lib/components/WIP.svelte';

  $page = { title: 'Zapytania', icon: 'questions' };
</script>

<WIP />

<slot />
