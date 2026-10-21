<script>
  import { users } from '@/globals';
  import Blame from '@c/Blame.svelte';

  // who created and last updated the item by hand, and when (in an editor's uneditable box); a product's last scan
  // and recalculation that changed it too
  export let item;
  const automatic = [
    { field: 'scanned_at', title: 'Skan' },
    { field: 'recalculated_at', title: 'Przeliczenie' },
  ];
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
{#each automatic.filter(({ field }) => field in item) as { field, title } (field)}
  <h3 class="ui-h3">{title}</h3>
  <p>
    {#if item[field]}
      <Blame user={null} datetime={item[field]} show={['date', 'time']} />
    {:else}
      Brak
    {/if}
  </p>
{/each}
