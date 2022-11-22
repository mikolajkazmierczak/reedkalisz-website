<script>
  import { header } from '@/stores';
  import WIP from '@/WIP.svelte';

  $header = { title: 'Zapytania', icon: 'questions' };
</script>

<WIP />

<slot />
