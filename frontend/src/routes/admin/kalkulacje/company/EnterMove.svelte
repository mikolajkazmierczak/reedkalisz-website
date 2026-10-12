<script>
  import Icon from '$c/Icon.svelte';
  import Button from '@c/Button.svelte';
  import { enterMove } from './gridKeys';

  // where Enter goes from a field being edited in the table (see gridKeys): both ways, the chosen one selected and
  // saying "ENTER" before its arrow, the other just its arrow
  const moves = [
    { value: 'down', icon: 'arrow_down', title: 'Enter przechodzi w dół' },
    { value: 'right', icon: 'arrow_right', title: 'Enter przechodzi w prawo' },
  ];
</script>

<div class="enter-move" role="group" aria-label="Po Enterze">
  {#each moves as move}
    {#if $enterMove === move.value}
      <Button size="sm" outline selected title={move.title}>
        ENTER<Icon height="58%" name={move.icon} dark />
      </Button>
    {:else}
      <Button size="sm" outline icon={move.icon} title={move.title} on:click={() => ($enterMove = move.value)} />
    {/if}
  {/each}
</div>

<style>
  .enter-move {
    display: flex;
    gap: 0.25rem;
  }
</style>
