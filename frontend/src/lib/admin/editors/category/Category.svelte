<script>
  import { onDestroy } from 'svelte';

  import api from '$/api';
  import socket from '$/heimdall';
  import { edited, save, cancel } from '@/stores';
  import editing from '@/editing';
  import { diff, getSearchParams } from '$/utils';
  import { updateGlobal, users, categories } from '@/global';
  import { edit as fields, defaults } from '$/fields/categories';

  import slugify from 'slugify';
  import { marked } from 'marked';
  import Editor from '@/editors/Editor.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Blame from '@c/Blame.svelte';
  import Picker from '@c/library/Picker.svelte';

  const searchParams = getSearchParams(['parent', 'index']);

  const fieldsToIgnore = ['user_created', 'date_created', 'user_updated', 'date_updated'];

  export let slug;

  let item;
  let itemOriginal;
  $: hasChildren = $categories?.find(category => category.parent == item?.id);

  $save = async () => {
    [item, itemOriginal] = await editing.save(
      'categories',
      item,
      itemOriginal,
      fields,
      fieldsToIgnore,
      item.slug != slug ? '/admin/kategorie/' + item.slug : null
    );
  };
  $cancel = async () => {
    [item, itemOriginal] = await editing.cancel(item, itemOriginal, '/admin/kategorie');
  };

  async function read() {
    await updateGlobal(categories);

    if (slug == '+') {
      item = defaults();
      // add parent and index from search params
      if (searchParams.parent !== null) item.parent = searchParams.parent;
      if (searchParams.index !== null) item.index = searchParams.index;
    } else {
      item = (await api.items('categories').readByQuery({ fields, filter: { slug: { _eq: slug } } })).data[0];
    }
    itemOriginal = item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async function deleteItem() {
    editing.del('categories', item.id, '/admin/kategorie', `Czy na pewno chcesz usunąć kategorię (${item.name})?`);
  }

  read();

  $: if (item) item.slug = slugify(item?.name, { lower: true, strict: true });
  $: correctSlug = item && !['+', ''].includes(item.slug);

  $: diff(item, itemOriginal, fieldsToIgnore).then(({ changed }) => {
    $edited = correctSlug && changed;
  });

  async function listener(data) {
    const { match, me } = socket.checkMatch(data, 'categories', item.id);
    if (match && !me) {
      // alert('UWAGA!\nKtoś właśnie wprowadził tu zmiany!\nZapisując nadpiszesz je.');
      console.log('UWAGA!\nKtoś właśnie wprowadził tu zmiany!\nZapisując nadpiszesz je.', data);
    }
  }
  socket.onChanges(listener);
  onDestroy(() => socket.offChanges(listener));
</script>

<Editor back="/admin/kategorie" icon="categories" title={item?.name}>
  {#if item}
    <section class="ui-section">
      <h2 class="ui-h2">Główne</h2>

      <div class="ui-section__row">
        <div class="ui-section__col">
          <div class="ui-box">
            <div class="ui-pair">
              <Input type="checkbox" bind:value={item.enabled}>Widoczny</Input>
            </div>
            <Input bind:value={item.name} error={item.name == '+' ? 'Nazwa zarezerwowana' : false}>Nazwa</Input>
          </div>

          <div class="ui-box">
            <h3 class="ui-h3">SEO</h3>
            <Input bind:value={item.seo_title}>Tytuł</Input>
            <Input type="textarea" bind:value={item.seo_description}>Opis</Input>
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box">
            <Button icon="delete" on:click={deleteItem} dangerous disabled={hasChildren}>Usuń</Button>
            {#if hasChildren}
              <p>
                Nie można usunąć kategorii, która ma podkategorie.<br />
                <small>Najpierw usuń lub wysuń wszystkie podkategorie na zewnątrz.</small>
              </p>
            {/if}
          </div>

          <div class="ui-box ui-box--uneditable">
            <h3 class="ui-h3">Bezpośredni link</h3>
            <a href="/kategorie/{item.slug}">/kategorie/{item.slug}</a>
            <h3 class="ui-h3">Dodano</h3>
            <p>
              {#if $users && item.date_created}
                <Blame user={item.user_created} datetime={item.date_created} />
              {:else}
                Tu będziesz ty
              {/if}
            </p>
            <h3 class="ui-h3">Zaktualizowano</h3>
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

    <section class="ui-section">
      <h2 class="ui-h2">Opis</h2>

      <div class="ui-section__row">
        <div class="ui-section__col ui-box" style:grid-column={'1 / span 4'}>
          <div class="ui-pair ui-texteditor">
            <div class="ui-texteditor__draft">
              <Input
                type="textarea"
                bind:value={item.description}
                rows={15}
                placeholder="Przed Tobą stoi puste płótno, zapełnij je czymś niezwykłym..."
              />
            </div>
            <div class="ui-texteditor__render">
              {#if item.description}
                {@html marked.parse(item.description)}
              {/if}
            </div>
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
