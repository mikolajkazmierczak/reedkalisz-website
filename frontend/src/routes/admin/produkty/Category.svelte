<script>
  import { slide } from 'svelte/transition';
  import Icon from '$c/Icon.svelte';

  export let depth;

  export let id;
  export let name;
  export let enabled;
  export let children;
  $: hasChildren = children.length > 0;

  export let expanded = depth == '1'; // default expanded
  export let selected;
  $: active = selected == id;

  function select(id) {
    expanded = true;
    if (selected == id) {
      selected = null;
    } else {
      selected = id;
    }
  }
</script>

<div class="wrapper">
  <div class="category">
    <div
      class="title"
      class:hasChildren
      class:expanded
      class:disabled={!enabled}
      class:active
      title="{depth} {name}"
      on:click|stopPropagation={() => select(id)}
    >
      <span class="depth">{depth}</span>
      <span class="name">{name}</span>
      {#if hasChildren}<div class="line" />{/if}
    </div>

    {#if hasChildren}
      <div class="expander" class:active={expanded} role="button" on:click={() => (expanded = !expanded)}>
        {#if expanded}
          <Icon fill name="chevron_down" />
        {:else}
          <Icon fill name="chevron_right" />
        {/if}
      </div>
    {/if}
  </div>

  {#if hasChildren && expanded}
    <div class="children" transition:slide={{ duration: 200 }}>
      {#each children as { id, name, enabled, children }, i}
        <svelte:self
          {id}
          {name}
          {enabled}
          {children}
          depth="{depth}.{i + 1}"
          on:select={e => select(e.detail)}
          bind:selected
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .category {
    display: flex;
    justify-content: space-between;
    align-items: stretch;
  }

  .title {
    --gap: 0.4rem;
    cursor: pointer;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    gap: var(--gap);
    padding: calc(var(--gap) / 2) 0;
    width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    transition:
      background-color 100ms,
      padding 200ms;
  }
  .title.disabled {
    opacity: 0.35;
  }
  .title:not(.hasChildren) {
    margin-right: 1.6rem;
  }

  .title:hover,
  .title.active {
    padding-left: var(--gap);
  }
  .title:hover {
    background-color: var(--accent-light);
  }
  .title.active {
    background-color: var(--primary-white);
  }

  .depth {
    font-weight: bold;
    font-size: 0.9em;
  }
  .name {
    white-space: nowrap;
  }
  .line {
    display: inline-block;
    flex: 1;
    align-self: center;
    margin-right: var(--gap);
    height: 1px;
    background-color: rgba(0, 0, 0, 0.1);
  }

  .expander {
    cursor: pointer;
    position: relative;
    padding: 0.1rem;
    height: 1.6rem; /* 1rem + .title padding + .expander padding */
    aspect-ratio: 1 / 1;
    background-color: var(--light);
  }
  .expander:hover,
  .expander:focus,
  .expander.active {
    background-color: var(--accent-light);
  }

  .children {
    padding-left: 0.6rem;
    border-left: var(--border);
  }
</style>
