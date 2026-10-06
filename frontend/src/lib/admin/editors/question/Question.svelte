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
  import Thumb from '@c/Thumb.svelte';
  import Button from '@c/Button.svelte';
  import { thumbDeep, thumbFields, productThumb } from '@/thumb';

  export let id;

  let item;
  let itemOriginal;

  // (`itemId`: the item already open, read again - a new one's url still says '+')
  let opened = false; // marked read once, on opening: a reload (someone else's save, their "nieprzeczytane" too) doesn't
  async function read(itemId = id) {
    if (itemId == '+') {
      item = defaults();
    } else {
      const question = await api.items('questions').readOne(itemId, { fields });
      // opened: marked read (the menu stops asking for it) before it's shown
      if (!opened && question && !question.read) {
        // (its new `date_updated` too: the version this editor has, see overwrite.js)
        const marked = await api.items('questions').updateOne(itemId, { read: true }, { fields: ['date_updated'] });
        question.read = true;
        question.date_updated = marked.date_updated;
        heimdall.emit('questions', question.id); // (the id from the url is a string)
      }
      item = question;
    }
    opened = true;
    itemOriginal = item ? deep.copy(item) : null;
  }

  read();

  // the product it's about (a question keeps only its id: saving it doesn't touch the product); undefined while it
  // loads, null when it can't be read (a deleted product leaves no id behind: the link is cleared with it)
  let product;
  $: readProduct(item?.product);
  async function readProduct(id) {
    if (!id) return (product = null);
    if (product?.id === id) return;
    product = undefined;
    const fields = ['id', 'name', 'code', 'slug', ...thumbFields];
    const found = await api
      .items('products')
      .readOne(id, { fields, deep: thumbDeep })
      .catch(() => null);
    if (item?.product === id) product = found;
  }

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
    unsaved.set(changed);
  });
</script>

<Editor
  root="/admin/zapytania"
  icon="questions"
  title={item && [item.name, item.email].filter(Boolean).join(' | ')}
  collection="questions"
  removable={!!itemOriginal?.date_created}
  bind:item
  bind:itemOriginal
  reload={read}>
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
            <Blames {item} />
            {#if item.product}
              <h3 class="ui-h3">Produkt</h3>
              {#if product}
                <!-- the product asked about: opens it in a new tab (the question stays open here) -->
                <Button
                  size="lg"
                  dashed
                  start
                  width="100%"
                  title="Otwórz produkt"
                  on:click={() => window.open(`/admin/produkty/${product.slug}`, '_blank', 'noopener')}>
                  <span class="product">
                    <Thumb file={productThumb(product)} size="2.5rem" />
                    <span class="product__text">
                      <span class="product__name">{product.name}</span>
                      <span class="product__code">{product.code}</span>
                    </span>
                  </span>
                </Button>
              {:else if product === null}
                <p class="gone">Nie udało się wczytać produktu #{item.product}.</p>
              {/if}
            {/if}
          </div>
        </div>
      </div>
    </section>
  {/if}
</Editor>

<style>
  /* the product's thumbnail beside its name over its code (in a big dashed button) */
  .product {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
    text-align: left;
  }
  .product__text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.25;
  }
  .product .product__name,
  .product .product__code {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .product .product__name {
    font-weight: 700;
  }
  .product .product__code {
    font-size: 0.85rem;
    color: var(--ink-muted);
  }
  .gone {
    margin: 0;
    color: var(--grey-500);
  }
</style>
