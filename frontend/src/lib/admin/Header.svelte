<script>
  import { fly } from 'svelte/transition';
  import { page } from '$lib/admin/stores';
  $: console.log($page);
  $: title = typeof $page == 'string' ? $page : $page?.title ? $page.title : 'Wczytywanie...';
  $: path = $page?.path;
</script>

<header>
  {#if path}
    <a class="back" href={'/admin' + path[path.length - 1].href}>
      <img src="/icon/arrow_left.svg" alt="return arrow" />
    </a>
  {/if}
  <div class="text">
    {#if path}
      <div class="path">
        {#each path as { href, name }, i}
          {#if i != 0}
            <span> &nbsp;&nbsp;/&nbsp; </span>
          {/if}
          <a href={'/admin' + href}> {name} </a>
        {/each}
      </div>
    {/if}
    {#key title}
      <h1 in:fly={{ y: 50, duration: 500 }}>{title}</h1>
    {/key}
  </div>
</header>

<style>
  header {
    z-index: 1;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    border-top: var(--border);
    border-right: var(--border);
    border-bottom: var(--border);
    padding: 0.75rem 1.5rem 0.75rem 4.75rem;
    width: 100%;
    height: 5rem;
    background-color: var(--light);
  }

  .back {
    cursor: pointer;
    overflow: hidden;
    position: relative;
    display: grid;
    place-items: center;
    margin-left: 0.75rem;
    aspect-ratio: 1.1 / 1;
    height: 100%;
    border: var(--border);
  }
  .back::before {
    content: '';
    z-index: -1;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0%;
    height: 0%;
    border-radius: 50%;
    background-color: var(--teriary);
    transition: width 200ms, height 200ms;
  }
  .back:hover::before {
    width: 200%;
    height: 200%;
  }
  .back img {
    width: 70%;
  }

  .text {
    position: relative;
    margin-left: 1rem;
    width: 100%;
  }

  .path,
  h1 {
    position: absolute;
    left: 0;
  }
  .path {
    z-index: 1;
    top: 0;
    margin-top: -0.4rem;
    font-size: 1.25rem;
  }
  .path * {
    text-decoration: none;
    font-weight: bold;
    color: rgb(121, 121, 121);
  }
  h1 {
    z-index: 0;
    bottom: -0.55rem;
    margin-top: -0.5rem;
    font-size: 2rem;
    font-weight: 900;
  }
</style>
