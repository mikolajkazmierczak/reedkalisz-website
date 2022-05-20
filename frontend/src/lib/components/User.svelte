<script>
  import { me, logout } from '$lib/auth';
  import Button from '$lib/components/Button.svelte';
</script>

<div class="user">
  {$me.first_name}
  {$me.last_name}
  <Button on:click={logout}>Wyloguj</Button>
</div>

<style>
  .user {
    position: fixed;
    top: 20px;
    right: 20px;
  }
</style>
