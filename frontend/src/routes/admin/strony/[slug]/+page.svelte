<script>
  import Page from '@/editors/page/Page.svelte';

  export let data;
  // TODO: read once (see produkty/[slug])
  let { slug } = data;
</script>

<Page {slug} />
