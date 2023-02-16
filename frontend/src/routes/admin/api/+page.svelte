<script>
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { parseDatetime, getISODate } from '$/datetime';
  import { searchparams, SearchParams } from '$/searchparams';
  import { header } from '@/stores';
  import { globals, companies, colors, priceViews } from '@/globals';
  import { capitalize } from '%/utils';
  import { defaults } from '%/fields/products';
  import { countSelected, findColorID, parseColors, merge } from './helpers';
  import { apiSnapshot, apiSnapshotDate, selected, expanded } from './stores';

  import Loader from '$c/Loader.svelte';
  import Pagination from '@c/Pagination.svelte';
  import Filters from '@c/Filters.svelte';
  import Button from '@c/Button.svelte';
  import Input from '@c/Input.svelte';
  import Search from '@c/Search.svelte';
  import { onMount } from 'svelte';

  $header = { title: 'API', icon: 'api' };

  const searchParams = new SearchParams('/admin/api');
  $: [limit, page, query, company] = $searchparams.get(searchParams.pathname).values();

  function setCompany(c) {
    searchParams.set({ c });
    company = c;
  }

  $: selectedCompany = company;
  $: if (selectedCompany == null && $companies) selectedCompany = $companies[0].id;
  $: selectedCompany != company && setCompany(selectedCompany);
  $: comp = $companies?.find(c => c.id == selectedCompany);

  let fetching = false;
  let uploading = false;

  let nameFirst = false;
  let dbFirst = true;

  let dbItems;
  let items;
  $: items = merge(dbItems, $apiSnapshot, { nameFirst, dbFirst, query });
  $: selectedCount = countSelected($selected);

  async function upload() {
    if (!uploading && confirm(`Zaimportować ${selectedCount} produktów?`)) {
      uploading = true;
      const codes = [...new Set($selected)];
      const colorsCopy = $colors; // $colors won't update each time a color is created so we need a copy
      const colorsIDs = [];
      const productsIDs = [];
      for (const code of codes) {
        const item = items.find(i => i.code == code);
        if (!item) continue;
        await uploadItem(item, codes, colorsCopy, colorsIDs, productsIDs);
      }
      if (colorsIDs.length) heimdall.emit('colors', colorsIDs);
      if (productsIDs.length) heimdall.emit('products', productsIDs);
      $selected = [];
      uploading = false;
    }
  }
  async function uploadItem(item, codes, colors, colorsIDs, productsIDs) {
    const selectedStorages = item.storage.filter(s => codes.includes(getFullCode(item, s)));

    for (const storage of selectedStorages) {
      // first upload all imgs in storage
      const imgs = [];
      for (const [i, img] of storage.img.entries()) {
        try {
          const file = await api.files.import({
            url: `https://www.par.com.pl${img}`,
            data: { title: `${comp.name} ${getFullCode(item, storage)} ${i}` }
          });
          imgs.push({
            index: i,
            img: file.id,
            enabled: true,
            show_in_gallery: true
          });
        } catch (e) {
          console.error(e);
        }
      }
      storage.img = imgs;

      // then create new colors in db if needed
      const getColor = async name => {
        if (!name) return null;
        const colorID = findColorID(colors, name);
        if (colorID) return colorID;
        // color doesn't exist yetalready exists
        const newColor = await api.items('colors').createOne({
          name: capitalize(name),
          color: '#ffffff',
          enabled: true
        });
        colors.push(newColor);
        colorsIDs.push(newColor.id);
        return newColor.id;
      };
      storage.color_first = await getColor(storage.color_first);
      storage.color_second = await getColor(storage.color_second);
    }

    // lastly upload item
    if (item.id) {
      const combinedStorages = [...item.storage.filter(s => s.id), ...selectedStorages];
      const itemData = { storage: combinedStorages.map((s, i) => ({ ...s, index: i })) };
      await api.items('products').updateOne(item.id, itemData);
      productsIDs.push(item.id);
    } else {
      const priceView = $priceViews.find(pv => pv.default);
      const prices = priceView.amounts.map(a => ({ enabled: false, amount: a, price: null }));
      const itemData = {
        ...defaults(),
        ...item,
        enabled: false,
        company: comp.id,
        api_enabled: true,
        price_view: priceView.id,
        show_price: false,
        custom_prices: prices,
        custom_prices_sale: prices,
        storage: selectedStorages.map((s, i) => ({ ...s, index: i }))
      };
      delete itemData.id;

      const newProduct = await api.items('products').createOne(itemData);
      productsIDs.push(newProduct.id);
    }
  }

  async function removeItem(item) {
    if (confirm(`OPERACJA NIEODWRACALNA!\nUsunąć produkt ${item.code}?`)) {
      await api.items('products').deleteOne(item.id);
      heimdall.emit('products', item.id);
    }
  }
  async function removeStorage(item, storage) {
    if (confirm(`OPERACJA NIEODWRACALNA!\nUsunąć wariant ${getFullCode(item, storage)}?`)) {
      const newData = {
        // filter out:
        // - all storages without id (not in db yet)
        // - storage that we want to delete
        storage: item.storage.filter(s => s.id && s.id != storage.id).map((s, i) => ({ ...s, index: i }))
      };
      await api.items('products').updateOne(item.id, newData);
      heimdall.emit('products', item.id);
    }
  }

  const getFullCode = (item, storage) => `${item.code}.${storage.api_color_code}`;

  function setValue(arrStore, val, add = true) {
    arrStore.update(arr => (add ? [...arr, val] : arr.filter(a => a != val)));
  }
  function toggleValue(arr, arrStore, val) {
    const set = arr.includes(val);
    setValue(arrStore, val, !set);
    return !set;
  }

  function toggleExpand(code) {
    toggleValue($expanded, expanded, code);
  }
  function toggleAddItem(item) {
    const newValue = toggleValue($selected, selected, item.code);
    item.storage.forEach(s => !s.id && setValue(selected, getFullCode(item, s), newValue));
  }
  function toggleAddStorage(item, storage) {
    const newValue = toggleValue($selected, selected, getFullCode(item, storage));
    if (newValue) setValue(selected, item.code, true);
    else {
      const noStorageSelected = item.storage.every(s => !$selected.includes(getFullCode(item, s)));
      if (noStorageSelected) setValue(selected, item.code, false);
    }
  }
  function toggleCheck(code) {
    let c = comp.api_checked;
    c = c.includes(code) ? c.filter(c => c != code) : [...c, code];
    api.items('companies').updateOne(comp.id, { api_checked: c });
    heimdall.emit('companies', comp.id);
  }

  async function dbLoad() {
    const fields = [
      'id',
      'name',
      'code',
      'slug',
      'storage.id',
      'storage.api_color_code',
      'storage.color_first',
      'storage.color_second'
    ];
    const filter = { company: { _eq: 1 } };
    dbItems = (await api.items('products').readByQuery({ fields, filter })).data;
  }

  async function fetchSnapshot(company) {
    if (fetching || !company) return;
    fetching = true;
    const fields = ['api_snapshot', 'api_snapshot_date'];
    const data = await api.items('companies').readOne(company.id, { fields });
    $apiSnapshot = data.api_snapshot;
    $apiSnapshotDate = data.api_snapshot_date;
    fetching = false;
    console.log($apiSnapshotDate);
  }
  async function fetchAPI() {
    if (fetching) return;
    fetching = true;
    heimdall.ask(comp.name);
  }

  globals.update(companies);
  globals.update(colors);
  globals.update(priceViews);
  // reload apiSnapshot
  $: if (!$apiSnapshot) fetchSnapshot(comp);
  heimdall.get(async data => {
    const time = getISODate();
    await api.items('companies').updateOne(comp.id, { api_snapshot: data, api_snapshot_date: time });
    $apiSnapshot = data;
    $apiSnapshotDate = time;
    fetching = false;
  });
  // reload dbItems
  heimdall.listen(async ({ data }) => {
    if (data.collection == 'products') await dbLoad();
  });
  onMount(async () => await dbLoad());
</script>

<svelte:head>
  <title>Admin | API | REED Kalisz</title>
</svelte:head>

{#if $companies}
  <div class="actions">
    <div>
      <div>
        {#if selectedCount}
          <Button disabled={uploading} icon={uploading ? 'api' : 'add'} on:click={upload}>
            {uploading ? 'Dodawanie...' : 'Dodaj'}
          </Button>
        {/if}
        <Button icon="cloud" on:click={fetchAPI}>Skanuj API</Button>
      </div>
      <Filters
        filters={$companies.map(({ id, name }) => ({ label: name, value: id })).filter(f => f.label == 'PAR')}
        bind:selected={selectedCompany}
      />
      <p><b>Ostatni skan:</b> {parseDatetime($apiSnapshotDate).str() ?? 'brak'}</p>
    </div>
    <Search {searchParams} {query} />
  </div>
{/if}

<div class="content">
  {#if !fetching && !items}
    <h2>Narzędzie API</h2>
    <p>Skanuj listę produktów zewnętrzengo dostawcy<br />i wybierz, które dodać do bazy danych.</p>
  {/if}

  {#if fetching}
    <p class="loader"><Loader dark />&nbsp;&nbsp;Trwa pobieranie danych</p>
    <small>Pobierana jest duża ilość danych.</small><br />
    <small>Może to potrwać do kilku minut.</small>
  {/if}

  {#if !fetching && items}
    {@const pagedItems = items.slice((page - 1) * limit, page * limit)}

    <h2>
      <span>Produkty {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
      <div class="sorting">
        <label><input type="radio" bind:group={nameFirst} name="nameFirst" value={false} />Kod (A-Z)</label>
        <label><input type="radio" bind:group={nameFirst} name="nameFirst" value={true} />Nazwa (A-Z)</label>
        <Input type="checkbox" bind:value={dbFirst}>Najpierw dodane</Input>
      </div>
    </h2>

    <table>
      {#each pagedItems as item}
        {@const apiURL = search => `https://www.par.com.pl/products?search=${search}`}
        {@const dbURL = slug => `/admin/produkty/${slug}`}
        {@const itemExpanded = $expanded.includes(item.code)}
        {@const itemSelected = $selected.includes(item.code)}
        {@const itemChecked = comp.api_checked.includes(item.code)}
        <tr
          class:db={item.id}
          class:removed={!item._api || item.storage.some(s => !s._api)}
          class:selected={itemSelected}
        >
          <td><input type="checkbox" checked={itemChecked} on:click={() => toggleCheck(item.code)} /></td>
          <td>
            {#if !item.storage.every(s => s.id)}
              {@const all = item.storage.every(s => $selected.includes(getFullCode(item, s)))}
              {@const some = item.storage.some(s => $selected.includes(getFullCode(item, s)))}
              <button on:click={() => toggleAddItem(item)}>{all ? '-' : some ? '/' : '+'}</button>
            {/if}
          </td>
          <td><b>{item._index + 1}</b></td>
          <td>
            {#if item.storage.length}
              <button on:click={() => toggleExpand(item.code)}>{itemExpanded ? '-' : `+${item.storage.length}`}</button>
            {/if}
          </td>
          <td>{item.code}</td>
          <td class="name">
            {#if item.id}
              <a href={dbURL(item.slug)} target="_blank" rel="noreferrer">{item.name}</a>
            {:else}
              {item.name}
            {/if}
          </td>
          <td><a class="onhover" href={apiURL(item.code)} target="_blank" rel="noreferrer">Strona producenta</a></td>
          <td>
            {#if item.id}
              <button class="onhover remove" on:click={() => removeItem(item)}>⨯</button>
            {/if}
          </td>
        </tr>

        {#if $colors && itemExpanded}
          {#each item.storage as storage}
            {@const fullCode = getFullCode(item, storage)}
            {@const storageSelected = $selected.includes(fullCode)}
            {@const storageChecked = comp.api_checked.includes(fullCode)}
            <tr class:db={storage.id} class:removed={!storage._api} class:selected={storageSelected}>
              <td><input type="checkbox" checked={storageChecked} on:click={() => toggleCheck(fullCode)} /></td>
              <td>
                {#if !storage.id}
                  <button on:click={() => toggleAddStorage(item, storage)}>{storageSelected ? '-' : '+'}</button>
                {/if}
              </td>
              <td><span style:opacity={0.65}>{storage._index + 1}</span></td>
              <td />
              <td>{fullCode}</td>
              <td class="name">{parseColors($colors, [storage.color_first, storage.color_second])}</td>
              <td><a class="onhover" href={apiURL(fullCode)} target="_blank" rel="noreferrer">Strona producenta</a></td>
              <td>
                {#if storage.id}
                  <button class="onhover remove" on:click={() => removeStorage(item, storage)}>⨯</button>
                {/if}
              </td>
            </tr>
          {/each}
        {/if}
      {/each}
    </table>
  {/if}
</div>

{#if !fetching && items}
  <Pagination {searchParams} {limit} {page} count={items.length} />
{/if}

<style>
  .content {
    margin-left: 0.5rem;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border-radius: var(--border-radius);
    border: var(--border-light);
    background-color: var(--light);
  }
  .actions > div {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  h2 {
    display: flex;
    margin-bottom: 0.5rem;
    gap: 1rem;
  }
  .sorting {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: normal;
  }
  p {
    margin: 0.5rem 0;
  }
  .loader {
    display: flex;
    align-items: center;
  }

  table {
    border-collapse: collapse;
    margin-left: -0.25rem;
  }
  tr {
    height: 30px;
  }
  tr.db {
    background-color: var(--accent-light);
  }
  tr.removed {
    background-color: var(--main-1);
  }
  tr.selected {
    background-color: var(--primary-white);
  }
  tr:hover {
    outline: 1px solid var(--accent);
  }

  td {
    text-align: left;
    margin: 0;
    padding: 0.1rem 0.25rem;
  }
  td,
  td * {
    font-family: monospace;
    font-size: 1rem;
  }

  a:hover {
    text-decoration: none;
  }
  button {
    cursor: pointer;
    width: 100%;
  }
  label {
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 1rem;
    gap: 0.35rem;
  }
  input {
    cursor: pointer;
    width: 1rem;
    height: 1rem;
  }
  input[type='radio'] {
    margin: 0;
    margin-right: 0.2rem;
  }
  .onhover {
    display: none;
  }
  tr:hover .onhover {
    display: inherit;
  }
  .remove {
    font-weight: bold;
    color: var(--main-3);
  }
</style>
