<script>
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { page, edited, save, cancel } from '$lib/admin/stores';
  import HoverCircle from '$lib/components/HoverCircle.svelte';

  function spin(node, { duration }) {
    return {
      duration,
      css: t => {
        const eased = cubicOut(t);
        return `transform: rotate(${eased * 360}deg);`;
      }
    };
  }

  let saving = false;

  $: titleString = typeof $page == 'string' ? $page : $page?.title;
  $: title = titleString ?? 'Wczytywanie...';
  $: path = $page?.path;
</script>

<header>
  {#if path && !$edited}
    <a class="button back" href={'/admin' + path[path.length - 1].href}>
      <HoverCircle color={'var(--accent-light)'} />
      <img src="/icons/dark/arrow_left.svg" alt="return arrow" in:spin />
    </a>
  {/if}

  {#if $edited}
    <div
      class="button back"
      role="button"
      on:click={() => {
        $cancel();
        $edited = false;
      }}
    >
      <HoverCircle color={'var(--main-3)'} />
      <img src="/icons/dark/close.svg" alt="cancel" in:spin />
    </div>
  {/if}
  <div class="actions" class:visible={$edited}>
    <div
      class="button save"
      role="button"
      on:click={async () => {
        saving = true;
        await $save();
        saving = false;
        $edited = false;
      }}
    >
      <HoverCircle color={'var(--success)'} />
      {#if !saving}<img src="/icons/dark/ok.svg" alt="save" />{/if}
      <span>
        {#if saving}Zapisuję...{:else}Zapisz{/if}
      </span>
    </div>
  </div>

  <div class="text">
    <div class="path">
      {#if path}
        {#each path as { href, name }, i}
          {#if i != 0}
            <span>&nbsp;/</span>
          {/if}
          <a href={'/admin' + href}> {name} </a>
        {/each}
      {:else}
        <span>&nbsp;</span>
      {/if}
    </div>
    {#key title}
      <h1 in:fly={{ y: 50, duration: 500 }}>{title}</h1>
    {/key}
  </div>
</header>

<style>
  header {
    --height: 4rem;
    --gap: 0.9rem;
    z-index: 1;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    padding: var(--gap) 1.5rem var(--gap) 4.75rem;
    height: var(--height);
    width: 100%;
    background-color: var(--accent);
  }
  .actions {
    overflow: hidden;
    display: flex;
    width: 0;
    transition: width 200ms;
  }
  .actions.visible {
    width: 7.5rem;
  }

  .button {
    cursor: pointer;
    overflow: hidden;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    margin-left: 0.75rem;
    padding: 0 1rem;
    border: solid 2px var(--accent-text);
  }
  .button img,
  .button span {
    z-index: 1;
    position: relative;
  }
  .back {
    padding: 0;
    aspect-ratio: 1.2 / 1;
  }
  .button img {
    height: 80%;
  }

  .text {
    position: relative;
    display: flex;
    flex-direction: column;
    margin-left: 1rem;
    /* flex: 1; */
  }

  .path {
    z-index: 1;
    position: relative;
    top: -0.2rem;
  }
  .path * {
    text-decoration: none;
    font-weight: bold;
    opacity: 0.5;
    font-size: 0.9rem;
  }
  h1 {
    z-index: 0;
    position: relative;
    top: -0.4rem;
    font-size: 1.5rem;
    font-weight: 900;
    white-space: nowrap;
  }
</style>
