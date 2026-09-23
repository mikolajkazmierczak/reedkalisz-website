<script>
  import GoButton from '#c/GoButton.svelte';

  import { editing } from '#/layout/store';
  import { parseHref } from '#/layout/utils';
  import Button from '#/layout/Button.svelte';
  import ButtonInputs from '#/layout/ButtonInputs.svelte';
  import FloatingInputs from '#/layout/FloatingInputs.svelte';
  import Contenteditable from '#/layout/Contenteditable.svelte';

  export let element;

  $: ({ href, target } = parseHref(element?.uri));

  let inputsOpen = false;

  function toggleInputsOpen() {
    inputsOpen = !inputsOpen;
  }
</script>

<FloatingInputs bind:open={inputsOpen}>
  <ButtonInputs bind:button={element.button} bind:uri={element.uri} />
</FloatingInputs>

<div class="wrapper">
  <div class="head">
    {#if $editing}
      <h2 class="title editing" class:greyscale={!element.title}>
        <Contenteditable bind:html={element.title} />
      </h2>
    {:else}
      <h2 class="title">{@html element.title}</h2>
    {/if}

    <div class="button">
      {#if $editing}
        {@const hide = !element.button || !element.uri}
        <div class="editing" class:greyscale={hide}>
          <Button icon="edit" onclick={toggleInputsOpen} float="top left" />
          <GoButton text={element.button} {href} {target} />
        </div>
      {:else if element.button && element.uri}
        <GoButton text={element.button} {href} {target} />
      {/if}
    </div>
  </div>

  {#if $editing}
    <p class="subtitle editing" class:greyscale={!element.subtitle}>
      <Contenteditable bind:html={element.subtitle} />
    </p>
  {:else if element.subtitle}
    <p class="subtitle">{@html element.subtitle}</p>
  {/if}
</div>

<style>
  .editing {
    position: relative;
    border: 2px dashed var(--main-2);
  }
  .greyscale {
    filter: grayscale(1);
  }

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

  .title {
    font-size: var(--fs-hero);
    letter-spacing: -0.028em;
  }
  .subtitle {
    margin-top: var(--sp-3);
    max-width: 60ch;
    color: var(--text-muted);
    font-size: clamp(1rem, 0.93rem + 0.35vw, 1.1875rem);
    line-height: 1.55;
  }
  .title.editing,
  .subtitle.editing {
    min-width: 5ch;
  }

  .button {
    flex: none;
  }
</style>
