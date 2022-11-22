<script>
  import { header } from '@/stores';
  import WIP from '@/WIP.svelte';

  $header = { title: 'Menu', icon: 'menu' };
</script>

<WIP />

<slot />
