<script>
  import { fly } from 'svelte/transition';
  import { errors } from '@/stores';
  import Icon from '$c/Icon.svelte';

  function hide() {
    show = false;
  }

  $: show = $errors.length > 0;
</script>

{#if show}
  <div class="bg" role="presentation" on:click={hide} />
  <div class="wrapper" transition:fly={{ y: 20, duration: 300 }}>
    <div class="head">
      <button type="button" class="hide" aria-label="Zamknij" on:click={hide}>
        <Icon fill name="close" />
      </button>
      <h1>Wystąpił nieoczekiwany błąd</h1>
      <p>Każdemu może się zdarzyć...</p>
    </div>
    <div class="content">
      {#each $errors as error}
        <pre>{JSON.stringify(error, null, 4)}</pre>
        <hr />
      {/each}
    </div>
  </div>
{/if}

<style>
  .bg {
    z-index: 1002;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: var(--black-50);
  }

  .wrapper {
    z-index: 1003;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(60ch, 100vw - 1rem);
    height: calc(100dvh - 4rem);
    display: flex;
    flex-direction: column;
    background-color: var(--light);
    border: solid 0.3125rem var(--red-400);
  }

  .head {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 1rem 1rem;
  }
  .head p {
    margin: 0;
  }
  .hide {
    cursor: pointer;
    border: none;
    background: none;
    position: absolute;
    top: 0;
    right: 0;
    border-radius: 50%;
    padding: 0.5rem;
    height: 100%;
    aspect-ratio: 1 / 1;
  }
  .hide:hover {
    background-color: var(--grey-100);
  }

  .content {
    overflow-y: auto;
    flex: 1;
    min-height: 0;
    padding: 1rem;
    border-top: var(--border-light);
  }
  h1 {
    font-size: 1.25rem;
  }
  p {
    margin-top: 0.25rem;
    font-size: 0.9rem;
  }
  pre {
    margin: 0;
    width: 100%;
    white-space: pre-wrap;
  }
</style>
