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
  <div class="text">
    {#if $editing}
      <h1 class="title editing" class:greyscale={!element.title}>
        <Contenteditable bind:html={element.title} />
      </h1>
      <p class="subtitle editing" class:greyscale={!element.subtitle}>
        <Contenteditable bind:html={element.subtitle} />
      </p>
    {:else}
      <h1 class="title">{@html element.title}</h1>
      {#if element.subtitle}
        <p class="subtitle">{@html element.subtitle}</p>
      {/if}
    {/if}
  </div>

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

<style>
  .editing {
    position: relative;
    border: 2px dashed var(--main-2);
  }
  .greyscale {
    filter: grayscale(1);
  }

  .wrapper {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    width: 100%;
  }

  .title {
    font-size: 3rem;
  }
  .subtitle {
    margin: 0;
    font-size: 1.5rem;
  }
  .title.editing,
  .subtitle.editing {
    min-width: 5ch;
  }
</style>
