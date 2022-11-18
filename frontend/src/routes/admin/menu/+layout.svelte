<script>
  import { page } from '@/stores';
  import WIP from '@/WIP.svelte';

  $page = { title: 'Menu', icon: 'menu' };
</script>

<WIP />

<slot />
