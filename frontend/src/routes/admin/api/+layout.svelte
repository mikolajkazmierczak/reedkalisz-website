<script>
  import { page } from '$lib/admin/stores';
  import WIP from '$lib/components/WIP.svelte';

  $page = { title: 'API', icon: 'api' };
</script>

<WIP />

<slot />
