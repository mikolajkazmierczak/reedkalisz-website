<script>
  import { page } from '@/stores';
  import WIP from '@/WIP.svelte';

  $page = { title: 'Zapytania', icon: 'questions' };
</script>

<WIP />

<slot />
