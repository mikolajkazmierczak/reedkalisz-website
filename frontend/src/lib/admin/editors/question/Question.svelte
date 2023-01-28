<script>
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { edit as fields, defaults } from '%/fields/questions';
  import { deep, diff } from '%/utils';

  import editing from '@/editors/editing';
  import { unsaved } from '@/stores';
  import { users } from '@/globals';
  import Editor from '@/editors/Editor.svelte';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Blame from '@c/Blame.svelte';
  import Picker from '@c/library/Picker.svelte';

  export let id;

  let item;
  let itemOriginal;

  function remove() {
    editing.remove('questions', id, { root: '/admin/zapytania' });
  }

  async function read() {
    if (id == '+') {
      item = defaults();
      item.spam_chance = 0; // admin user is creating this so...
    } else {
      item = await api.items('questions').readOne(id, { fields });
    }
    itemOriginal = item ? deep.copy(item) : null;
  }

  read();

  $: diff(item, itemOriginal, { editorPreset: true }).then(({ changed }) => {
    $unsaved = changed;
  });

  heimdall.listen(({ match, me }) => {
    if (match('questions', id) && !me) {
      alert('UWAGA!\nKtoś właśnie wprowadził tu zmiany!\nZapisując nadpiszesz je.');
    }
  });
</script>

<Editor
  root="/admin/zapytania"
  icon="questions"
  title={item?.name + (item?.name && item?.email ? ' | ' : '') + item?.email}
  collection="questions"
  bind:item
  bind:itemOriginal
>
  {#if item}
    <section class="ui-section">
      <div class="ui-section__row">
        <div class="ui-section__col">
          <div class="ui-box">
            <Input bind:value={item.name}>Imię i nazwisko</Input>
            <Input bind:value={item.email}>Email</Input>
            <Input bind:value={item.phone}>Telefon</Input>
            <Input type="textarea" rows="20" bind:value={item.content}>Treść</Input>
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box">
            <Button icon="delete" on:click={remove} dangerous>Usuń</Button>
          </div>

          <div class="ui-box ui-box--uneditable">
            {#if item.from_contact || item.from_product}
              <h2>Zapytanie z formularza ({item.from_contact ? 'Kontakt' : 'Produkt'})</h2>
              Szansa na spam:<span style:color={item.spam_chance > 80 ? 'var(--main)' : 'var(--text)'}>
                {item.spam_chance}%
              </span>
            {:else}
              <h2>Zapytanie wewnętrzne</h2>
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
          <Picker bind:selected={item.file} />
        </div>
      </div>
    </section>
  {/if}
</Editor>
