<script>
  import Nav from './Nav.svelte';
  import Search from './Search.svelte';

  export let menu;
</script>

<div class="wrapper">
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
    background-color: rgba(255, 255, 255, 0.9);
  }

  .logo {
    display: block;
    height: 100%;
    margin-right: 1rem;
  }
  .logo img {
    display: block;
    height: 100%;
  }
</style>
