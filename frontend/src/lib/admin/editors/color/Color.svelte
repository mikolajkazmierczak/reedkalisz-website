<script>
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { edit as fields, defaults } from '%/fields/colors';
  import { deep, diff } from '%/utils';

  import editing from '@/editors/editing';
  import { unsaved } from '@/stores';
  import { users } from '@/globals';
  import Editor from '@/editors/Editor.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Blame from '@c/Blame.svelte';

  export let id;

  let item;
  let itemOriginal;

  function remove() {
    editing.remove('colors', id, { root: '/admin/kolory' });
  }

  async function read() {
    if (id == '+') {
      item = defaults();
    } else {
      item = await api.items('colors').readOne(id, { fields });
    }
    itemOriginal = item ? deep.copy(item) : null;
  }

  read();

  $: diff(item, itemOriginal, { editorPreset: true }).then(({ changed }) => {
    $unsaved = changed;
  });

  heimdall.listen(({ match, me }) => {
    if (match('colors', id) && !me) {
      alert('UWAGA!\nKtoś właśnie wprowadził tu zmiany!\nZapisując nadpiszesz je.');
    }
  });
</script>

<Editor root="/admin/kolory" icon="colors" title={item?.name} collection="colors" bind:item bind:itemOriginal>
  {#if item}
    <section class="ui-section">
      <div class="ui-section__row">
        <div class="ui-section__col">
          <div class="ui-box">
            <div class="ui-pair">
              <Input type="checkbox" bind:value={item.enabled}>Widoczny</Input>
            </div>
            <Input bind:value={item.name}>Nazwa</Input>
            <div class="ui-pair">
              <Input bind:value={item.color}>Kolor <small>HEX</small></Input>
              <Input type="color" bind:value={item.color}>Wybierz</Input>
            </div>
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box">
            <Button icon="delete" on:click={remove} dangerous>Usuń</Button>
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
      </div>
    </section>
  {/if}
</Editor>
