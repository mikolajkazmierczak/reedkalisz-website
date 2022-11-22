<script>
  import { header } from '@/stores';
  import WIP from '@/WIP.svelte';

  $header = { title: 'Fragmenty', icon: 'fragments' };
</script>

<WIP />

<slot />
