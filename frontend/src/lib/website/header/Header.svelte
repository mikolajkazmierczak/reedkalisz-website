<script>
  import Nav from './Nav.svelte';
  import Search from './Search.svelte';

  let openedID;
</script>

<div class="wrapper">
  <div class="content">
    <div class="part left">
      <a class="logo" href="/" on:click={() => (openedID = null)}>
        <img src="/logo_white.svg" alt="reed logo" />
      </a>

      <Nav bind:openedID />
    </div>

    <div class="part right">
      <Search />
    </div>
  </div>
</div>

<style>
  .wrapper {
    z-index: 1;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
    width: 100%;
    background-color: var(--main);
  }
  .content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 1200px;
    height: 100%;
    padding: 0 20px;
  }
  .part {
    display: flex;
    align-items: flex-end;
    height: 100%;
  }

  .logo {
    display: block;
    height: 100%;
    margin-right: 20px;
  }
  .logo img {
    display: block;
    padding: 10px 0;
    height: 100%;
  }
</style>
