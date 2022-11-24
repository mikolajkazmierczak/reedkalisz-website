<script>
  import { marked } from 'marked';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { SearchParams } from '$/searchparams';
  import { edit as fields, defaults } from '$/fields/menu_items';
  import { deep, slugify, diff } from '$/utils';

  import editing from '@/editors/editing';
  import { unsaved } from '@/stores';
  import { globals, users, menus, menu_items } from '@/globals';
  import Editor from '@/editors/Editor.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Blame from '@c/Blame.svelte';
  import Picker from '@c/library/Picker.svelte';
  import { onDestroy } from 'svelte';

  const searchParams = SearchParams.read();

  export let id;

  let item;
  let itemOriginal;

  let errorInvalidURL = false;

  $: hasChildren = $menu_items?.find(m => m.parent == item?.id);

  async function read() {
    await globals.update(menus);
    await globals.update(menu_items);
    if (slug == '+') {
      item = defaults();
      // add parent, index and menu from search params
      if (searchParams.parent != null) item.parent = searchParams.parent;
      if (searchParams.index != null) item.index = searchParams.index;
      if (searchParams.menu != null) item.menu = searchParams.menu;
    } else {
      item = (await api.items('menu_items').readOne(id, { fields })).data;
    }
    itemOriginal = item ? deep.copy(item) : null;
  }

  async function remove() {
    editing.remove('menu_items', item.id, { root: '/admin/menu' });
  }

  async function parseLink() {
    try {
      const pathname = new URL(item.url).pathname;
      if (pathname.startsWith('/produkty')) {
        const slug = pathname.split('/').pop();
        const filter = { slug: { _eq: slug } };
        const product = (await api.items('products').readByQuery({ filter })).data;
        startLookupTimeout();
        item.product = item.link;
      } else if (item.link.startsWith('/kategorie/')) {
        categoryURL = item.link;
      } else {
        pageURL = item.link;
      }
      errorInvalidURL = null;
    } catch (e) {
      errorInvalidURL = e.message;
    }
  }

  read();

  // let lookup = true;
  // let lookupTimeout = null;
  // function startLookupInterval() {
  //   clearTimeout(lookupTimeout);
  //   lookup = false;
  // }
  // lookupInterval = setInterval(()=>(lookup=true), 1000);
  // onDestroy(()=>clearInterval(lookupInterval));

  $: diff(item, itemOriginal, { editorPreset: true }).then(({ changed }) => {
    $unsaved = changed;
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
            <Input bind:value={item.name}>Nazwa</Input>
            <Input bind:value={item.url}>Link</Input>
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

          <div class="ui-box ui-box--uneditable">
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
  {/if}
</Editor>

<style>
  .img {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
    gap: 1rem;
  }
</style>
