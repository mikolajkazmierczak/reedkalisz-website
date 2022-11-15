<script>
  import { page } from '$lib/admin/stores';
  import WIP from '$lib/components/WIP.svelte';

  $page = { title: 'Kolory', icon: 'colors' };
</script>

<WIP />

<slot />
