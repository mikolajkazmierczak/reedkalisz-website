<script>
  import { parseDatetime } from '%/datetime';
  import { baseUrl } from '$/api';
  import { users } from '@/globals';

  export let user;
  export let datetime;

  $: userData = $users?.find((u) => u.id == user);
</script>

<!-- nothing at all (never updated): no empty pill -->
{#if userData || datetime}
  <div class="wrapper" class:no-user={!userData}>
    {#if userData}
      {@const { first_name, last_name, avatar } = userData}
      <!-- just the first name, it's short (the whole name on hover) -->
      <div class="user" title={[first_name, last_name].filter(Boolean).join(' ')}>
        <div class="img">
          <img src="{baseUrl}/assets/{avatar}" alt="avatar" />
        </div>
        {first_name ?? last_name ?? ''}
      </div>
    {/if}

    {#if datetime}
      <div class="time">
        {parseDatetime(datetime).str()}
      </div>
    {/if}
  </div>
{/if}

<style>
  .wrapper {
    display: inline-flex;
    align-items: center;
    border-radius: 100rem;
    padding: 0.15em 0.3em;
    padding-right: 0.5em;
    width: auto;
    background-color: var(--black-10);
    font-size: 0.9em;
  }

  /* just the date (e.g. a question sent from the website): as far in on the left as on the right, no avatar to hug */
  .wrapper.no-user {
    padding-left: 0.5em;
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
    border: 1px solid var(--black-50);
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
