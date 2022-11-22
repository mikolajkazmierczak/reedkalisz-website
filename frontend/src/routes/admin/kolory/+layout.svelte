<script>
  import { header } from '@/stores';
  import WIP from '@/WIP.svelte';

  $header = { title: 'Kolory', icon: 'colors' };
</script>

<WIP />

<slot />
