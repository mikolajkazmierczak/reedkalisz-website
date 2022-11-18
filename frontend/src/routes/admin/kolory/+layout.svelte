<script>
  import { page } from '@/stores';
  import WIP from '@/WIP.svelte';

  $page = { title: 'Kolory', icon: 'colors' };
</script>

<WIP />

<slot />
