<script>
  import { baseUrl } from '$lib/api';
  import datetime from '$lib/datetime';
  import { users } from '$lib/admin/global';

  export let user;
  export let time;

  $: userData = $users.find(u => u.id == user);
</script>

<div class="wrapper">
  {#if userData}
    {@const { first_name, last_name, avatar } = userData}
    <div class="user">
      <img src="{baseUrl}/assets/{avatar}" alt="avatar" />
      {first_name}
      {last_name}
    </div>
  {/if}
  {datetime(time).str()}
</div>

<style>
  .wrapper {
    display: inline-block;
    border-radius: 1rem;
    padding: 0.1rem 0.25rem;
    width: auto;
    background-color: var(--accent-light);
  }

  .user {
    display: inline-block;
    margin-right: 0.5rem;
  }
  .user img {
    border-radius: 50%;
    border: 1px solid var(--primary);
    position: relative;
    top: 0.125rem;
    height: 1rem;
  }
</style>
