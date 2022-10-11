<script>
  import { users } from '$lib/admin/global';
  import editing from '$lib/admin/editing';
  import { treeRefreshMetaAndParent, treeRemoveItemAtPath } from '$lib/utils';
  import socket from '$lib/admin/heimdall';

  import slugify from 'slugify';
  import { marked } from 'marked';
  import Input from '$lib/admin/input/Input.svelte';
  import Button from '$lib/admin/input/Button.svelte';
  import Blame from '$lib/admin/common/Blame.svelte';
  import Picker from '$lib/admin/library/Picker.svelte';

  export let items;
  export let item;

  $: if (item) item.slug = slugify(item?.name, { lower: true, strict: true });

  async function deleteItem() {
    editing.del('categories', item.id, null, null, () => {
      treeRemoveItemAtPath(items, item._meta.path);
      treeRefreshMetaAndParent(items);
      items = items;
    });
  }
</script>

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
        <Button icon="delete" on:click={deleteItem} dangerous>Usuń</Button>
      </div>

      <div class="ui-box ui-box--uneditable">
        <h3 class="ui-h3">Bezpośredni link</h3>
        <a href="/kategoritemie/{item.slug}">/kategorie/{item.slug}</a>
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

<style>
  .img {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
    gap: 1rem;
  }
</style>
