<script>
  import { header } from '@/stores';
  import WIP from '@/WIP.svelte';

  $header = { title: 'Strony', icon: 'pages' };
</script>

<WIP />

<slot />
