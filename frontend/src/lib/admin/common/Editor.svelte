<script>
  import { fade, fly } from 'svelte/transition';
  import { goto } from '$app/navigation';

  export let back = null;
  export let icon;
  export let title;

  function handleExit() {
    // nagivate back
    if (back) goto(back, { replace: true, noscroll: true });
  }
</script>

<div class="wrapper" on:click|self={handleExit} in:fade={{ duration: 200 }} out:fade={{ duration: 100 }}>
  <div class="box" in:fly={{ x: -100, duration: 400 }} out:fly={{ duration: 100 }}>
    <div class="title">
      <h1>{title}</h1>
      <div class="actions" />
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</div>

<style>
  .wrapper {
    overflow-y: auto;
    z-index: 100;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
  }
  .box {
    max-width: 80vw;
    min-height: 100%;
    background-color: var(--accent-white);
    background-image: url('/imgs/dot_grid.png');
    background-size: 160px;
  }

  .title {
    z-index: 1;
    position: sticky;
    top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    height: 4rem;
    background-color: var(--accent);
  }
  .content {
    z-index: 0;
    padding: 2rem;
  }
</style>
