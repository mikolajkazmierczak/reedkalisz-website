<script>
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { ask } from '@/dialog';
  import { removeUnusedFiles, usedFiles } from '@/files';
  import globals, { colors, labelings, categories } from '@/globals';
  import { categoryIndex } from '@/categories';
  import { itemHealth } from './health.js';
  import { selected, toggleItemSelected, toggleStorageSelected } from './selected.js';
  import { getFlag, parseColors } from './utils.js';

  import Icon from '$c/Icon.svelte';
  import Button from '@c/Button.svelte';
  import Input from '@c/Input.svelte';
  import Float from '@c/table/Float.svelte';
  import HeadIcon from '@c/table/HeadIcon.svelte';
  import SortButton from '@c/table/SortButton.svelte';
  import Grid from '@c/table/Grid.svelte';
  import { productCodeWidth } from '@c/table/utils';
  import Tooltip from '$c/Tooltip.svelte';
  import Thumb from '@c/Thumb.svelte';
  import { productThumb, scanThumb } from '@/thumb';

  export let items;
  export let company;
  export let apiItems = null; // the whole scan: whether the supplier has categories at all
  export let sort; // { by: 'name' | 'code', desc, ... } (see items.js), set by the head's buttons
  export let scrollKey = null; // the page, search, company: another one scrolls the list back up (see Grid)

  // as a Table's: up, down, then back to by code (the list's own order)
  function sortBy(by) {
    if (sort.by !== by) sort = { ...sort, by, desc: false };
    else if (!sort.desc) sort = { ...sort, desc: true };
    else sort = { ...sort, by: 'code', desc: false };
  }

  // what a product will be missing (the "Komplikacje" column, see health.js): once per list, not per row update, and only
  // once our labelings and categories are there (without them every product would look like missing everything)
  globals.update(labelings);
  globals.update(categories);
  $: index = categoryIndex($categories);
  $: withCategories = (apiItems ?? []).some((i) => i._categories?.length);
  $: health =
    $labelings && $categories
      ? new Map(
          items.map((item) => [
            item,
            itemHealth(company, item._scan, { labelings: $labelings, index, withCategories }),
          ]),
        )
      : new Map();

  let expanded = new Set();
  $: flags = (() => {
    const { rejected, cut, check, todo, edit, inprogress, done } = company.api_flags ?? {}; // (none yet: a new company)
    return {
      _default: { text: 'Brak statusu' },
      check: { text: '🔍 Hmm', items: check || [] },
      rejected: { text: '❌ Odrzucony', items: rejected || [] },
      cut: { text: '♻️ Ma zamiennik', items: cut || [] },
      todo: { text: '💼 Do dodania', items: todo || [] },
      edit: { text: '✏️ Do edycji', items: edit || [] },
      inprogress: { text: '🔧 W budowie', items: inprogress || [] },
      done: { text: '✅ Gotowy', items: done || [] },
    };
  })();

  // the status select, coloured by the status; none is a button over the list (see Select), and an empty select
  $: flagOptions = Object.entries(flags).map(([id, { text }]) =>
    id === '_default' ? { id, text, special: true } : { id, text, color: flagColors[id] },
  );
  const flagColors = {
    _default: 'var(--light)',
    rejected: 'var(--red-100)',
    cut: 'var(--red-50)', // paler than rejected: it's been dealt with
    check: 'var(--purple-100)',
    todo: 'var(--orange-100)',
    edit: 'var(--yellow-100)',
    inprogress: 'var(--blue-100)',
    done: 'var(--green-100)',
  };

  async function handleStatusChange(newFlag, item) {
    const flag = getFlag(flags, item._uid);
    if (newFlag === flag) return void (flags = flags); // e.g. "Brak statusu" on one without any: its select back to empty
    // move uid to the selected flag
    if (flag != '_default') flags[flag].items = flags[flag].items.filter((uid) => uid != item._uid); // remove from previous flag
    if (newFlag != '_default') flags[newFlag].items.push(item._uid); // add to new flag
    // update company data, only upload flags that have items, { flag: [uid, uid, ...] }
    const api_flags = Object.fromEntries(
      Object.entries(flags)
        .filter(([key, { items }]) => items?.length)
        .map(([key, { items }]) => [key, items]),
    );
    // update company
    await api.items('companies').updateOne(company.id, { api_flags });
    heimdall.emit('companies', company.id);
  }

  function toggleExpanded(uid) {
    expanded.has(uid) ? expanded.delete(uid) : expanded.add(uid);
    expanded = expanded;
  }

  // a deleted product or variant takes its images along, unless something else uses them
  async function removeFiles(files) {
    const deleted = await removeUnusedFiles(files);
    if (deleted.length) heimdall.emit('directus_files', deleted);
  }

  const openProduct = (item) => window.open(`/admin/produkty/${item.slug}`, '_blank', 'noreferrer');
  // the supplier's search, also for what the api no longer has (their "not found" confirms it's gone)
  const openApi = (code, name) => window.open(getApiUrl(code, name), '_blank', 'noreferrer');

  async function toggleVisible(item) {
    item.enabled = !item.enabled;
    items = items;
    await api.items('products').updateOne(item.id, { enabled: item.enabled });
    heimdall.emit('products', item.id);
  }
  async function toggleStorageVisible(item, storage) {
    storage.enabled = !storage.enabled;
    items = items;
    await api.items('products_storage').updateOne(storage.id, { enabled: storage.enabled });
    heimdall.emit('products', item.id);
  }

  async function removeItem(item) {
    if (await ask(`Usunąć produkt ${item.code} ${item.name}? Tego nie można cofnąć.`, { ok: 'Usuń', danger: true })) {
      const files = [...usedFiles(item)];
      await api.items('products').deleteOne(item.id);
      heimdall.emit('products', item.id);
      await removeFiles(files);
    }
  }
  async function removeStorage(item, storage) {
    if (
      await ask(`Usunąć wariant ${storage.api_color_code ?? ''}? Tego nie można cofnąć.`, { ok: 'Usuń', danger: true })
    ) {
      await api.items('products').updateOne(item.id, {
        // filter out 1) the storage being deleted 2) all storages not in db
        // and reindex the storages
        storage: item.storage.filter((s) => s.id && s.id != storage.id).map((s, i) => ({ ...s, index: i })),
      });
      heimdall.emit('products', item.id);
      await removeFiles((storage.img ?? []).map((i) => i.img));
    }
  }

  function stripUsbSizes(input) {
    if (typeof input !== 'string') return input;
    return input.replace(/\s*\d+(?:\.\d+)?\s*[GT]B(?:\s*\/\s*\d+(?:\.\d+)?\s*[GT]B)*\s*$/i, '').trim();
  }

  function getApiUrl(code, name) {
    switch (company.name) {
      case 'PAR':
        return `https://www.par.com.pl/products?search=${code}`;
      case 'MidOcean':
        return `https://www.midocean.com/INTERSHOP/web/WFS/midocean-PL-Site/pl_PL/-/PLN/ViewParametricSearchBySearchIndex-Browse?SearchTerm=${code}`;
      case 'BlueCollection':
        return `https://bluecollection.gifts/pl/${code.split('-')[0]}.html`;
      case 'EasyGifts':
        return `https://www.easygifts.com.pl/search.php?dosearch=1&query=${code}`;
      case 'Macma':
        return `https://macma.pl/search.php?dosearch=1&query=${code}`;
      case 'Promotionway':
        return `https://promotionway.pl/search.php?query=${code}`;
      case 'AXPOL':
        return `https://axpol.com.pl/pl/search/?search=product&string=${code}`;
      case 'HappyBrands':
        // by name: a variant's code may have its product's in front ('605RM/605R01W'), which their search doesn't know
        return `https://happybrands.promo/searchProduct?name=${encodeURIComponent(name)}&category=0&color=&amount=`;
      case 'USBSystem':
        const productName = stripUsbSizes(name).replace(' ', '+');
        return `https://usbsystem.pl/?s=${productName}&post_type=product`;
      default:
        throw new Error('Company code not supported');
    }
  }
</script>

<!-- the number's 2rem fits 4 digits: no supplier has 10,000 products -->
<Grid
  columns="1.5rem 8.5rem 2rem 1.5rem 2.75rem 1.5rem 1.5rem 1.5rem {productCodeWidth} minmax(18rem, 1fr)"
  scrollKey={[scrollKey, sort]}>
  <svelte:fragment slot="head">
    <HeadIcon icon="delete" label="Usuwanie" />
    <span>Status</span>
    <span class="index head-index"><HeadIcon icon="number_symbol" label="Numer na liście" /></span>
    <HeadIcon icon="cloud" label={'Dostępność u producenta.\nKliknięcie otwiera jego wyszukiwarkę.'} />
    <HeadIcon icon="hierarchy" label="Warianty" />
    <HeadIcon icon="add" label="Importuj / Otwórz zaimportowany" />
    <HeadIcon icon="eye" label="Widoczność" />
    <HeadIcon icon="heart_pulse" label="Komplikacje" />
    {#each [{ by: 'code', label: 'Kod' }, { by: 'name', label: 'Nazwa' }] as { by, label }}
      <span class="sortable">
        <span>{label}</span>
        <SortButton {label} active={sort.by === by} desc={sort.desc} on:click={() => sortBy(by)} />
      </span>
    {/each}
  </svelte:fragment>

  {#each items as item}
    {@const itemNotAllInApi = item.storage.some((s) => !s._api)}
    {@const itemNotInApi = item.storage.every((s) => !s._api) || !item._api}
    {@const itemHasNew = item._db && item.storage.some((s) => !s._db)}
    {@const [cloudTone, cloudTitle] = itemNotInApi
      ? ['danger', 'Wycofany']
      : itemNotAllInApi && itemHasNew
        ? ['split', 'Wycofane i nowe kolory']
        : itemNotAllInApi
          ? ['warning', 'Wycofane kolory']
          : itemHasNew
            ? ['new', 'Nowe kolory']
            : ['success', 'Dostępny']}
    {@const itemSelected = $selected.has(item._uid)}
    {@const itemExpanded = expanded.has(item._uid)}
    {@const itemCompatible = !item?._incompatible}
    {@const flag = flags && getFlag(flags, item._uid)}
    <div class="row" class:selected={itemSelected}>
      <span>
        {#if item._db}
          <Button size="sm" dangerous icon="delete" title="Usuń produkt" on:click={() => removeItem(item)} />
        {/if}
      </span>
      <span>
        {#if flags}
          <Input
            size="small"
            type="select"
            label="Status"
            value={flag === '_default' ? null : flag}
            options={flagOptions}
            clearTo="_default"
            color={flagColors[flag]}
            on:change={(e) => handleStatusChange(e.detail.value, item)} />
        {/if}
      </span>
      <span class="index">{item._index + 1}</span>
      <Button
        size="sm"
        icon={itemNotInApi ? 'cloud_off' : 'cloud'}
        tone={cloudTone}
        title={cloudTitle}
        on:click={() => openApi(item.code, item.name)} />
      <span class="expand">
        {#if item.storage.length}
          <Button size="sm" dashed width="100%" on:click={() => toggleExpanded(item._uid)}>
            {itemExpanded ? '−' : `+${item.storage.length}`}
          </Button>
        {/if}
      </span>
      <span>
        {#if item._db}
          <Button
            size="sm"
            tone="info"
            icon="cube"
            title="Otwórz zaimportowany produkt"
            on:click={() => openProduct(item)} />
        {:else if itemCompatible}
          {@const all = item.storage.every((s) => $selected.has(s._uid))}
          {@const some = item.storage.some((s) => $selected.has(s._uid))}
          <Button
            size="sm"
            dashed={!some}
            icon={all ? 'checkmark' : some ? 'subtract' : 'add'}
            title="Zaznacz do dodania"
            on:click={() => toggleItemSelected(item)} />
        {/if}
      </span>
      <span>
        {#if item._db}
          <Button
            size="sm"
            tone={item.enabled ? 'info' : null}
            ghost={!item.enabled}
            icon={item.enabled ? 'eye' : 'eye_off'}
            title={item.enabled ? 'Widoczny, kliknij by ukryć' : 'Ukryty, kliknij by pokazać'}
            on:click={() => toggleVisible(item)} />
        {/if}
      </span>
      <span class="state">
        {#if health.get(item)}
          {@const { level, notes } = health.get(item)}
          <span class="warning">
            <Icon fill name="warning" color={level === 'red' ? 'var(--red-500)' : 'var(--orange-500)'} />
            <Tooltip
              >{#each notes as note, i}{#if i}<br />{/if}<small>{note}</small>{/each}</Tooltip>
          </span>
        {/if}
      </span>
      <span class="code"><Float title={item.code}>{item.code}</Float></span>
      <!-- its picture before its name: ours when imported, else the supplier's (straight from them, as in its scan) -->
      <span class="name ui-thumbed" class:hidden={item._db && !item.enabled}>
        <Thumb
          file={item._db ? productThumb(item) : null}
          src={item._db ? null : scanThumb(item._scan)}
          size="1.5rem"
          zoom
          blank />
        <Float>
          {item.name}
          {#if !itemCompatible}
            <span class="tag"><Icon height="1rem" name="cloud_dismiss" />Niekompatybilny</span>
          {/if}
        </Float>
      </span>
    </div>

    {#if $colors && itemExpanded}
      {#each item.storage as storage}
        {@const storageSelected = $selected.has(storage._uid)}
        {@const storageCompatible = !storage?._incompatible}
        <div class="row variant" class:selected={storageSelected}>
          <span>
            {#if storage._db}
              <Button
                size="sm"
                dangerous
                icon="delete"
                title="Usuń kolor"
                on:click={() => removeStorage(item, storage)} />
            {/if}
          </span>
          <span />
          <span class="index">{storage._index + 1}</span>
          <Button
            size="sm"
            icon={storage._api ? 'cloud' : 'cloud_off'}
            tone={storage._api ? 'success' : 'danger'}
            title={storage._api ? 'Dostępny' : 'Wycofany'}
            on:click={() => openApi(storage.api_color_code ?? item.code, item.name)} />
          <span />
          <span>
            {#if storage._db}
              <Button
                size="sm"
                tone="info"
                icon="cube"
                title="Otwórz zaimportowany produkt"
                on:click={() => openProduct(item)} />
            {:else if storageCompatible}
              <Button
                size="sm"
                dashed={!storageSelected}
                icon={storageSelected ? 'checkmark' : 'add'}
                title="Zaznacz do dodania"
                on:click={() => toggleStorageSelected(item, storage)} />
            {/if}
          </span>
          <span>
            {#if storage._db}
              <Button
                size="sm"
                tone={storage.enabled ? 'info' : null}
                ghost={!storage.enabled}
                icon={storage.enabled ? 'eye' : 'eye_off'}
                title={storage.enabled ? 'Widoczny, kliknij by ukryć' : 'Ukryty, kliknij by pokazać'}
                on:click={() => toggleStorageVisible(item, storage)} />
            {/if}
          </span>
          <span />
          <span class="code"><Float title={storage.api_color_code}>{storage.api_color_code}</Float></span>
          <span class="name" class:hidden={storage._db && !storage.enabled}>
            <Float>
              {$colors && parseColors(storage.color_first, storage.color_second)}
              {#if !storageCompatible}
                <span class="tag"><Icon height="1rem" name="cloud_dismiss" />Niekompatybilny</span>
              {/if}
            </Float>
          </span>
        </div>
      {/each}
    {/if}
  {/each}
</Grid>

<style>
  .sortable {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  span {
    font-size: 0.9rem;
  }
  .index {
    text-align: right;
    font-size: 0.8rem;
    font-variant-numeric: tabular-nums;
    color: var(--grey-500);
  }
  .head-index {
    display: flex;
    justify-content: flex-end;
  }
  /* a warning, as big as a small button's icon, in the middle of the column */
  .state {
    display: flex;
    justify-content: center;
  }
  .warning {
    cursor: help;
    display: flex;
    width: 1.1rem;
    height: 1.1rem;
  }
  .variant .index {
    opacity: 0.65;
  }
  /* the Float inside cuts and floats the text */
  .code,
  .name {
    min-width: 0;
  }
  .code {
    font-family: monospace;
  }
  .variant .name {
    padding-left: 1rem;
  }
  .name.hidden {
    color: var(--grey-500);
  }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0 0.25rem;
    border-radius: var(--border-radius);
    corner-shape: squircle;
    font-size: 0.8rem;
    background-color: var(--red-100);
  }
</style>
