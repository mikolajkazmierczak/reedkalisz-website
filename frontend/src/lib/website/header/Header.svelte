<script>
  import Nav from './Nav.svelte';
  import Search from './Search.svelte';

  export let menu;
  let y;
</script>

<svelte:window bind:scrollY={y} />

<div class="wrapper" class:scrolled={y > 0}>
  <a class="logo" href="/">
    <img src="/logo.svg" alt="reed logo" />
  </a>

  <Nav items={menu} />

  <Search />
</div>

<style>
  .wrapper {
    z-index: 10;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* border-bottom: 1px solid var(--main); */
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding: 0 4rem;
    padding-top: 1.5rem;
    height: 5rem;
    width: 100%;
    backdrop-filter: blur(3px);
    background-color: rgba(255, 255, 255, 0.8);
    /* background-color: var(--main); */
    /* background-color: var(--accent); */
  }

  .logo {
    position: relative;
    top: 1rem;
    display: block;
    height: 6rem;
    margin-right: 1rem;
  }
  .logo img {
    display: block;
    height: 100%;
  }
</style>
