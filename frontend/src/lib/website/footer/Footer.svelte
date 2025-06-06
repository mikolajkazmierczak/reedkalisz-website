<script>
  import { marked } from 'marked';
  import { addLinks } from '#/utils';

  export let fragments;
  export let menu;

  const { about, office, rights } = fragments;

  addLinks(menu);
</script>

<footer>
  <div class="columns">
    <div class="text text__about">
      {@html marked.parse(about.content)}
    </div>
    <div class="text text__office">
      {@html marked.parse(office.content)}
    </div>
    {#if menu.length}
      <div class="menu">
        <ul>
          {#each menu as { name, href }}
            <li>
              <a {href}>{name}</a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
  <div class="rights">
    {@html marked.parse(rights.content)}
  </div>
</footer>

<style>
  footer {
    min-height: 16rem;
    height: auto;
    width: 100%;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    background-color: var(--white);
  }

  .columns {
    display: flex;
    justify-content: center;
    gap: 3rem;
    padding-top: 2rem;
  }

  :global(.text p) {
    margin: 1rem 0;
  }
  .text__about {
    width: 60ch;
  }

  .rights {
    padding-bottom: 1rem;
    text-align: center;
    font-size: 0.9rem;
  }
</style>
