<script>
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { SearchParams } from '$/searchparams';
  import { edit as fields, defaults } from '%/fields/menu_items';
  import { deep, diff, makeTree, treeFlatten } from '%/utils';

  import editing from '@/editors/editing';
  import { unsaved } from '@/stores';
  import { globals, users, menus, menuItems, categories } from '@/globals';
  import Editor from '@/editors/Editor.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Blame from '@c/Blame.svelte';
  import Picker from '@c/library/Picker.svelte';
  import MenuItemLink from './MenuItemLink.svelte';

  const searchParams = SearchParams.read();

  export let id;

  let item;
  let itemOriginal;

  $: hasChildren = $menuItems?.find(m => m.parent == item?.id);

  async function read() {
    await globals.update(menus);
    await globals.update(menuItems);
    await globals.update(categories);
    if (id == '+') {
      item = defaults();
      // add parent, index and menu from search params
      if (searchParams.parent != null) item.parent = searchParams.parent;
      if (searchParams.index != null) item.index = searchParams.index;
      if (searchParams.menu != null) item.menu = searchParams.menu;
    } else {
      item = await api.items('menu_items').readOne(id, { fields });
    }
    itemOriginal = item ? deep.copy(item) : null;
  }

  async function remove() {
    editing.remove('menu_items', item.id, {
      root: '/admin/menu',
      parent: item.parent,
      index: item.index,
      menu: item.menu
    });
  }

  read();

  $: categoriesTreeFlattened = $categories ? treeFlatten(makeTree($categories)) : null;

  let itemDiff = '';
  $: diff(item, itemOriginal, { editorPreset: true }).then(({ changed, html }) => {
    $unsaved = changed;
    itemDiff = html;
  });

  heimdall.listen(({ match, me, data }) => {
    if (match('menu_items', item.id) && !me) {
      // alert('UWAGA!\nKtoś właśnie wprowadził tu zmiany!\nZapisując nadpiszesz je.');
      console.log('UWAGA!\nKtoś właśnie wprowadził tu zmiany!\nZapisując nadpiszesz je.', data);
    }
  });
</script>

<Editor root="/admin/menu" icon="menu" title={item?.name} collection="menu_items" bind:item bind:itemOriginal>
  {#if item}
    <section class="ui-section">
      <div class="ui-section__row">
        <div class="ui-section__col">
          <div class="ui-box">
            <div class="ui-pair">
              <Input type="checkbox" bind:value={item.enabled}>Widoczny</Input>
              <Input type="checkbox" bind:value={item.folder}>Folder</Input>
            </div>
            <Input bind:value={item.name}>Tytuł</Input>
            <MenuItemLink bind:item categories={categoriesTreeFlattened} />
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box">
            <Button icon="delete" on:click={remove} dangerous disabled={hasChildren}>Usuń</Button>
            {#if hasChildren}
              <p>
                Nie można usunąć elementu menu, który ma podelementy.<br />
                <small>Najpierw usuń lub wysuń wszystkie podelementy na zewnątrz.</small>
              </p>
            {/if}
          </div>

          <div class="ui-box ui-box--uneditable" data-sveltekit-preload-data="off">
            <h3 class="ui-h3">Element</h3>
            {#if item.product}
              <div class="type">
                <small>PRODUKT</small>
                <a href="/produkty/{item.product.slug}" target="_blank" rel="noreferrer">{item.product.name}</a>
              </div>
            {:else if item.category}
              {@const category = categoriesTreeFlattened.find(c => c.id == item.category.id)}
              {@const categoryLabel = category._meta.path.map(p => p + 1).join('.') + ' ' + category.name}
              <div class="type">
                <small>KATEGORIA</small>
                <a href="/kategorie/{item.category.slug}" target="_blank" rel="noreferrer">{categoryLabel}</a>
              </div>
            {:else if item.page}
              <div class="type">
                <small>STRONA</small>
                <a href="/{item.page.slug}" target="_blank" rel="noreferrer">{item.page.name}</a>
              </div>
            {:else if item.url}
              <div class="type">
                <small>ZEWNĘTRZNY LINK</small>
                <a href={item.url} target="_blank" rel="noreferrer">{item.url}</a>
              </div>
            {:else}
              Tu będzie link
            {/if}
            <h3 class="ui-h3">Utworzenie</h3>
            <p>
              {#if $users && item.date_created}
                <Blame user={item.user_created} datetime={item.date_created} />
              {:else}
                Tu będziesz ty
              {/if}
            </p>
            <h3 class="ui-h3">Aktualizacja</h3>
            <p>
              {#if $users && item.date_updated}
                <Blame user={item.user_updated} datetime={item.date_updated} />
              {:else}
                Nie aktualizowano
              {/if}
            </p>
          </div>
        </div>

        <div class="ui-section__col">
          <div class="img">
            <Picker bind:selected={item.img} />
          </div>
        </div>
      </div>
    </section>

    <!-- <pre>{@html itemDiff}</pre> -->
  {/if}
</Editor>

<style>
  .img {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
    gap: 1rem;
  }
  .type {
    display: flex;
    flex-direction: column;
  }
</style>
