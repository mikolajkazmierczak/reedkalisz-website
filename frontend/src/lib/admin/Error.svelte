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
  <div class="bg" on:click={hide} />
  <div class="wrapper" transition:fly={{ y: 20, duration: 300 }}>
    <div class="head">
      <div class="hide" on:click={hide}>
        <Icon fill name="close" />
      </div>
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
    background-color: rgba(0, 0, 0, 0.8);
  }

  .wrapper {
    z-index: 1003;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60ch;
    height: calc(100vh - 4rem);
    background-color: var(--light);
    border: solid 5px var(--main-light);
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
    position: absolute;
    top: 0;
    right: 0;
    border-radius: 50%;
    padding: 0.5rem;
    height: 100%;
    aspect-ratio: 1 / 1;
  }
  .hide:hover {
    background-color: var(--accent-white);
  }

  .content {
    overflow-y: auto;
    height: calc(100vh - 9rem - 10px);
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
