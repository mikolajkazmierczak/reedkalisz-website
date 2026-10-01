<script>
  import { swatch, colorMissing } from '$/colors';
  import api from '$/api';
  import { edit as fields, defaults } from '%/fields/colors';
  import { deep, diff } from '%/utils';

  import { unsaved } from '@/stores';
  import { globals, companies } from '@/globals';
  import Editor from '@/editors/Editor.svelte';
  import Blames from '@/editors/Blames.svelte';
  import Input from '@c/Input.svelte';
  import { companyOptions } from '@c/CompanySelect.svelte';
  import Tooltip from '$c/Tooltip.svelte';

  export let id;

  let item;
  let itemOriginal;

  async function read() {
    await globals.update(companies);

    if (id == '+') {
      item = defaults();
    } else {
      item = await api.items('colors').readOne(id, { fields });
    }
    itemOriginal = item ? deep.copy(item) : null;
  }

  read();

  $: diff(item, itemOriginal, { editorPreset: true }).then(({ changed }) => {
    unsaved.set(changed);
  });
</script>

<Editor
  root="/admin/kolory"
  icon="colors"
  title={item?.name}
  collection="colors"
  removable={!!itemOriginal?.date_created}
  bind:item
  bind:itemOriginal>
  {#if item}
    <section class="ui-section">
      <div class="ui-section__row">
        <div class="ui-section__col">
          <div class="ui-box">
            <h3 class="ui-h3">Nazwa</h3>
            <Input bind:value={item.name} />
          </div>
          <div class="ui-box">
            <div class="ui-pair">
              <div class="column">
                <Input bind:value={item.color}>Kolor <small>HEX</small></Input>
                <Input type="checkbox" bind:value={item.multicolor}>Wielokolorowy</Input>
                <Input type="checkbox" bind:value={item.transparent}>Przezroczysty</Input>
                <Input type="checkbox" bind:value={item.wood}>Drewno</Input>
                <Input type="checkbox" bind:value={item.neutral}>Neutralny</Input>
              </div>
              <div class="column">
                <Input type="color" bind:value={item.color}>Wybierz</Input>
                <!-- the colour as the website paints it, with its name on hover like there -->
                <div class="swatch" style:background={swatch(item)}>
                  <Tooltip backgroundColor="var(--light)" border="1px solid var(--black-50)">
                    <b>{item.name || 'Bez nazwy'}</b><br />
                    <small>Tak wygląda na stronie</small>
                  </Tooltip>
                </div>
                {#if colorMissing(item)}
                  <small class="missing">Brak koloru: na stronie jest biały</small>
                {/if}
              </div>
            </div>
            <Input type="select" bind:value={item.company} options={companyOptions($companies)}>Producent</Input>
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box ui-box--uneditable">
            <Blames {item} />
          </div>
        </div>
      </div>
    </section>
  {/if}
</Editor>

<style>
  .column {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .missing {
    color: var(--orange-700);
  }
  .swatch {
    cursor: help;
    position: relative;
    width: 3rem;
    aspect-ratio: 1;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px var(--black-20); /* over the colour, so it reaches the edge (see the table's) */
  }
</style>
