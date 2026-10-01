<script>
  import Fragment from '@/editors/fragment/Fragment.svelte';

  export let data;
  // TODO: read once (see produkty/[slug])
  let { id } = data;
</script>

<Fragment {id} />
