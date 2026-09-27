<script>
  import { users } from '@/globals';
  import Blame from '@c/Blame.svelte';

  // who created and last updated the item, and when (in an editor's uneditable box)
  export let item;
</script>

<h3 class="ui-h3">Utworzenie</h3>
<p>
  {#if $users && item.date_created}
    <Blame user={item.user_created} datetime={item.date_created} />
  {:else}
    Tu będziesz ty
  {/if}
</p>
<h3 class="ui-h3">Aktualizacja</h3>
<p>
  {#if $users && item.date_updated}
    <Blame user={item.user_updated} datetime={item.date_updated} />
  {:else}
    Nie aktualizowano
  {/if}
</p>
