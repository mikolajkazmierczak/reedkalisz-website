<script>
  export let item;
  $: ({ name, href, children, _meta } = item);
  $: meta = _meta;

  $: title = meta.depth === 1;
  $: normal = meta.depth === 2;
  $: small = meta.depth === 3;
</script>

<div class="item" class:title class:normal class:small>
  <a data-sveltekit-prefetch {href}>{name}</a>
  {#if children.length}
    <div class="children">
      {#each children as child}
        <svelte:self item={child} />
      {/each}
    </div>
  {/if}
</div>

<style>
  /* a {
    color: var(--light);
  } */
  a:hover {
    cursor: pointer;
    text-decoration: underline;
  }
  .title > a {
    margin-bottom: 10px;
    font-size: 1.25rem;
    text-transform: uppercase;
    font-weight: 900;
    opacity: 0.85;
  }
  .small > a {
    font-size: 0.85rem;
  }

  .children {
    display: flex;
    flex-direction: column;
  }
  .title > .children {
    gap: 5px;
    margin-top: 10px;
  }
  .normal > .children {
    gap: 3px;
    margin: 3px 0 3px 5px;
  }
</style>
