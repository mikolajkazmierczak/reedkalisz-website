<script>
  import Input from '$lib/admin/input/Input.svelte';
  import Button from '$lib/admin/input/Button.svelte';

  export let query;
</script>

<div class="search">
  <Input bind:value={query} placeholder="Szukaj..." borderRadius="var(--border-radius) 0 0 var(--border-radius)" />
  <Button icon="search" borderRadius="0 var(--border-radius) var(--border-radius) 0" />
</div>

<style>
  .search {
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
