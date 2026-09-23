<script>
  import { page } from '$app/stores';

  $: notFound = $page.error?.message === '404' || $page.status === 404;
</script>

<svelte:head>
  <title>{notFound ? 'Strona nie istnieje' : 'Wystąpił błąd'} | REED Kalisz</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="wrap">
  <div class="err">
    <p class="err__status tnum">{$page.status}</p>
    {#if notFound}
      <h1>Taka strona nie istnieje</h1>
      <p class="err__lead">Prawdopodobnie została przeniesiona albo usunięta.</p>
    {:else}
      <h1>Coś poszło nie tak</h1>
      <p class="err__lead">
        {$page.error?.message || 'Spróbuj odświeżyć stronę za chwilę.'}
      </p>
    {/if}

    <div class="err__actions">
      <a class="btn btn--ink" href="/">Strona główna</a>
      <a class="btn btn--orange" href="/kontakt">Kontakt</a>
    </div>
  </div>
</div>

<style>
  .err {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-3);
    max-width: 48ch;
    padding: var(--sp-20) 0 var(--sp-24);
  }
  .err__status {
    color: var(--red);
    font-size: var(--fs-sm);
    font-weight: 700;
    letter-spacing: 0.08em;
  }
  .err h1 {
    font-size: var(--fs-h1);
  }
  .err__lead {
    color: var(--ink-500);
  }
  .err__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-3);
    margin-top: var(--sp-4);
  }
</style>
