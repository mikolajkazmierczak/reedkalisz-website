<script>
  import { onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import Menu from '#/products/Menu.svelte';

  export let data;

  let progress = 0;
  const interval = setInterval(() => {
    progress++;
  }, 1000);
  const timeout = setTimeout(() => {
    clearInterval(interval);
    goto('/kategorie');
  }, 5000);
  onDestroy(() => {
    clearInterval(interval);
    clearTimeout(timeout);
  });
</script>

<svelte:head>
  <!-- TODO: those should be fragments (or a singleton? but probably a bad idea) -->
  <title>Strona główna | REED Kalisz</title>
  <meta
    name="description"
    content="Firma Reed przedstawia gadżety dla firm, takie jak długopisy reklamowe, kalendarze czy kubki. Oferujemy również cyfrowy druk niskonakładowy i grawerowanie laserowe."
  />
</svelte:head>

<div class="wrapper">
  <div class="menu">
    <Menu items={data.menus.side} />
  </div>

  <main>
    <h1>Witamy na naszej nowej stronie internetowej!</h1>
    <p>Uzupełniamy asortyment, prosimy o cierpliwość<br />i zachęcamy do częstych odwiedzin :)</p>
    <h1>{'.'.repeat(progress)}</h1>
  </main>
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 1fr 3fr;
    margin-top: 6rem;
    width: 100%;
  }

  .menu {
    padding: 3.5rem 4.1rem;
    padding-right: 0;
  }

  main {
    margin-top: 10rem;
    text-align: center;
  }
  h1 {
    font-size: 3rem;
  }
  p {
    margin-top: 1rem;
    font-size: 2rem;
  }
</style>
