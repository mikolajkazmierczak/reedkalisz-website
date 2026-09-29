<script context="module">
  // what a pill can show (a table's blame column picks it, see Table), and a table's until then
  export const blameParts = [
    { id: 'first_name', text: 'Imię' },
    { id: 'last_name', text: 'Nazwisko' },
    { id: 'date', text: 'Data' },
    { id: 'time', text: 'Godzina' },
  ];
  export const defaultBlame = ['first_name', 'date'];
</script>

<script>
  import { parseDatetime } from '%/datetime';
  import { baseUrl } from '$/api';
  import { users } from '@/globals';

  export let user;
  export let datetime;
  // of blameParts; the avatar comes with either name
  export let show = ['first_name', 'date', 'time'];

  $: userData = $users?.find((u) => u.id == user);
  $: names = !!userData && (show.includes('first_name') || show.includes('last_name'));
  $: parsed = datetime ? parseDatetime(datetime) : null;
  $: when = [show.includes('date') && parsed?.date, show.includes('time') && parsed?.time].filter(Boolean).join(' ');
</script>

<!-- nothing at all (never updated): no empty pill -->
{#if names || when}
  <div class="wrapper" class:no-user={!names} class:no-time={!when}>
    {#if names}
      {@const { first_name, last_name, avatar } = userData}
      {@const shown = [show.includes('first_name') && first_name, show.includes('last_name') && last_name]}
      <!-- the whole name on hover -->
      <div class="user" title={[first_name, last_name].filter(Boolean).join(' ')}>
        <div class="img">
          <img src="{baseUrl}/assets/{avatar}" alt="avatar" />
        </div>
        {shown.filter(Boolean).join(' ')}
      </div>
    {/if}

    {#if when}
      <div class="time">{when}</div>
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
  .no-time .user {
    margin-right: 0;
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
