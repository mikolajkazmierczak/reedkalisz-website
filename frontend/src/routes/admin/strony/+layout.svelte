<script>
  import { page } from '@/stores';
  import WIP from '@/WIP.svelte';

  $page = { title: 'Strony', icon: 'pages' };
</script>

<WIP />

<slot />
