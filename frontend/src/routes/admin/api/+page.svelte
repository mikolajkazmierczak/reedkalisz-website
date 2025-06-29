<script>
  import { PUBLIC_BASE_URL } from '$env/static/public';
  import api, { baseUrl } from '$/api';
  import heimdall from '$/heimdall';
  import { dequal } from 'dequal';
  import { parseDatetime } from '%/datetime';
  import { capitalize } from '%/utils';
  import { defaults } from '%/fields/products';
  import { searchparams, SearchParams } from '$/searchparams';
  import { header } from '@/stores';
  import { globals, companies, colors, labelings, priceViews, globalMargins } from '@/globals';
  import { recalculateProducts } from '@/calculations';
  import { round, findColorId } from './utils.js';
  import { selected, countSelected, clearSelected } from './selected.js';
  import { merge } from './items.js';
  import { createLabelings } from './labelings.js';

  import Loader from '$c/Loader.svelte';
  import Pagination from '@c/Pagination.svelte';
  import Filters from '@c/Filters.svelte';
  import Button from '@c/Button.svelte';
  import Input from '@c/Input.svelte';
  import Search from '@c/Search.svelte';
  import Items from './Items.svelte';
  import LabelingsMappings from './labelings-mappings/LabelingsMappings.svelte';

  $header = { title: 'API', icon: 'api' };

  const searchParams = new SearchParams('/admin/api');
  $: [limit, page, query, company] = $searchparams.get(searchParams.pathname).values();
  // uh oh, be careful, the reactivity of the values above is wonky
  // if one of them changes, all of them change, this means triggering functions below

  let selectedCompany;

  const supportedCompanyNames = ['PAR', 'MidOcean', 'BlueCollection', 'Macma', 'EasyGifts', 'Promotionway', 'AXPOL'];
  $: supportedCompanies = $companies?.filter(c => supportedCompanyNames.includes(c.name));
  $: supportedCompanies && selectCompany();

  function selectCompany(id = null) {
    // `company` changes don't trigger this
    id = id || company;
    selectedCompany = supportedCompanies.find(c => c.id === id);
    searchParams.set({ c: id, p: 1 }); // also resets page
    clearSelected();
  }

  // set on filter change
  function handleCompanyChange(e) {
    selectCompany(e.detail.value.id);
  }

  // set default if unset of unsupported
  $: if (supportedCompanies && (!company || !supportedCompanies.find(c => c.id === company))) {
    selectCompany(supportedCompanies[0].id);
  }

  let fetching = false;
  let fetchingPhase = 1;
  let uploading = false;

  let dbItems;
  let apiItems;
  let sort = {
    nameFirst: true,
    dbFirst: false,
    notInApiFirst: true
  };

  let lastCompany = null;
  $: if (selectedCompany && selectedCompany.id !== lastCompany) {
    lastCompany = selectedCompany.id;
    fetchItems();
  }
  $: mergedItems = merge(selectedCompany, dbItems, apiItems, { sort, query });

  $: lastScan = parseDatetime(selectedCompany?.api_last_scan).str() ?? 'Nie skanowano';
  $: selectedCount = $selected && countSelected(mergedItems); // { items: 1, storages: 2, all: 3 }

  // TODO: add api_handling_costs the same way that api_discount works,
  //       but change the way they work so that you have to click save
  $: discount = selectedCompany?.api_discount ?? 0;

  async function handleDiscountChange(e) {
    let newDiscount = Number(e.target.value); // str
    if (newDiscount != selectedCompany.api_discount) {
      if (newDiscount < 0 || newDiscount > 100) newDiscount = 0;
      await api.items('companies').updateOne(selectedCompany.id, { api_discount: newDiscount });
      heimdall.emit('companies', selectedCompany.id);
    }
  }

  async function uploadColor(name, hex) {
    return await api.items('colors').createOne({
      enabled: true,
      name: capitalize(name),
      color: hex || null,
      company: selectedCompany.id
    });
  }

  // async function uploadImageAXPOL(url) {
  //   const urlsToTry = [
  //     `https://axpol.com.pl/files/fotov/${url}`,
  //     `https://axpol.com.pl/files/fotob/${url}`,
  //     `https://axpol.com.pl/files/foto_add_view/${url}`,
  //     `https://axpol.com.pl/files/foto_add_big/${url}`,
  //     `https://axpol.com.pl/files/foto_add_hr/${url}`,
  //     `https://axpol.com.pl/files/foto_add_lr/${url}`
  //   ];
  //   for (const u of urlsToTry) {
  //     console.log(`attempting image import ${u}`);
  //     const img = await fetch(u, {
  //       method: 'GET'
  //     });
  //     const blob = await img.blob();
  //     console.log(blob);

  //     // import the image from the url
  //     // then upload it to directus with api.files.createMany()
  //   }
  // }

  async function importImage(storage, img, index) {
    // try to import the image from different urls or throw\
    const AXPOL = selectedCompany.name === 'AXPOL';
    const urlsToTry = AXPOL
      ? [
          `https://axpol.com.pl/files/fotov/${img}`,
          `https://axpol.com.pl/files/fotob/${img}`,
          `https://axpol.com.pl/files/foto_add_view/${img}`,
          `https://axpol.com.pl/files/foto_add_big/${img}`,
          `https://axpol.com.pl/files/foto_add_hr/${img}`,
          `https://axpol.com.pl/files/foto_add_lr/${img}`
        ]
      : [img];

    for (const url of urlsToTry) {
      console.log(`attempting image import (${url})`);
      try {
        if (AXPOL) {
          const res = await fetch(`/admin/api/fetch-image-blob?url=${encodeURIComponent(url)}`);
          if (!res.ok) throw new Error(`- failed image import (${url})`);
          const blob = await res.blob();
          const form = new FormData();
          const file = new File([blob], `${storage._uid} ${index}`, { type: blob.type });
          form.append('file', file);
          const fileData = await api.files.createOne(form);
          console.log(`- successful image import (${url})`);
          return fileData.id;
        } else {
          const data = { title: `${storage._uid} ${index}` };
          const file = await api.files.import({ url, data });
          console.log(`- successful image import (${url})`);
          return file.id;
        }
      } catch (e) {
        console.warn(e);
      }
    }
  }

  async function uploadImages(storage) {
    const imgs = [];
    const failedImgs = [];

    await Promise.all(
      storage.img.map(async (img, index) => {
        try {
          const id = await importImage(storage, img, index);
          imgs.push({ index, img: id, enabled: true, show_in_gallery: true });
        } catch (e) {
          failedImgs.push(img);
        }
      })
    );

    if (failedImgs.length) alert(`UWAGA! Niektóre zdjęcia nie zostały zaimportowane: ${failedImgs}`);
    return { imgs };
  }

  async function uploadItem(item, newIds) {
    const selectedStorages = item.storage.filter(s => $selected.has(s._uid));

    for (const storage of selectedStorages) {
      // first upload all imgs in storage
      const { imgs } = await uploadImages(storage);
      storage.img = imgs;

      // then assign existing colors or upload new ones
      const tryGetColor = async (name, hex) => {
        if (!name) return null;
        // check if color exists
        const color = findColorId(name);
        if (color !== null) return color;
        // upload new color
        const newColor = await uploadColor(name, hex);
        $colors.push(newColor); // needed, because $colors does not update until emitting ids to heimdall
        newIds.colors.push(newColor.id);
        return newColor.id;
      };

      storage.color_first = await tryGetColor(storage.color_first, storage._color_first_hex);
      storage.color_second = await tryGetColor(storage.color_second, storage._color_second_hex);

      // disable the storage
      storage.enabled = false;
    }

    // lastly upload item
    if (item._db) {
      const storage = [...item.storage.filter(s => s._db), ...selectedStorages];
      const storageReindexed = storage.map((s, i) => ({ ...s, index: i }));
      await api.items('products').updateOne(item.id, { storage: storageReindexed });
      newIds.products.push(item.id);
    } else {
      const priceView = $priceViews.find(p => p.default);
      const prices = priceView.amounts.map(amount => ({ enabled: false, amount, price: null }));
      const storage = selectedStorages.map((s, i) => ({ ...s, index: i }));
      const newItem = {
        ...defaults(),
        ...item,
        enabled: false,
        api_enabled: true,
        company: selectedCompany.id,
        show_price: false,
        price_view: priceView.id,
        custom_prices: prices,
        custom_prices_sale: prices,
        global_full_margin: selectedCompany.id === 2, // MidOcean exception
        global_product_margin: selectedCompany.id !== 2, // MidOcean exception
        storage,
        labelings: item._labelings ? createLabelings(selectedCompany, item) : []
      };
      delete newItem.id; // '+' in defaults()
      const newProduct = await api.items('products').createOne(newItem);
      newIds.products.push(newProduct.id);
      if (newProduct.labelings.length) {
        recalculateProducts({ id: { _eq: newProduct.id } });
      }
    }
  }

  async function upload() {
    // items are uploaded synchronously because they might share colors
    if (!uploading && confirm(`Zaimportować ${selectedCount.all} elementów?`)) {
      uploading = true;
      const newIds = { products: [], colors: [] };
      const failedItems = [];
      for (const uid of $selected) {
        try {
          // note: if a storage is selected, the item is too
          const item = mergedItems.find(i => i._uid === uid);
          if (!item) continue; // which storages are selected is checked later based on the item
          await uploadItem(item, newIds);
        } catch (e) {
          console.log(`failed to import item (${uid}): ${e}`);
          failedItems.push(uid);
        }
      }
      if (newIds.products.length) heimdall.emit('products', newIds.products);
      if (newIds.colors.length) heimdall.emit('colors', newIds.colors);
      clearSelected();
      uploading = false;
      if (failedItems.length) alert(`UWAGA! Niektóre elementy nie zostały zaimportowane: ${failedItems}`);
    }
  }

  async function updatePricesAndStorages() {
    // update the price and storage amounts if they changed
    fetchingPhase = 2;
    const updates = [];
    const updatedItemsIds = { disabled: new Set(), changedPrice: new Set(), changedStorage: new Set() };

    for (const dbItem of dbItems) {
      const disableAndZeroStorage = s => {
        // disable and zero the amount of the storage (if not true already)
        if (s.enabled || s.amount !== 0) {
          updates.push(() => api.items('products_storage').updateOne(s.id, { enabled: false, amount: 0 }));
          updatedItemsIds.changedStorage.add(dbItem.id);
        }
      };

      const apiItem = apiItems.find(i => i.code == dbItem.code);
      if (apiItem) {
        // item exists in the api
        // update the price if it changed (or if manipulation from MidOcean changed)
        const apiPrice = round(apiItem.price);
        const priceChanged = dbItem.price !== apiPrice;
        const handlingCostChanged = dbItem.handling_cost !== apiItem.handling_cost;
        if (priceChanged || handlingCostChanged) {
          const productUpdates = { price: apiPrice, handling_cost: apiItem.handling_cost };
          updates.push(() => api.items('products').updateOne(dbItem.id, productUpdates));
          updatedItemsIds.changedPrice.add(dbItem.id);
        }

        for (const dbStorage of dbItem.storage) {
          const apiStorage = apiItem.storage.find(s => s.api_color_code == dbStorage.api_color_code);
          if (apiStorage) {
            // storage exists in the api
            // update the amount if it changed
            if (apiStorage.amount !== dbStorage.amount) {
              updates.push(() => api.items('products_storage').updateOne(dbStorage.id, { amount: apiStorage.amount }));
              updatedItemsIds.changedStorage.add(dbItem.id);
            }
          } else {
            // storage not in the api
            disableAndZeroStorage(dbStorage);
          }
        }
      } else {
        // item not in the api
        // disable the item
        if (dbItem.enabled) {
          updates.push(() => api.items('products').updateOne(dbItem.id, { enabled: false }));
          updatedItemsIds.disabled.add(dbItem.id);
        }
        // disable and zero amounts of all storages
        for (const dbStorage of dbItem.storage) {
          disableAndZeroStorage(dbStorage);
        }
      }
    }

    // await Promise.all(updates);
    // run updates sequentially to avoid overloading the server
    // TODO: batch updates instead of running them one by one
    for (const [i, update] of updates.entries()) {
      console.log(`Update ${i + 1}/${updates.length} completed`);
      await update();
    }

    return { ...updatedItemsIds, all: new Set(Object.values(updatedItemsIds).flat()) };
  }

  async function updatePricelists(ids) {
    // recalculate labeling prices for all items with the given ids
    fetchingPhase = 3;
    if (ids.length === 0) return;
    await recalculateProducts({ id: { _in: ids } });
  }

  async function updateDb() {
    // update prices and storages, then recalculate labeling prices, then fetch updated dbItems
    const updatedItemsIds = await updatePricesAndStorages();
    await updatePricelists(Array.from(updatedItemsIds.changedPrice));

    fetching = false; // this must be set before emitting heimdall events, or the product list won't reload
    heimdall.emit('products', Array.from(updatedItemsIds.all));
  }

  async function fetchApi() {
    if (fetching) return;
    fetching = true;
    fetchingPhase = 1;
    heimdall.ask(selectedCompany);
    // await updateDb(); // bypasses the first phase (commment out heimdall above!)
  }

  async function fetchDbItems() {
    const fields = [
      'id',
      'enabled',
      'name',
      'code',
      'slug',
      'price',
      'storage.id',
      'storage.enabled',
      'storage.amount',
      'storage.api_color_code',
      'storage.color_first',
      'storage.color_second'
    ];
    const filter = { company: { _eq: selectedCompany.id } };
    const res = await api.items('products').readByQuery({ fields, filter, limit: -1 });
    return res.data;
  }

  async function fetchApiItemsSnapshot() {
    const snapshotFileId = selectedCompany.api_snapshot;
    if (snapshotFileId) {
      const download = await fetch(`${baseUrl}/assets/${snapshotFileId}`);
      return await download.json();
    }
    return null;
  }

  async function fetchItems() {
    fetching = true;
    fetchingPhase = 0;
    [dbItems, apiItems] = await Promise.all([fetchDbItems(), fetchApiItemsSnapshot()]);
    fetching = false;
  }

  globals.update(companies);
  globals.update(colors);
  globals.update(priceViews);
  globals.update(globalMargins);
  globals.update(labelings);

  // triggered by fetchApi (heimdall.ask)
  heimdall.get(async data => {
    if (!data || data?.error) {
      alert('Wystąpił błąd podczas skanowania API, spróbuj ponownie. Jeśli problem się powtarza, daj znać.');
      window.location.reload(); // refresh window, might just be an expired token
      return;
    }

    const { items } = data;
    if (!items || items.length === 0) {
      fetching = false;
      throw Error(
        'API nie zwróciło żadnych produktów. Możliwe, że wprowadzono zmiany w strukturze API. Baza danych nie została zmodyfikowana.'
      );
    }

    const companyUpdates = {};

    const tryAddCompanyUpdate = (dbKey, key) => {
      // update if a given property was provided in the response and is different from the current value
      if (data?.[key] && !dequal(selectedCompany[dbKey], data[key])) companyUpdates[dbKey] = data[key];
    };
    tryAddCompanyUpdate('api_last_scan', 'lastScan');
    tryAddCompanyUpdate('api_discount', 'discount');
    tryAddCompanyUpdate('api_handling_costs', 'handlingCosts');

    // update or create snapshot if needed
    if (!dequal(items, apiItems)) {
      const formData = new FormData();
      const file = new Blob([JSON.stringify(items)], { type: 'application/json' });
      const fileName = `api_snapshot_${selectedCompany.name.toLowerCase()}.json`;
      formData.append('file', file, fileName);
      if (selectedCompany.api_snapshot) {
        // update snapshot
        await api.files.updateOne(selectedCompany.api_snapshot, formData);
      } else {
        // create snapshot
        const { id } = await api.files.createOne(formData);
        companyUpdates.api_snapshot = id;
      }
      heimdall.emit('directus_files', companyUpdates?.api_snapshot || selectedCompany.api_snapshot);
    }

    // update company if needed
    if (Object.keys(companyUpdates).length > 0) {
      await api.items('companies').updateOne(selectedCompany.id, companyUpdates);
      heimdall.emit('companies', selectedCompany.id);
    }

    apiItems = items;
    await updateDb();
  });

  heimdall.listen(async ({ data }) => {
    if (!fetching && data.collection == 'products') {
      fetching = true;
      fetchingPhase = 0;
      dbItems = await fetchDbItems();
      fetching = false;
    }
  });
</script>

<svelte:head>
  <title>Admin | API | REED Kalisz</title>
</svelte:head>

{#if supportedCompanies}
  <div class="actions">
    <div>
      <div>
        {#if selectedCount.all}
          <Button disabled={uploading} icon={uploading ? 'api' : 'add'} on:click={upload}>
            {uploading ? 'Dodawanie...' : 'Dodaj'}
          </Button>
        {/if}
        <Button icon="cloud" on:click={fetchApi}>Skanuj API</Button>
      </div>

      <Filters
        filters={supportedCompanies.map(c => ({ label: c.name, value: c }))}
        selected={selectedCompany}
        on:change={handleCompanyChange}
      />

      <p><b>Ostatni skan:</b>&nbsp;{lastScan}</p>

      {#if selectedCompany.api_discount !== null}
        <p>
          <b>Rabat:</b>&nbsp;<input
            class="discount"
            type="number"
            min="0"
            max="100"
            value={discount}
            on:input={handleDiscountChange}
          />&nbsp;%
        </p>
      {/if}
    </div>

    <Search {searchParams} {query} />
  </div>
{/if}

<div class="content">
  {#if fetching}
    {#if fetchingPhase === 0}
      <p class="aligned"><Loader dark /> Pobieranie danych</p>
    {:else if fetchingPhase === 1}
      <p class="aligned"><Loader dark /> Pobieranie zewnętrznych danych (1/3)</p>
      <small>Pobierana jest duża ilość danych, może to zająć kilka minut.</small>
    {:else if fetchingPhase === 2}
      <p class="aligned"><Loader dark /> Aktualizacja cen jednostkowych oraz stanów magazynowych (2/3)</p>
      <small>Może to zająć kilka minut.</small>
    {:else if fetchingPhase === 3}
      <p class="aligned"><Loader dark /> Aktualizacja cenników (3/3)</p>
      <small>Może to zająć kilka minut.</small>
    {/if}
  {/if}

  {#if !fetching && mergedItems && selectedCompany && $colors}
    {@const pagedItems = mergedItems.slice((page - 1) * limit, page * limit)}

    <div class="options">
      <h2>Produkty</h2>
      {#if selectedCount.all}
        <b>
          {selectedCount.items} produkt{selectedCount.items > 1 ? 'y' : ''}
          ({selectedCount.storages} kolor{selectedCount.storages > 1 ? 'ów' : ''})
        </b>
      {/if}
      <div class="sorting">
        <label><input type="radio" bind:group={sort.nameFirst} name="sortNameFirst" value={false} />Kod (A-Z)</label>
        <label><input type="radio" bind:group={sort.nameFirst} name="sortNameFirst" value={true} />Nazwa (A-Z)</label>
        <Input type="checkbox" bind:value={sort.notInApiFirst}>Najpierw wycofane</Input>
        <Input type="checkbox" bind:value={sort.dbFirst}>Najpierw zaimportowane</Input>
      </div>
    </div>

    {#if pagedItems.length === 0}
      <p>Brak wyników</p>
    {:else}
      <Items items={pagedItems} company={selectedCompany} />
    {/if}
  {/if}
</div>

{#if !fetching && mergedItems}
  <Pagination {searchParams} {limit} {page} count={mergedItems.length} />
{/if}

<LabelingsMappings apiCompany={selectedCompany} />

<!-- <div class="warning">
  <span>BETA</span>&nbsp;&nbsp;Porzućcie wszelką nadzieję, wy, którzy tu wchodzicie.
</div> -->

<style>
  label {
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 1rem;
    gap: 0.35rem;
  }
  input[type='number'] {
    margin: 0;
    padding: 0;
    width: 3rem;
    height: 1.5rem;
    padding: 0.2rem;
    text-align: center;
    font-size: 1rem;
    text-align: left;
  }
  input[type='radio'] {
    cursor: pointer;
    width: 1rem;
    height: 1rem;
    margin: 0;
    margin-right: 0.2rem;
  }
  p {
    display: flex;
    align-items: center;
    margin: 0;
  }
  .aligned {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

  .content {
    margin-left: 0.5rem;
  }

  .options {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  .sorting {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-weight: normal;
  }

  .warning {
    position: fixed;
    z-index: 5;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    border-radius: var(--border-radius);
    border: 2px solid var(--main);
    padding: 0.3rem 1rem;
    text-align: center;
    font-size: 0.9rem;
    color: hsl(200, 15%, 20%);
    background-color: var(--accent);
  }
  .warning span {
    font-weight: bold;
    color: var(--main);
  }
</style>
