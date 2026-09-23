<script>
  import DocPage from '#/shell/DocPage.svelte';

  export let data;
</script>

<DocPage title="Obowiązek informacyjny" items={data.menus.side} content={data.fragment.content} />
