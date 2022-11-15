<script>
  import { page } from '$lib/admin/stores';
  import WIP from '$lib/components/WIP.svelte';

  $page = { title: 'Fragmenty', icon: 'fragments' };
</script>

<WIP />

<slot />
