<script>
  import MenuItem from '@/editors/menu/MenuItem.svelte';

  export let data;
  let { id } = data;
</script>

<MenuItem {id} />
