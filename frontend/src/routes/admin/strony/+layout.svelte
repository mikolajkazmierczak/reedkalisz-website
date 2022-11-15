<script>
  import { page } from '$lib/admin/stores';
  import WIP from '$lib/components/WIP.svelte';

  $page = { title: 'Strony', icon: 'pages' };
</script>

<WIP />

<slot />
