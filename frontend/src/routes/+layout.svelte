<script>
  import '$/styles/global.css';
  import '$/styles/ui-admin.css';

  let beta = false;
  let maintenance = true;
</script>

<slot />

{#if beta}
  <div class="beta">
    <small>Dokumentuj błędy!</small>
    <h1>WERSJA BETA</h1>
  </div>
{/if}

{#if maintenance}
  <div class="maintenance">
    <small>Nie korzystaj z serwisu!</small>
    <h1>WERSJA NIESTABILNA</h1>
  </div>
{/if}

<style>
  .beta,
  .maintenance {
    z-index: 1000;
    position: fixed;
    top: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2px solid var(--main-3);
    background-color: var(--main-1);
  }
  .beta {
    right: 0.5rem;
    padding: 0.25rem 1rem 0rem 1rem;
  }
  .maintenance {
    right: 50%;
    transform: translateX(50%);
    padding: 0.5rem 2rem 0.25rem 2rem;
  }
  .beta *,
  .maintenance * {
    font-weight: 900;
    color: var(--main);
  }
  .beta * {
    font-size: 1.25rem;
  }
  .maintenance * {
    font-size: 2rem;
  }
  .beta small {
    font-size: 0.75rem;
  }
  .maintenance small {
    font-size: 1rem;
  }
</style>
