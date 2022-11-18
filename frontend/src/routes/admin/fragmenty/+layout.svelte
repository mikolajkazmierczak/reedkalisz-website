<script>
  import { page } from '@/stores';
  import WIP from '@/WIP.svelte';

  $page = { title: 'Fragmenty', icon: 'fragments' };
</script>

<WIP />

<slot />
