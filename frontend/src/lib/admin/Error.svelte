<script>
  import { fade, fly } from 'svelte/transition';
  import { error } from '$lib/admin/stores';

  function hide() {
    $error = null;
  }
</script>

{#if $error}
  <div class="bg" transition:fade={{ duration: 300 }} />
  <div class="wrapper" transition:fly={{ y: 20, duration: 600 }}>
    <div class="head">
      <div class="hide" on:click={hide}>
        <img src="/icon/x.svg" alt="close" />
      </div>
      <h1>Wystąpił nieoczekiwany błąd</h1>
      <p>Każdemu może się zdarzyć...</p>
    </div>
    <div class="content">
      <pre>{JSON.stringify($error, null, 4)}</pre>
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
    padding: 0 2rem;
    height: 5rem;
    border-bottom: solid 2px var(--grey-light);
  }
  .hide {
    cursor: pointer;
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  .content {
    overflow: auto;
    height: calc(100vh - 9rem - 10px);
    padding: 1rem;
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
  }
</style>
