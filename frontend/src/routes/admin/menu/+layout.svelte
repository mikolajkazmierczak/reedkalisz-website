<script>
  import { page } from '$lib/admin/stores';
  import WIP from '$lib/components/WIP.svelte';

  $page = { title: 'Menu', icon: 'menu' };
</script>

<WIP />

<slot />
