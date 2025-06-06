<script>
  import { page } from '$app/stores';

  // TODO: refresh after auth
</script>

<div class="wrapper">
  {#if $page.error.message === '404'}
    <h1><span>Ups!</span> Taka strona nie istnieje</h1>
    <p>Prawdopodobnie została przeniesiona lub usunięta</p>
    <a href="/">Zapraszamy do zapoznania się z ofertą!</a>
  {/if}
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  h1 {
    margin-top: 1rem;
  }
  h1 span {
    color: var(--main);
  }
  a {
    margin-top: 2rem;
    font-size: 1.25rem;
  }
  a:hover {
    text-decoration: none;
  }
</style>
