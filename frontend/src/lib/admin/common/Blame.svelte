<script>
  import { baseUrl } from '$/api';
  import { getDatetime } from '$/datetime';
  import { users } from '@/global';

  export let user;
  export let datetime;

  $: userData = $users?.find(u => u.id == user);
</script>

<div class="wrapper">
  {#if userData}
    {@const { first_name, last_name, avatar } = userData}
    <div class="user">
      <div class="img">
        <img src="{baseUrl}/assets/{avatar}" alt="avatar" />
      </div>
      {first_name}
      {last_name}
    </div>
  {/if}

  {#if datetime}
    <div class="time">
      {getDatetime(datetime).str()}
    </div>
  {/if}
</div>

<style>
  .wrapper {
    display: inline-flex;
    align-items: center;
    border-radius: 100px;
    padding: 0.15em 0.3em;
    padding-right: 0.5em;
    width: auto;
    background-color: rgba(0, 0, 0, 0.1);
    font-size: 0.9em;
  }

  .user {
    display: flex;
    align-items: center;
    margin-right: 0.5em;
  }
  .img {
    overflow: hidden;
    margin-right: 0.25em;
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.5);
    height: 1em;
    width: 1em;
  }
  .img img {
    display: block;
    object-fit: cover;
    height: 100%;
    width: 100%;
  }
</style>
