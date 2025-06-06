<script>
  import { goto } from '$app/navigation';
  import Icon from '$c/Icon.svelte';

  export let text = 'BUTTON';
  export let arrow = true;
  export let arrowLeft = false;

  export let fontSize = '1rem';
  export let arrowHeight = '1.2em';

  export let href = null;
  export let target = '_self';

  export let onclick = null;

  if (href && onclick) {
    throw new Error('GoButton: href and onclick cannot be used together');
  }

  let hover = false;

  function handleClick() {
    if (href) {
      if (target == '_self') {
        goto(href);
      } else if (target == '_blank') {
        window.open(url, '_blank').focus();
      } else {
        throw new Error('GoButton: invalid target');
      }
    } else if (onclick) {
      onclick();
    }
  }
</script>

<button
  class="back"
  on:click={handleClick}
  on:mouseenter={() => (hover = true)}
  on:mouseleave={() => (hover = false)}
  style:font-size={fontSize}
>
  {#if arrow && arrowLeft}
    <div class="icon-wrapper" class:arrowLeft>
      <Icon name="arrow_left" color={hover ? 'var(--white)' : 'var(--main)'} height={arrowHeight} />
    </div>
  {/if}
  {text}
  {#if arrow && !arrowLeft}
    <div class="icon-wrapper">
      <Icon name="arrow_right" color={hover ? 'var(--white)' : 'var(--main)'} height={arrowHeight} />
    </div>
  {/if}
</button>

<style>
  .back {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border: 2px solid var(--main);
    padding: 0.5rem 1.5rem;
    font-size: 1rem;
    color: var(--main);
    background-color: var(--white);
  }
  .back:hover {
    color: var(--white);
    background-color: var(--main);
  }

  .icon-wrapper {
    position: relative;
    top: 0.05em;
    display: flex;
    align-items: center;
    height: 100%;
    transition: transform 150ms;
  }
  .back:hover .icon-wrapper {
    transform: translateX(0.5rem);
  }
  .back:hover .icon-wrapper.arrowLeft {
    transform: translateX(-0.5rem);
  }
</style>
