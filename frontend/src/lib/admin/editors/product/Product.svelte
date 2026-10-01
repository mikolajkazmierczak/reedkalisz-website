<script>
  import { marked } from 'marked';

  import api from '$/api';
  import heimdall from '$/heimdall';
  import { SearchParams } from '$/searchparams';
  import { edit as fields, defaults } from '%/fields/products';
  import { deep, slugify, diff } from '%/utils';
  import { getMinMaxPrices } from '%/calculationsPrices';

  import { unsaved } from '@/stores';
  import { tell } from '@/dialog';
  import { globals, companies, categories, commercialDetails } from '@/globals';
  import Editor from '@/editors/Editor.svelte';
  import Blames from '@/editors/Blames.svelte';
  import Input from '@c/Input.svelte';
  import { companyOptions } from '@c/CompanySelect.svelte';
  import Button from '@c/Button.svelte';
  import ProductPricing from './ProductPricing.svelte';
  import ProductStorage from './ProductStorage.svelte';
  import ProductFiles from './ProductFiles.svelte';
  import ApiBadge from '@c/ApiBadge.svelte';
  import {
    ancestorIds,
    categoryIndex,
    categoryLabels,
    categoryOptions as catOptions,
    mostSpecific,
    sortCategoryRows,
  } from '@/categories';
  import { removeUnusedFiles, usedFiles } from '@/files';
  import { syncsCategories, isManagedCategory, mappedCategories } from '@/sync';
  import { scannedProduct, scannerFields } from '@/snapshot';
  import BarButton, { barIconStroke } from '@c/BarButton.svelte';
  import CategoryCode from '@c/CategoryCode.svelte';
  import Select from '@c/Select.svelte';
  import { goto } from '$app/navigation';
  import { duplicateProduct } from './duplicate.js';
  import Loader from '$c/Loader.svelte';
  import Icon from '$c/Icon.svelte';

  const searchParams = SearchParams.read();

  export let slug;

  let item;
  let itemOriginal;

  let errors = { code: null, materials: null };
  $: commercialDetailsOptions =
    $commercialDetails &&
    [{ id: null, text: 'Brak', special: true }].concat($commercialDetails.map(({ id, name }) => ({ id, text: name })));

  let saleTooHigh = false; // (see ProductPricing)

  async function save(action) {
    if (saleTooHigh) {
      await tell('Cena w promocji nie może być wyższa od zwykłej. Popraw ją, żeby zapisać produkt.', {
        title: 'Nie zapisano',
        danger: true,
      });
      return;
    }
    try {
      // set min and max prices
      const minMaxPrices = getMinMaxPrices(item); // takes care of nullifying for privacy
      item.price_min = minMaxPrices.min;
      item.price_max = minMaxPrices.max;
      item.price_min_sale = minMaxPrices.minSale;
      item.price_max_sale = minMaxPrices.maxSale;
      // only the most specific categories, in the order of the tree
      item.categories = keepSpecific(item.categories);
      // remember every file the product ever used (the library shows where a file was used)
      item.images_history = [...new Set([...(item.images_history ?? []), ...usedFiles(item)])];
      // save
      await action();
      errors = { code: null, materials: null };
    } catch (e) {
      if (e.message == 'Field "code" has to be unique.') {
        errors.code = 'Kod musi być unikalny.';
      } else throw e;
    }
  }

  async function read() {
    await globals.update(companies);
    await globals.update(commercialDetails);
    await globals.update(categories);

    if (slug == '+') {
      item = defaults();
      // every product has a company: the one the list was narrowed to, or REED
      const picked = $companies.find((c) => c.id == searchParams.producent);
      item.company = (picked ?? $companies.find((c) => c.name === 'REED'))?.id ?? null;
      // add category from search params
      if (searchParams.c != null) item.categories = [...item.categories, { category: searchParams.c }];
    } else {
      const filter = { slug: { _eq: slug } };
      item = (await api.items('products').readByQuery({ fields, filter })).data[0];
    }
    itemOriginal = item ? deep.copy(item) : null;
  }

  // a deleted product takes its images along, unless something else uses them
  async function remove(action) {
    const files = [...usedFiles(itemOriginal)];
    if (!(await action())) return;
    const deleted = await removeUnusedFiles(files);
    if (deleted.length) heimdall.emit('directus_files', deleted);
  }

  // a copy of what is saved (see duplicate.js), then the copy in this editor
  let duplicating = false;
  async function duplicate() {
    duplicating = true;
    try {
      slug = await duplicateProduct(itemOriginal.id);
      await read();
      // in place of the original's entry: going back would show the copy under the original's url
      goto(`/admin/produkty/${slug}`, { noScroll: true, replaceState: true });
    } finally {
      duplicating = false;
    }
  }

  // the saved product as a PDF (see report.js: loaded on the first click, pdfmake is big)
  let reporting = false;
  async function report() {
    if (reporting) return;
    reporting = true;
    try {
      const { downloadAdminReport } = await import('./report.js');
      await downloadAdminReport(itemOriginal);
    } finally {
      reporting = false;
    }
  }

  $: company = $companies?.find((c) => c.id === item?.company);
  // what the API scanner overwrites (the product as saved, found in the company's last scan): locked, with a pill
  let scanned; // undefined while it loads
  // looked up again only for another product (opened or saved) or another scan of the company: re-run for the same
  // ones (Svelte sees every object as changed), it would go undefined and back on every update - and keep a product
  // editor being left busy forever, so it never went away (the page froze)
  let scannedFor = null;
  $: loadScanned(itemOriginal, company);
  async function loadScanned(product, company) {
    const key = [company?.id, company?.api_snapshot, company?.api_last_scan].join('|');
    if (scannedFor && scannedFor.product === product && scannedFor.key === key) return;
    const run = (scannedFor = { product, key });
    scanned = undefined;
    const found = await scannedProduct(product, company);
    if (scannedFor === run) scanned = found; // (not one saved, opened or scanned since)
  }
  $: scanner = scannerFields(item, company, scanned);
  $: categoriesSynced = scanner.categories && syncsCategories(company);
  $: categoryTargets = mappedCategories(company);
  // a product has only the most specific categories: picking a subcategory drops the one above it,
  // and what's above a picked one can't be picked
  $: catIndex = categoryIndex($categories);
  $: catLabels = categoryLabels($categories);
  $: takenCategories = new Set(
    (item?.categories ?? []).flatMap((c) => [c.category, ...ancestorIds(c.category, catIndex.parents)]),
  );
  // the product's own ones picked again are taken away; the ones above them can't be added (they'd be dropped)
  $: categoryOptions = catOptions(catLabels).map((o) => {
    const chosen = !!item?.categories.some((c) => c.category === o.id);
    const managed = chosen && isManaged({ category: o.id });
    return { ...o, chosen, disabled: (takenCategories.has(o.id) && !chosen) || managed };
  });
  // one the category mappings lead to: the scanner's, not to be taken away here
  $: isManaged = (productCategory) => categoriesSynced && isManagedCategory(productCategory, company, categoryTargets);
  let categoryToAdd = null;
  $: if (categoryToAdd != null) addCategory(categoryToAdd);

  function keepSpecific(rows) {
    const ids = mostSpecific(
      rows.map((r) => r.category),
      catIndex.parents,
    );
    return sortCategoryRows(
      rows.filter((r) => ids.includes(r.category)),
      catIndex.order,
    );
  }
  function addCategory(id) {
    categoryToAdd = null;
    if (!item.categories.some((c) => c.category === id)) {
      item.categories = keepSpecific([...item.categories, { category: id }]);
    }
  }

  // for the image picker: the product's files now, and before
  $: fileContext = item && {
    used: [...usedFiles(item)],
    history: (item.images_history ?? []).filter((id) => !usedFiles(item).has(id)),
  };

  const removeCategoryId = (id) => removeCategory(item.categories.findIndex((c) => c.category === id));
  function removeCategory(i) {
    if (i < 0) return;
    item.categories.splice(i, 1);
    item.categories = item.categories.map((c, i) => ({ ...c, index: i })); // update indexes
    item = item;
  }

  read();

  $: if (item)
    item.slug = slugify([item?.code, item?.name], {
      key: true,
      partsOriginal: [itemOriginal?.code, itemOriginal?.name],
      slugOriginal: itemOriginal?.slug,
    });

  $: correctSlug = item && !['+', ''].includes(item.slug);
  $: diff(item, itemOriginal, { editorPreset: true }).then(({ changed }) => {
    // (set, not `$unsaved =`: that would make the store an input of this statement, and two editors open at once
    // - the one being left and the next - would set it back and forth forever)
    unsaved.set(!errors.materials && correctSlug && item.company != null && changed);
  });
</script>

<Editor
  root="/admin/produkty"
  icon="products"
  title={item?.name}
  collection="products"
  bind:item
  bind:itemOriginal
  removable={!!itemOriginal?.date_created}
  {remove}
  {save}>
  <svelte:fragment slot="bar">
    {#if itemOriginal?.date_created}
      <BarButton
        disabled={reporting}
        title="Pobierz raport PDF: karta produktu w zapisanej wersji, tak jak na stronie"
        on:click={report}>
        <span slot="icon" class="icon">
          {#if reporting}<Loader dark />{:else}
            <Icon fill name="arrow_download" color="var(--text)" strokeWidth={barIconStroke} />
          {/if}
        </span>
        PDF
      </BarButton>
      <BarButton
        icon="copy"
        disabled={$unsaved || duplicating}
        title={$unsaved
          ? 'Najpierw zapisz albo cofnij zmiany'
          : 'Ukryta kopia jako produkt REED, z kolejnym numerem w kodzie i nazwie'}
        on:click={duplicate}>
        {duplicating ? 'Duplikuję...' : 'Duplikuj'}
      </BarButton>
    {/if}
  </svelte:fragment>
  {#if item}
    <section class="ui-section">
      <div class="ui-section__row">
        <div class="ui-section__col">
          <div class="ui-box">
            <div class="heading">
              <h3 class="ui-h3">Nazwa</h3>
              {#if scanner.name}
                <ApiBadge
                  edited={scanner.nameEdited}
                  text={scanner.nameEdited
                    ? 'Nazwa różni się od tej w API, więc skaner jej nie zmieni.'
                    : 'Skaner API ustawia nazwę, dopóki nie zostanie zmieniona tutaj.'}
                  restore={scanner.apiName}
                  on:click={() => (item.name = scanner.apiName)} />
              {/if}
            </div>
            <Input bind:value={item.name} />
          </div>
          <div class="ui-box">
            <div class="ui-pair">
              <Input bind:value={item.code} error={errors.code}>
                Kod{#if scanner.price}<small>API</small>{/if}
              </Input>
              <Input
                type="select"
                bind:value={item.company}
                options={companyOptions($companies)}
                placeholder="Wybierz producenta"
                error={item.company == null ? 'Wybierz producenta' : null}>
                Producent
              </Input>
            </div>
            <div class="toggles">
              <Input type="checkbox" bind:value={item.enabled}>Widoczny</Input>
              <Input type="checkbox" bind:value={item.new}>Nowość</Input>
              <Input type="checkbox" bind:value={item.bestseller}>Bestseller</Input>
            </div>
            <div class="toggles">
              <Input type="checkbox" bind:value={item.coming_soon}>Już wkrótce</Input>
              <Input type="checkbox" bind:value={item.out_of_stock}>Koniec nakładu</Input>
            </div>
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box">
            <h3 class="ui-h3">Kategorie</h3>
            <div class="categories">
              {#each item.categories as productCategory, i (productCategory.category)}
                {@const label = catLabels.get(productCategory.category)}
                <div class="ui-list category">
                  <span class="category__name" title={label?.path}>
                    {#if label}<CategoryCode code={label.number} />{/if}
                    {label?.name ?? `usunięta kategoria #${productCategory.category}`}
                  </span>
                  {#if isManaged(productCategory)}
                    <ApiBadge text="Prowadzi do niej mapowanie kategorii. Skaner API ją dodaje i usuwa." />
                  {/if}
                  <Button
                    size="sm"
                    icon="delete"
                    on:click={() => removeCategory(i)}
                    disabled={isManaged(productCategory)}
                    dangerous
                    square />
                </div>
              {/each}
            </div>
            <Select
              label="Dodaj kategorię"
              bind:value={categoryToAdd}
              options={categoryOptions}
              placeholder="Dodaj kategorię…"
              keepOpen
              on:unchoose={(e) => removeCategoryId(e.detail.value)} />
          </div>

          <div class="ui-box" class:admin-notes-filled={!!item.admin_notes}>
            <h3 class="ui-h3">Notatki</h3>
            <Input type="textarea" bind:value={item.admin_notes}></Input>
          </div>
        </div>

        <div class="ui-section__col">
          <div class="ui-box ui-box--uneditable">
            <h3 class="ui-h3">Link do strony</h3>
            {#if item.date_created}
              <a href="/produkty/{item.slug}" rel="noreferrer" target="_blank">/produkty/{item.slug}</a>
            {:else}
              /produkty/{item.slug || '...'}
            {/if}
            <Blames {item} />
          </div>
        </div>
      </div>
    </section>

    <section class="ui-section">
      <h2 class="ui-h2">Opis</h2>
      <div class="ui-section__row">
        <!-- as tall as the column on the right (at least a few lines): the text and its preview fill it -->
        <div class="ui-section__col ui-box description" style:grid-column={'1 / span 2'}>
          <div class="ui-pair ui-texteditor">
            <div class="ui-texteditor__draft">
              <Input
                type="textarea"
                bind:value={item.description}
                api={scanner.description}
                disabled={scanner.description}
                rows={4}
                placeholder="Przed Tobą stoi puste płótno, zapełnij je czymś niezwykłym..." />
            </div>
            <div class="ui-texteditor__render">
              {#if item.description}
                {@const post =
                  item.commercial_details !== null &&
                  $commercialDetails.find((c) => c.id === item.commercial_details).content}
                {@html marked.parse(item.description + (post ? '\n\n---\n\n' + post : ''))}
              {/if}
            </div>
          </div>
        </div>
        <div class="ui-section__col">
          <div class="ui-box">
            <h3 class="ui-h3">Paragraf</h3>
            <Input
              type="select"
              label="Paragraf"
              bind:value={item.commercial_details}
              options={commercialDetailsOptions} />
          </div>
          <div class="ui-box">
            <h3 class="ui-h3">Detale</h3>
            <div class="sizes">
              <Input
                type="number"
                min="0"
                step="0.01"
                bind:value={item.size_x}
                api={scanner.size_x}
                disabled={scanner.size_x}>
                Rozmiar <small>mm</small>
              </Input>
              {#each ['size_y', 'size_z'] as size}
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  bind:value={item[size]}
                  api={scanner[size]}
                  disabled={scanner[size]} />
              {/each}
            </div>
            <Input
              type="list"
              placeholder="np. stal;plastik"
              bind:value={item.materials}
              bind:error={errors.materials}
              api={scanner.materials}
              disabled={scanner.materials}
              listDisallowNumbers>
              Materiały
            </Input>
          </div>
        </div>
      </div>
    </section>

    <ProductPricing bind:product={item} productOriginal={itemOriginal} {scanner} bind:saleTooHigh />
    <ProductFiles title="Galeria" main bind:items={item.gallery} {fileContext} />
    <ProductStorage bind:product={item} {fileContext} {scanner} />
    <ProductFiles title="Załączniki" key="file" bind:items={item.attachments} {fileContext} />
  {/if}
</Editor>

<style>
  /* a box's heading with what goes with it at its right end */
  .heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
  }
  /* the category rows sit close, a thin line between them */
  .categories {
    display: flex;
    flex-direction: column;
    margin-bottom: -0.5rem; /* the picker right under the list, not a box's gap away */
  }
  .category {
    align-items: center;
    padding: 0.175rem 0;
  }
  .category + .category {
    border-top: var(--border-light);
  }
  .category__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sizes {
    display: flex;
    align-items: flex-end;
    gap: 1rem;
  }

  .description .ui-texteditor {
    flex: 1;
    min-height: 16rem;
  }
  /* the preview doesn't make the row taller (it scrolls): the row is as tall as the column on the right */
  .description .ui-texteditor__render {
    contain: size;
    height: auto;
  }

  /* a phone: the preview under the text, as tall as it was */
  @media (max-width: 50rem) {
    .description .ui-texteditor__draft {
      height: 12rem;
    }
    .description .ui-texteditor__render {
      contain: none;
      height: 16rem;
    }
  }

  .admin-notes-filled {
    background-color: var(--orange-100);
  }
  /* the spinner as big as the icon it stands in for */
  .icon :global(svg) {
    width: 100%;
  }
</style>
