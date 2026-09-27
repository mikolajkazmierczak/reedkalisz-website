<script>
  import { goto } from '$app/navigation';
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { edit as fields, defaults } from '%/fields/questions';
  import { deep, diff } from '%/utils';

  import { unsaved } from '@/stores';
  import Editor from '@/editors/Editor.svelte';
  import BarButton from '@c/BarButton.svelte';
  import Blames from '@/editors/Blames.svelte';
  import Input from '@c/Input.svelte';
  import Picker from '@c/library/Picker.svelte';

  export let id;

  let item;
  let itemOriginal;

  async function read() {
    if (id == '+') {
      item = defaults();
      item.spam_chance = 0; // admin user is creating this so...
    } else {
      const question = await api.items('questions').readOne(id, { fields });
      // opened: marked read (the menu stops asking for it) before it's shown
      if (question && !question.read) {
        await api.items('questions').updateOne(id, { read: true });
        question.read = true;
        heimdall.emit('questions', question.id); // (the id from the url is a string)
      }
      item = question;
    }
    itemOriginal = item ? deep.copy(item) : null;
  }

  read();

  // back to the list, unread, to come back to
  let marking = false;
  async function unread() {
    marking = true;
    try {
      await api.items('questions').updateOne(item.id, { read: false }); // (`id` stays '+' after the first save)
      heimdall.emit('questions', item.id);
      goto('/admin/zapytania', { noScroll: true });
    } finally {
      marking = false;
    }
  }

  $: diff(item, itemOriginal, { editorPreset: true }).then(({ changed }) => {
    $unsaved = changed;
  });
</script>

<Editor
  root="/admin/zapytania"
  icon="questions"
  title={item && [item.name, item.email].filter(Boolean).join(' | ')}
  collection="questions"
  removable={!!itemOriginal?.date_created}
  bind:item
  bind:itemOriginal>
  <svelte:fragment slot="bar">
    {#if itemOriginal?.date_created}
      <BarButton
        icon="mail_unread"
        disabled={$unsaved || marking}
        title={$unsaved ? 'Najpierw zapisz albo cofnij zmiany' : null}
        on:click={unread}>
        Oznacz jako nieprzeczytane
      </BarButton>
    {/if}
  </svelte:fragment>
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
          <div class="ui-box ui-box--uneditable">
            {#if item.from_contact || item.from_product}
              <h2>Zapytanie z formularza ({item.from_contact ? 'Kontakt' : 'Produkt'})</h2>
              Szansa na spam:<span style:color={item.spam_chance > 80 ? 'var(--red-500)' : 'var(--text)'}>
                {item.spam_chance}%
              </span>
            {/if}
            <Blames {item} />
          </div>
        </div>

        <div class="ui-section__col">
          <Picker bind:selected={item.file} backing="var(--grey-100)" />
        </div>
      </div>
    </section>
  {/if}
</Editor>
