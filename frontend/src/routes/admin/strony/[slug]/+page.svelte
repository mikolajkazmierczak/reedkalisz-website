<script>
  import Page from '@/editors/page/Page.svelte';

  export let data;
  let { slug } = data;
</script>

<Page {slug} />
