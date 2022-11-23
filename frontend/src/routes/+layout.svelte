<script>
  import '$/styles/global.css';
  import '$/styles/ui-admin.css';

  let demo = true;
  let unstable = false;
</script>

<slot />

{#if demo}
  <div class="demo">
    <small>Dokumentuj błędy!</small>
    <h1>WERSJA DEMO</h1>
  </div>
{/if}

{#if unstable}
  <div class="unstable">
    <small>Nie korzystaj z serwisu!</small>
    <h1>WYKRYTO NIESTABILNOŚĆ</h1>
  </div>
{/if}

<style>
  .demo,
  .unstable {
    z-index: 1000;
    position: fixed;
    top: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 2px solid var(--main-3);
    background-color: var(--main-1);
  }
  .demo {
    --demo-dark: rgb(240, 167, 59);
    --demo-light: rgb(255, 234, 202);
    right: 1rem;
    padding: 0.25rem 1rem 0.25rem 1rem;
    border-color: var(--demo-dark);
    background-color: var(--demo-light);
  }
  .unstable {
    right: 50%;
    transform: translateX(50%);
    padding: 0.5rem 2rem 0.25rem 2rem;
  }
  .demo *,
  .unstable * {
    font-weight: 900;
    color: var(--main);
  }
  .demo * {
    font-size: 1.25rem;
    color: var(--demo-dark);
  }
  .unstable * {
    font-size: 2rem;
  }
  .demo small {
    font-size: 0.75rem;
  }
  .unstable small {
    font-size: 1rem;
  }
</style>
