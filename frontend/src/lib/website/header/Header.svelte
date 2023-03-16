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
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4rem;
    padding-top: 1.5rem;
    height: 6rem;
    width: 100%;
    backdrop-filter: blur(2px);
    background-color: var(--white);
    border-bottom: 1px solid var(--main);
    /* transition: border-bottom 100ms; */
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
