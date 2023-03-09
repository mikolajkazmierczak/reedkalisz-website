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
    <div class="about">
      <h3>{about.name}</h3>
      {@html marked.parse(about.content)}
    </div>
    <div class="office">
      <h3>{office.name}</h3>
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
    margin-top: 2rem;
    min-height: 16rem;
    height: auto;
    width: 100%;
    background-color: var(--grey);
  }

  .columns {
    display: flex;
    justify-content: center;
    gap: 3rem;
    align-items: flex-start;
    padding: 2rem 8rem;
  }

  .about,
  .menu,
  .office {
    width: 30%;
  }

  .rights {
    padding-bottom: 1rem;
    text-align: center;
    font-size: 0.9rem;
  }
</style>
