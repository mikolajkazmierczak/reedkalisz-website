<script>
  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { deep, treeFlatten } from '%/utils';
  import Menu from '#/menu/Menu.svelte';

  import { layout, modified } from '#/layout/store';
  import { create, parseLayout, parseBack } from '#/layout/utils';
  import ElementLabels from '#/layout/ElementLabels.svelte';
  import Element from '#/layout/Element.svelte';
  import Title from '#/layout/elements/Title.svelte';
  import Tiles from '#/layout/elements/tiles/Tiles.svelte';
  import Category from '#/layout/elements/Category.svelte';
  import Whitespace from '#/layout/elements/Whitespace.svelte';

  const types = [
    { type: 'title', label: 'Tytuł', icon: 'text_t' },
    { type: 'tiles', label: 'Kafelki', icon: 'apps' },
    { type: 'category', label: 'Kategoria', icon: 'categories' },
    { type: 'whitespace', label: 'Przerwa', icon: 'arrow_maximize_vertical' }
  ];

  export let data;

  let originalLayout = [];
  let parsedLayout = [];

  $: refresh(data); // DO NOT just assign `data.layout` to `parsedLayout` because all hell breaks loose
  $: $layout = parseBack(deep.copy(parsedLayout));
  $: $modified = !deep.same(originalLayout, $layout);

  $: ({ categoriesTree } = $page.data);
  $: categories = treeFlatten(categoriesTree).map(({ slug, name, _meta }) => {
    const path = _meta.path.map(p => p + 1).join('.');
    return { id: slug, text: `${path} ${name}` };
  });

  function refresh(data) {
    const loadLayout = deep.copy(data.layout);
    if (!deep.same(originalLayout, loadLayout)) {
      originalLayout = loadLayout;
      parsedLayout = parseLayout(deep.copy(loadLayout));
    }
  }

  function handleDelete(id) {
    parsedLayout = parsedLayout.filter(e => e._id !== id);
  }

  function handleAdd(e, id = null) {
    const createElement = type => {
      if (type === 'title') {
        return create.title({ title: 'Tytuł' });
      } else if (type === 'tiles') {
        return create.tiles({ tiles: [] });
      } else if (type === 'category') {
        const slug = categories[0].id;
        return create.category({ slug });
      } else if (type === 'whitespace') {
        return create.whitespace();
      }
    };

    const element = createElement(e.detail.type);
    if (id === null) {
      parsedLayout = [element, ...parsedLayout];
    } else {
      const i = parsedLayout.findIndex(e => e._id === id);
      parsedLayout.splice(i + 1, 0, element);
      parsedLayout = parsedLayout;
    }
  }

  function handleMove(e, id) {
    const direction = e.detail.direction; // 'up' or 'down'

    const i = parsedLayout.findIndex(e => e._id === id);
    const j = direction === 'up' ? i - 1 : i + 1;

    if (j >= 0 && j < parsedLayout.length) {
      [parsedLayout[i], parsedLayout[j]] = [parsedLayout[j], parsedLayout[i]];
      parsedLayout = parsedLayout;
    }
  }

  beforeNavigate(navigation => {
    if ($modified) {
      if (confirm('Zmiany nie zostały zapisane. Czy na pewno chcesz opuścić stronę?')) {
        $modified = false;
      } else navigation.cancel();
    }
  });
</script>

<svelte:head>
  <!-- TODO: those should be fragments (or a singleton? but probably a bad idea) -->
  <title>REED Kalisz</title>
  <meta
    name="description"
    content="Firma Reed przedstawia gadżety dla firm, takie jak długopisy reklamowe, kalendarze czy kubki. Oferujemy również cyfrowy druk niskonakładowy i grawerowanie laserowe."
  />
</svelte:head>

<div class="wrapper">
  <Menu items={data.menus.side} />

  <main>
    <ElementLabels {types} on:add={e => handleAdd(e)} />
    {#each parsedLayout as element}
      {@const { _id: id, type } = element}
      <Element bind:element {types} {type} on:delete={() => handleDelete(id)} on:move={e => handleMove(e, id)}>
        {#if type === 'title'}
          <Title bind:element />
        {:else if type === 'category'}
          <Category bind:element {categories} />
        {:else if type === 'whitespace'}
          <Whitespace />
        {:else if type === 'tiles'}
          <Tiles bind:element />
        {/if}
      </Element>
      <ElementLabels {types} on:add={e => handleAdd(e, id)} />
    {/each}
  </main>
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: 18rem 1fr 18rem;
    column-gap: 3rem;
  }
  main {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    width: 100%;
  }
  main {
    padding: 4.5rem 0;
  }
</style>
