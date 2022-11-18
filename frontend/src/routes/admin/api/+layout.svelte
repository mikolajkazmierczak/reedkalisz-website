<script>
  import { page } from '@/stores';
  import WIP from '@/WIP.svelte';

  $page = { title: 'API', icon: 'api' };
</script>

<WIP />

<slot />
