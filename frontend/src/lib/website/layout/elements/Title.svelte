<script>
  import GoButton from '#c/GoButton.svelte';

  import { parseHref } from '#/layout/utils';

  export let element;

  $: ({ href, target } = parseHref(element?.uri));
</script>

<div class="wrapper">
  <div class="head">
    <h2 class="title">{@html element.title}</h2>
    {#if element.button && element.uri}
      <div class="button">
        <GoButton text={element.button} {href} {target} />
      </div>
    {/if}
  </div>

  {#if element.subtitle}
    <p class="subtitle">{@html element.subtitle}</p>
  {/if}
</div>

<style>
  .wrapper {
    width: 100%;
  }

  /* Centre the button on the heading's line box, not its baseline. */
  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--sp-3) var(--sp-8);
  }

  /* a section head: the hero's size is the hero's alone */
  .title {
    font-size: var(--fs-h1);
    letter-spacing: -0.028em;
  }
  .subtitle {
    margin-top: var(--sp-3);
    max-width: 60ch;
    color: var(--text-muted);
    font-size: clamp(1rem, 0.93rem + 0.35vw, 1.1875rem);
    line-height: 1.55;
  }

  .button {
    flex: none;
  }
</style>
