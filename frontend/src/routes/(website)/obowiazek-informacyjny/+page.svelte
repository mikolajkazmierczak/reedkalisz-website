<script>
  export let data;
</script>

<div class="wrapper">
  <article>
    {@html data.fragment.content}
  </article>
</div>

<style>
  .wrapper {
    margin: 0 auto;
    margin-top: 8rem;
    padding: 2rem;
    max-width: 1000px;
  }
  article {
    margin-top: 2rem;
  }
</style>
