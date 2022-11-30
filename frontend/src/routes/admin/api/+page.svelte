<script>
  import { header } from '@/stores';
  import WIP from '@/WIP.svelte';

  $header = { title: 'API', icon: 'api' };
</script>

<WIP />

<slot />
