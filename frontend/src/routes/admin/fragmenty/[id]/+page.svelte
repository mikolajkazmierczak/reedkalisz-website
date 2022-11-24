<script>
  import Fragment from '@/editors/fragment/Fragment.svelte';

  export let data;
  let { id } = data;
</script>

<Fragment {id} />
