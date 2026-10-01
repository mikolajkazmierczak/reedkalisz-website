<script>
  import { onDestroy } from 'svelte';
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { SearchParams, searchparams } from '$/searchparams';
  import { parseDatetime } from '%/datetime';
  import { defaults } from '%/fields/products';
  import { getUid } from '%/uid';
  import { capitalize } from '%/utils';
  import { recalculateProducts, recalculateProductsGenerator } from '@/calculations';
  import { categories, colors, companies, globalMargins, globals, labelings, priceViews } from '@/globals';
  import { categoryIndex, sortCategoryRows } from '@/categories';
  import { mappedLabelings, syncsCategories, syncsLabelings } from '@/sync';
  import { dequal } from 'dequal';
  import { planCategories, resolveCategories } from '../categories.js';
  import { merge, retiredOf } from '../items.js';
  import { indexScan, scanProduct, scanVariant } from '@/match';
  import { detailsFields, planDetails } from '@/details';
  import { removeUnusedFiles, usedFiles } from '@/files';
  import { appending, arrangeGallery, imageTitle, importSource, planImages, seedImages } from '../images.js';
  import { createLabelings, planLabelings } from '../labelings.js';
  import { clearSelected, countSelected, selected } from '../selected.js';
  import { findColorId, round } from '../utils.js';
  import { ask, guardLeaving, tell } from '@/dialog';

  import Loader from '$c/Loader.svelte';
  import Button from '@c/Button.svelte';
  import Input from '@c/Input.svelte';
  import Pagination from '@c/Pagination.svelte';
  import Search from '@c/Search.svelte';
  import CompanyBar from '../CompanyBar.svelte';
  import Bar from '../mappings/Bar.svelte';
  import Items from '../Items.svelte';
  import NewImages from '../NewImages.svelte';
  import {
    apiCompanyId,
    fetchSnapshot,
    labelingCodes,
    scanRequest,
    storeSnapshot,
    supportedCompanies as supportedOf,
  } from '../company.js';

  const searchParams = new SearchParams('/admin/api/produkty');
  $: [limit, page, query, company] = $searchparams.get(searchParams.pathname).values();
  // uh oh, be careful, the reactivity of the values above is wonky
  // if one of them changes, all of them change, this means triggering functions below

  let selectedCompany;

  $: supportedCompanies = $companies && supportedOf($companies);
  $: supportedCompanies && refreshCompany();

  function refreshCompany() {
    // an edit of the company (a status, the discount, a scan) only refreshes it: the page and the picked items stay
    const fresh = selectedCompany && supportedCompanies.find((c) => c.id === selectedCompany.id);
    if (fresh) selectedCompany = fresh;
    else selectCompany();
  }

  function selectCompany(id = null) {
    // `company` changes don't trigger this
    id = id || company;
    selectedCompany = supportedCompanies.find((c) => c.id === id);
    if (!selectedCompany) return;
    discountInvalid = false;
    $apiCompanyId = id; // the other tabs open on it too
    searchParams.set({ c: id, p: 1 }); // also resets page
    clearSelected();
  }

  // set on filter change
  function handleCompanyChange(e) {
    selectCompany(e.detail.id);
  }

  // set default if unset of unsupported: the one picked in another tab, or the first one
  $: if (supportedCompanies && (!company || !supportedCompanies.find((c) => c.id === company))) {
    selectCompany(supportedCompanies.find((c) => c.id === $apiCompanyId)?.id ?? supportedCompanies[0].id);
  }

  let fetching = false;
  let fetchingPhase = 1;
  let uploading = false;

  // loading the products is just `fetching`, a scan (phases 1-3) writes to the database
  $: scanning = fetching && fetchingPhase > 0;

  guardLeaving(() => scanning, {
    message: 'Skanowanie jest w toku. Jeśli opuścisz stronę, przerwiesz je w połowie zapisywania zmian.',
  });

  let statusLog = null;
  let newImages = []; // found by the last scan, waiting for approval: [{ product, known, candidates }]
  let addingImages = false;
  let importImages = null; // the images of the products about to be imported, to look through first: { groups, decide }
  let deletingRetired = false;

  let dbItems;
  let apiItems;
  let sort = {
    by: 'name',
    desc: false,
    dbFirst: false,
    notInApiFirst: true,
  };

  let lastCompany = null;
  $: if (selectedCompany && selectedCompany.id !== lastCompany) {
    lastCompany = selectedCompany.id;
    fetchItems();
  }
  $: mergedItems = merge(selectedCompany, dbItems, apiItems, { sort, query });

  $: lastScan = parseDatetime(selectedCompany?.api_last_scan).str() ?? 'Nie skanowano';
  $: selectedCount = $selected && countSelected(mergedItems); // { items: 1, storages: 2, all: 3 }
  // what the api no longer has: whole products (the "Wycofany" tag in the list),
  // and variants of the products it still has ("Wycofane kolory")
  $: ({ inDb, products: retired, variants: retiredVariants } = retiredOf(selectedCompany, dbItems, apiItems));
  $: retiredCount = retired.length + retiredVariants.length;

  $: categoriesIndex = $categories ? categoryIndex($categories) : null;

  // TODO: make api_handling_costs editable here like api_discount
  $: discount = selectedCompany?.api_discount ?? 0;

  // saved once the admin stops typing (2s) or leaves the field, for the company it was typed for
  let discountTimer;
  let discountInvalid = false; // empty or not 0-100: outlined, not saved (as 0 the next scan would drop the discount)
  function discountTyped(e) {
    clearTimeout(discountTimer);
    const [id, value] = [selectedCompany.id, e.target.value];
    discountTimer = setTimeout(() => saveDiscount(id, value), 2000);
  }
  function discountLeft(e) {
    clearTimeout(discountTimer);
    saveDiscount(selectedCompany.id, e.target.value);
  }
  async function saveDiscount(id, value) {
    const newDiscount = Number(value);
    discountInvalid = value === '' || Number.isNaN(newDiscount) || newDiscount < 0 || newDiscount > 100;
    if (discountInvalid) return;
    if (newDiscount === $companies.find((c) => c.id === id)?.api_discount) return;
    // a scan started right now (the scan button takes the focus from the field) uses it
    if (selectedCompany?.id === id) selectedCompany = { ...selectedCompany, api_discount: newDiscount };
    await api.items('companies').updateOne(id, { api_discount: newDiscount });
    heimdall.emit('companies', id);
  }

  async function uploadColor(name, hex) {
    return await api.items('colors').createOne({
      name: capitalize(name),
      color: hex || null,
      company: selectedCompany.id,
    });
  }

  function planImport(item, picked, scan) {
    // what importing a product takes: its picked variants, and the images they'll download - not the ones refused
    // before, nor the ones it has already (another variant of it shows them, `files`: source -> file id); a new
    // product's gallery too (an imported one's comes with the scan, see planImages)
    // -> { selectedStorages, inDb, known, files, sources: Map(source -> { title, storages }), gallery: [source] }
    const selectedStorages = item.storage.filter((s) => picked.has(s._uid));
    const inDb = { ...item, storage: item.storage.filter((s) => s._db) }; // the listing mixes in the api's variants
    // images already there count as known, so the next scan doesn't offer them again
    const known = item._db ? structuredClone(item.api_images ?? seedImages(inDb, scan)) : {};
    const used = usedFiles(inDb);
    const files = new Map(
      Object.entries(known).flatMap(([source, { file }]) => (used.has(file) ? [[source, file]] : [])),
    );
    const sources = new Map();
    for (const storage of selectedStorages) {
      [...new Set(storage.img)]
        .filter((source) => !known[source]?.rejected)
        .forEach((source, index) => {
          if (files.has(source)) return;
          if (!sources.has(source)) sources.set(source, { title: imageTitle(item, storage, index), storages: [] });
          sources.get(source).storages.push(storage);
        });
    }
    // (the gallery's first, as the site shows it)
    const gallery = item._db ? [] : [...new Set(item.gallery ?? [])].filter((source) => source && !sources.has(source));
    const all = new Map(
      gallery.map((source, index) => [source, { title: imageTitle(item, null, index), storages: [] }]),
    );
    for (const [source, entry] of sources) all.set(source, entry);
    return { selectedStorages, inDb, known, files, sources: all, gallery };
  }

  function reviewImages(plans) {
    // the images about to be downloaded, looked through by an admin first (see NewImages) -> Map(item uid ->
    // Map(source -> 'rejected' | 'later')), none when there's nothing to look at
    const groups = [...plans]
      .filter(([, plan]) => plan.sources.size)
      .map(([item, plan]) => ({
        product: item,
        href: item._db ? `/admin/produkty/${item.slug}` : null,
        candidates: [...plan.sources].map(([source, { title, storages }]) => ({ source, title, storages })),
      }));
    if (!groups.length) return new Map();
    return new Promise((resolve) => {
      importImages = {
        groups,
        decide: (decided) => {
          importImages = null;
          resolve(
            new Map(
              groups.map((group, i) => [
                group.product._uid,
                new Map(
                  group.candidates.map((c, j) => [
                    c.source,
                    !decided ? 'later' : decided[i].candidates[j].rejected ? 'rejected' : null,
                  ]),
                ),
              ]),
            ),
          );
        },
      };
    });
  }

  async function uploadImages(storage, plan, decisions, failed) {
    // import the variant's images, remembering which file each api image became (see images.js); one the product's
    // other variants show too is imported once (`files`: source -> file id, or its promise), one an admin rejected is
    // left out for good, one left for later isn't known yet - the next scan offers it
    const { known, files } = plan;
    const sources = [...new Set(storage.img)].filter((source) => !known[source]?.rejected);
    const imgs = [];
    for (const source of sources) {
      const decision = decisions?.get(source);
      if (decision === 'rejected') known[source] = { rejected: true };
      if (decision) continue;
      // named after the place it takes (the one shown in the review, unless some before it were left out)
      if (!files.has(source))
        files.set(source, importSource(source, imageTitle(plan.inDb, storage, imgs.length), selectedCompany.id));
      const file = await files.get(source);
      if (!file) {
        failed.push(source);
        continue;
      }
      imgs.push({ index: imgs.length, img: file, enabled: true, show_in_gallery: true });
      known[source] = { file };
    }
    return imgs;
  }

  async function uploadGallery(item, plan, decisions, failed) {
    // a new product's own images (see uploadImages), the first one its main
    const rows = [];
    for (const source of plan.gallery) {
      const decision = decisions?.get(source);
      if (decision === 'rejected') plan.known[source] = { rejected: true };
      if (decision) continue;
      const file = await importSource(source, imageTitle(item, null, rows.length), selectedCompany.id);
      if (!file) {
        failed.push(source);
        continue;
      }
      rows.push({ index: rows.length, img: file, enabled: true, main: !rows.length });
      plan.known[source] = { file, gallery: true };
    }
    return rows;
  }

  const codeTaken = 'ten kod ma już inny produkt';

  async function uploadItem(item, plan, decisions, newIds, failedImages) {
    const { selectedStorages, inDb, known } = plan;

    if (!item._db && item.code) {
      // a code is unique across all the suppliers: one another product has would fail the import, but only once its
      // images were downloaded (and its new colours added)
      const filter = { code: { _eq: item.code } };
      const { data } = await api.items('products').readByQuery({ fields: ['id'], filter, limit: 1 });
      if (data.length) throw new Error(codeTaken);
    }

    for (const storage of selectedStorages) {
      // first upload all imgs in storage
      storage.img = await uploadImages(storage, plan, decisions, failedImages);

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

      if (storage.multicolored) {
        // "multicolored" is a colour of ours now
        storage.color_first = $colors.find((c) => c.multicolor)?.id ?? null;
        storage.color_second = null;
      } else {
        storage.color_first = await tryGetColor(storage.color_first, storage._color_first_hex);
        storage.color_second = await tryGetColor(storage.color_second, storage._color_second_hex);
      }

      storage.enabled = true; // shown as soon as its product is
    }

    const gallery = item._db ? [] : await uploadGallery(item, plan, decisions, failedImages);
    const imported = [...new Set([...selectedStorages.flatMap((s) => s.img), ...gallery].map((i) => i.img))];

    // lastly upload item
    if (item._db) {
      const storage = [...item.storage.filter((s) => s._db), ...selectedStorages];
      const storageReindexed = storage.map((s, i) => ({ ...s, index: i }));
      const history = [...new Set([...(item.images_history ?? usedFiles(inDb)), ...imported])];
      await api.items('products').updateOne(item.id, {
        storage: storageReindexed,
        api_images: known,
        images_history: history,
      });
      newIds.products.push(item.id);
    } else {
      const priceView = $priceViews.find((p) => p.default);
      const prices = priceView.amounts.map((amount) => ({ enabled: false, amount, price: null }));
      const storage = selectedStorages.map((s, i) => ({ ...s, index: i }));
      const categoryIds = resolveCategories(selectedCompany.api_categories_mappings, item._categories, categoriesIndex);
      const newItem = {
        ...defaults(),
        ...item,
        enabled: false,
        company: selectedCompany.id,
        commercial_details: 1, // "NETTO"
        show_price: false,
        price_view: priceView.id,
        custom_prices: prices,
        custom_prices_sale: prices,
        global_full_margin: selectedCompany.id === 2, // MidOcean exception
        global_product_margin: selectedCompany.id !== 2, // MidOcean exception
        storage,
        gallery,
        labelings: item._labelings ? createLabelings(selectedCompany, item) : [],
        categories: sortCategoryRows(
          categoryIds.map((category) => ({ category })),
          categoriesIndex.order,
        ),
        api_images: known,
        images_history: imported,
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
    const { items, storages } = selectedCount;
    if (uploading || !(await ask(`Zaimportować ${items} produktów (${storages} wariantów)?`, { ok: 'Importuj' })))
      return;
    uploading = true;
    const picked = new Set($selected); // what was picked when it started, whatever clears it meanwhile
    const newIds = { products: [], colors: [] };
    const failedItems = [];
    const failedImages = [];
    try {
      // note: if a storage is selected, the item is too; which storages are is checked later based on the item
      const pickedItems = [...picked].map((uid) => mergedItems.find((i) => i._uid === uid)).filter(Boolean);
      const scan = indexScan(apiItems);
      const plans = new Map(pickedItems.map((item) => [item, planImport(item, picked, scan)]));
      const decisions = await reviewImages(plans);
      for (const item of pickedItems) {
        try {
          await uploadItem(item, plans.get(item), decisions.get(item._uid), newIds, failedImages);
        } catch (e) {
          console.log(`failed to import item (${item._uid}): ${e}`);
          failedItems.push(e.message === codeTaken ? `${item._uid} (${codeTaken})` : item._uid);
        }
      }
      if (newIds.products.length) heimdall.emit('products', newIds.products);
      if (newIds.colors.length) heimdall.emit('colors', newIds.colors);
      clearSelected();
    } finally {
      uploading = false;
    }
    if (failedItems.length)
      tell(`Nie zaimportowano: ${failedItems.join(', ')}`, { title: 'Niektóre produkty się nie zaimportowały' });
    if (failedImages.length)
      tell(`Nie pobrano:\n${[...new Set(failedImages)].join('\n')}`, {
        title: 'Niektóre zdjęcia się nie zaimportowały',
      });
  }

  function chunked(list, size = 100) {
    const chunks = [];
    for (let i = 0; i < list.length; i += size) chunks.push(list.slice(i, i + size));
    return chunks;
  }

  async function updatePricesAndStorages(previousItems, afterWriting) {
    // update the price and storage amounts if they changed, the name, description, sizes, materials and images too,
    // and make the labelings and categories follow the api (for companies with mappings)
    fetchingPhase = 2;
    const updatedItemsIds = {
      disabled: new Set(),
      enabled: new Set(),
      changedPrice: new Set(),
      changedStorage: new Set(),
      changedLabelings: new Set(),
      changedCategories: new Set(),
      changedDetails: new Set(),
      changedImages: new Set(),
    };

    // a scan without any labelings (or categories) at all means the api broke, not that they all went away
    // (and without our labelings or categories loaded every managed one would look unwanted)
    const syncLabelings = syncsLabelings(selectedCompany) && $labelings && apiItems.some((i) => i._labelings?.length);
    const syncCategories =
      syncsCategories(selectedCompany) && categoriesIndex && apiItems.some((i) => i._categories?.length);
    const labelingsChanges = { create: [], remove: [] }; // the updates go into the patches below
    const labelingTargets = mappedLabelings(selectedCompany, labelingCodes(apiItems));
    const categoriesChanges = { create: [], remove: [] };
    const removedImages = []; // image rows gone from the api
    const removedGallery = []; // (the gallery's)
    newImages = [];

    // the changed fields of each row, all sent at the end (only once the scan is to be written, see below)
    const patches = {
      products: new Map(),
      products_storage: new Map(),
      products_labeling: new Map(),
      products_categories: new Map(),
      products_image: new Map(),
    };
    const patch = (collection, id, data) => patches[collection].set(id, { ...patches[collection].get(id), ...data });

    // our products and variants in this scan and the one before (see match.js)
    const scan = indexScan(apiItems);
    const previousScan = indexScan(previousItems);

    const disableAndZeroStorage = (dbItem, s) => {
      // disable and zero the amount of the storage and clear `available` flag -> whether anything changed
      if (!(s.enabled || s.amount !== 0 || s.available)) return false;
      patch('products_storage', s.id, { enabled: false, amount: 0, available: false });
      updatedItemsIds.changedStorage.add(dbItem.id);
      return true;
    };
    // what an api failing for a moment would look like (see below): variants gone, stock dropping to nothing
    const outage = { goneVariants: 0, stocked: 0, emptied: 0 };

    for (const dbItem of dbItems) {
      const uid = getUid(selectedCompany.name, dbItem);
      const isDone = selectedCompany.api_flags?.done?.includes(uid);

      const apiItem = scanProduct(dbItem, scan);
      if (apiItem) {
        // item exists in the api
        // update the price if it changed (or if manipulation from MidOcean changed); some apis have no prices
        const apiPrice = apiItem.price == null ? null : round(apiItem.price);
        const priceChanged = (dbItem.price ?? null) !== apiPrice;
        const apiHandlingCost = apiItem.handling_cost ?? null; // most apis have none
        const handlingCostChanged = (dbItem.handling_cost ?? null) !== apiHandlingCost;
        if (priceChanged || handlingCostChanged) {
          patch('products', dbItem.id, { price: apiPrice, handling_cost: apiHandlingCost });
          updatedItemsIds.changedPrice.add(dbItem.id);
        }
        // re-enable the item if it was marked as done
        if (isDone && !dbItem.enabled) {
          patch('products', dbItem.id, { enabled: true });
          updatedItemsIds.enabled.add(dbItem.id);
        }

        const details = planDetails(dbItem, apiItem, scanProduct(dbItem, previousScan));
        if (Object.keys(details).length) {
          patch('products', dbItem.id, details);
          updatedItemsIds.changedDetails.add(dbItem.id);
        }
        if (syncLabelings && apiItem._labelings) {
          const plan = planLabelings(selectedCompany, dbItem, apiItem, labelingTargets);
          if (plan.create.length || plan.update.length || plan.remove.length) {
            labelingsChanges.create.push(...plan.create);
            labelingsChanges.remove.push(...plan.remove);
            for (const { id, data } of plan.update) patch('products_labeling', id, data);
            updatedItemsIds.changedLabelings.add(dbItem.id);
          }
        }
        if (syncCategories) {
          const plan = planCategories(selectedCompany, dbItem, apiItem, categoriesIndex);
          if (plan.create.length || plan.update.length || plan.remove.length) {
            categoriesChanges.create.push(...plan.create);
            categoriesChanges.remove.push(...plan.remove);
            for (const { id, data } of plan.update) patch('products_categories', id, data);
            updatedItemsIds.changedCategories.add(dbItem.id);
          }
        }
        const images = planImages(dbItem, scan);
        if (images.known || !dbItem.images_history) {
          // bookkeeping of the images: what the api has, what the admin removed
          const data = { api_images: images.known ?? dbItem.api_images };
          if (!dbItem.images_history) data.images_history = [...usedFiles(dbItem)];
          patch('products', dbItem.id, data);
        }
        let product = dbItem; // as it is after this scan (the images to approve are added to that)
        if (images.remove.length || images.removeGallery.length) {
          removedImages.push(...images.remove);
          removedGallery.push(...images.removeGallery);
          updatedItemsIds.changedImages.add(dbItem.id);
        }
        if (images.removeGallery.length) {
          // the rest renumbered, the first the main (the removed one may have been it)
          const gallery = arrangeGallery(dbItem.gallery.filter((g) => !images.removeGallery.includes(g.id)));
          for (const { id, index, main, changed } of gallery) if (changed) patch('products_image', id, { index, main });
          product = { ...dbItem, gallery };
        }
        if (images.candidates.length) {
          const known = images.known ?? dbItem.api_images;
          const place = appending(); // how they'll be named, if all are added (see addNewImages)
          const gallery = { img: product.gallery }; // (its places, as a variant's)
          const candidates = images.candidates.map((c) => ({
            ...c,
            // a place in each variant it goes to, or in the gallery - the api's first there leads it (see addNewImages)
            ...(c.storages.length
              ? { title: imageTitle(dbItem, c.storages[0], c.storages.map(place)[0]) }
              : { title: imageTitle(dbItem, null, place(gallery)), lead: c.source === apiItem.gallery?.[0] }),
          }));
          newImages.push({ product, href: `/admin/produkty/${dbItem.slug}`, known, candidates });
        }

        for (const dbStorage of dbItem.storage) {
          const apiStorage = scanVariant(dbStorage, scan);
          if (apiStorage) {
            // storage exists in the api
            const storageUpdates = {};
            // update the amount if it changed
            if (dbStorage.amount !== apiStorage.amount) {
              storageUpdates.amount = apiStorage.amount;
            }
            if (dbStorage.amount > 0) outage.stocked++;
            if (dbStorage.amount > 0 && !(apiStorage.amount > 0)) outage.emptied++;
            // re-enable the storage if the item was marked as done
            if (isDone && !dbStorage.enabled) {
              storageUpdates.enabled = true;
            }
            if (Object.keys(storageUpdates).length > 0) {
              patch('products_storage', dbStorage.id, storageUpdates);
              updatedItemsIds.changedStorage.add(dbItem.id);
            }
          } else if (disableAndZeroStorage(dbItem, dbStorage)) {
            // storage not in the api: counted only when this scan zeroes it, not when an earlier one did
            outage.goneVariants++;
          }
        }
      } else {
        // not in the api any more: hidden and zeroed
        if (dbItem.enabled) {
          patch('products', dbItem.id, { enabled: false });
          updatedItemsIds.disabled.add(dbItem.id);
        }
        for (const dbStorage of dbItem.storage) disableAndZeroStorage(dbItem, dbStorage);
      }
    }

    // A lot gone at once - products, variants, or the stock of what is in stock - is more likely the api failing for a
    // moment than the supplier retiring them: then nothing is written until an admin says so (the scan can be
    // repeated later). Stock changes every day, so it takes a quarter of the stocked variants emptied.
    const hiding = updatedItemsIds.disabled.size;
    const { goneVariants, stocked, emptied } = outage;
    const lines = [
      hiding > 25 && `${hiding} widocznych produktów zniknęło z API - zostałyby ukryte.`,
      goneVariants > 25 && `${goneVariants} wariantów zniknęło z API - zostałyby wyzerowane.`,
      emptied > 25 && emptied > stocked / 4 && `${emptied} z ${stocked} wariantów na stanie straciłoby cały stan.`,
    ].filter(Boolean);
    if (lines.length) {
      const question =
        `${lines.join('\n')}\n\nTo wygląda na chwilową awarię API ${selectedCompany.name}. ` +
        'Jeśli nie zapiszesz, nic się nie zmieni - zeskanuj ponownie później.';
      const write = await ask(question, {
        title: 'Zapisać wynik skanowania?',
        ok: 'Zapisz mimo to',
        cancel: 'Nie zapisuj',
        danger: true,
      });
      if (!write) return null;
    }

    // a hundred rows per request, one request at a time (a first scan after adding mappings touches most products)
    const requests = [];
    const inChunks = (rows, send) => chunked(rows).forEach((chunk) => requests.push(() => send(chunk)));
    const only = { fields: ['id'] }; // what the requests answer with
    for (const [collection, changes] of Object.entries(patches)) {
      const rows = [...changes].map(([id, data]) => ({ id, ...data }));
      inChunks(rows, (chunk) => api.items(collection).updateBatch(chunk, only));
    }
    inChunks(removedImages, (chunk) => api.items('products_storage_image').deleteMany(chunk));
    inChunks(removedGallery, (chunk) => api.items('products_image').deleteMany(chunk));
    for (const [collection, { create, remove }] of [
      ['products_labeling', labelingsChanges],
      ['products_categories', categoriesChanges],
    ]) {
      inChunks(remove, (chunk) => api.items(collection).deleteMany(chunk));
      inChunks(create, (chunk) => api.items(collection).createMany(chunk, only));
    }

    statusLog = `Postęp: 0/${requests.length}`;
    for (const [i, request] of requests.entries()) {
      await request();
      statusLog = `Postęp: ${i + 1}/${requests.length}`;
    }
    await afterWriting();
    statusLog = null;

    const all = new Set(Object.values(updatedItemsIds).flatMap((ids) => [...ids]));
    return { ...updatedItemsIds, all };
  }

  async function updatePricelists(ids) {
    // recalculate labeling prices for all items with the given ids, a hundred at a time (the ids go in the url);
    // the other tabs hear about them with the rest (updateDb)
    fetchingPhase = 3;
    let done = 0;
    statusLog = `Postęp: 0/${ids.length}`;
    for (const chunk of chunked(ids)) {
      // (as one "1,2,3": more than 20 in the url's filter[id][_in][n] are read as an object, matching nothing)
      for await (const results of recalculateProductsGenerator({ id: { _in: chunk.join(',') } }, { emit: false })) {
        done += results.ids.length;
        statusLog = `Postęp: ${done}/${ids.length}`;
      }
    }
    statusLog = null;
  }

  async function unpricedProducts() {
    // products with a labeling that has no prices yet: a scan left before its pricelists were done
    const { data } = await api.items('price_per_amount').readByQuery({
      aggregate: { count: '*' },
      groupBy: ['products_labeling'],
      filter: { products_labeling: { product: { company: { _eq: selectedCompany.id } } } },
      limit: -1,
    });
    const priced = new Set(data.map((row) => row.products_labeling));
    return dbItems.filter((item) => item.labelings.some((l) => !priced.has(l.id))).map((item) => item.id);
  }

  async function updateDb(previousItems, afterWriting) {
    // update prices and storages, then recalculate labeling prices, then fetch updated dbItems
    const updatedItemsIds = await updatePricesAndStorages(previousItems, afterWriting);
    if (!updatedItemsIds) {
      // not written (see updatePricesAndStorages): the list stays on the scan before
      apiItems = previousItems;
      newImages = [];
      fetching = false;
      tell('Baza danych nie została zmodyfikowana.', { title: 'Nie zapisano skanowania' });
      return;
    }
    const { changedPrice, changedLabelings, all } = updatedItemsIds;
    const recalculate = new Set([...changedPrice, ...changedLabelings, ...(await unpricedProducts())]);
    await updatePricelists([...recalculate]);

    fetching = false; // this must be set before emitting heimdall events, or the product list won't reload
    heimdall.emit('products', [...new Set([...all, ...recalculate])]);
  }

  async function addNewImages(e) {
    // import the approved images into their variants (or the gallery), remember the refused ones
    addingImages = true;
    const failed = [];
    const ids = [];
    for (const { product, known: before, candidates } of e.detail) {
      const known = structuredClone(before ?? {});
      const history = new Set(product.images_history ?? usedFiles(product));
      const nextIndex = new Map(); // storage id -> index for the next image
      const next = (storage) => {
        const index = nextIndex.get(storage.id) ?? Math.max(-1, ...storage.img.map((i) => i.index ?? -1)) + 1;
        nextIndex.set(storage.id, index + 1);
        return index;
      };
      const place = appending();
      const gallery = { img: product.gallery ?? [] }; // its places, as a variant's
      const added = []; // to the gallery: { img, lead }
      for (const { storages, source, rejected, lead } of candidates) {
        if (rejected) {
          known[source] = { rejected: true };
          continue;
        }
        const title = storages.length
          ? imageTitle(product, storages[0], storages.map(place)[0]) // a place in each variant it goes to
          : imageTitle(product, null, place(gallery));
        const file = await importSource(source, title, selectedCompany.id);
        if (!file) {
          failed.push(source); // stays unknown, so the next scan offers it again
          continue;
        }
        // one file, in every variant that shows it
        if (storages.length)
          await api.items('products_storage_image').createMany(
            storages.map((storage) => ({
              products_storage: storage.id,
              img: file,
              index: next(storage),
              enabled: true,
              show_in_gallery: true,
            })),
          );
        else added.push({ img: file, lead });
        known[source] = storages.length ? { file } : { file, gallery: true };
        history.add(file);
      }
      if (added.length) {
        // the api's first leads the gallery, the rest go after the ones there
        const rows = arrangeGallery(
          product.gallery ?? [],
          added.filter((a) => a.lead),
          added.filter((a) => !a.lead),
        );
        await api
          .items('products_image')
          .createMany(
            rows
              .filter((r) => r.id == null)
              .map(({ img, index, main }) => ({ product: product.id, img, index, main, enabled: true })),
          );
        const changed = rows.filter((r) => r.changed).map(({ id, index, main }) => ({ id, index, main }));
        if (changed.length) await api.items('products_image').updateBatch(changed);
      }
      await api.items('products').updateOne(product.id, { api_images: known, images_history: [...history] });
      ids.push(product.id);
    }
    newImages = [];
    addingImages = false;
    heimdall.emit('products', ids);
    if (failed.length) tell(`Nie pobrano:\n${failed.join('\n')}`, { title: 'Niektóre zdjęcia się nie zaimportowały' });
  }

  function writeFailed(e) {
    // a write failed halfway (a scan, its images, Posprzątaj): what got written stays - a scan is saved last, so the
    // next one compares with the one before again - and the list reloads as the database has it
    addingImages = deletingRetired = false;
    newImages = [];
    statusLog = null;
    tell(`${e.message}\nCzęść zmian mogła zostać zapisana.`, { title: 'Zapis nie powiódł się', danger: true });
    fetchItems();
  }

  async function deleteRetired() {
    const what = [
      retired.length && `${retired.length} wycofanych produktów`,
      retiredVariants.length && `${retiredVariants.length} wycofanych wariantów`,
    ].filter(Boolean);
    const question = `Usunąć ${what.join(' i ')} producenta ${selectedCompany.name}? Tego nie można cofnąć.`;
    if (deletingRetired || !retiredCount || !(await ask(question, { ok: 'Usuń', danger: true }))) return;
    deletingRetired = true;
    const products = retired.map((i) => i.id);
    const variants = retiredVariants.map((s) => s.id); // their images go with them
    const touched = inDb.filter((i) => i.storage.some((s) => variants.includes(s.id))).map((i) => i.id);
    const files = [
      ...retired.flatMap((i) => [...usedFiles(i)]),
      ...retiredVariants.flatMap((s) => (s.img ?? []).map((i) => i.img)),
    ];
    for (const chunk of chunked(products)) await api.items('products').deleteMany(chunk);
    for (const chunk of chunked(variants)) await api.items('products_storage').deleteMany(chunk);
    const deletedFiles = await removeUnusedFiles(files); // their images go too, unless something else uses them
    deletingRetired = false;
    heimdall.emit('products', [...products, ...touched]);
    if (deletedFiles.length) heimdall.emit('directus_files', deletedFiles);
  }

  async function fetchApi() {
    if (fetching) return;
    fetching = true;
    fetchingPhase = 1;
    heimdall.ask(selectedCompany);
  }

  async function fetchDbItems() {
    const fields = [
      'id',
      'enabled',
      'code',
      'slug',
      'price',
      'handling_cost',
      ...detailsFields,
      'api_images',
      'images_history',
      'storage.id',
      'storage.enabled',
      'storage.amount',
      'storage.available',
      'storage.api_color_code',
      'storage.color_first',
      'storage.color_second',
      'storage.img.id',
      'storage.img.index',
      'storage.img.img',
      'gallery.id',
      'gallery.index',
      'gallery.main',
      'gallery.img',
      'labelings.id',
      'labelings.index',
      'labelings.labeling',
      'labelings.labeling_place',
      'labelings.labeling_field_x',
      'labelings.labeling_field_y',
      'categories.id',
      'categories.index',
      'categories.category',
    ];
    const filter = { company: { _eq: selectedCompany.id } };
    const res = await api.items('products').readByQuery({ fields, filter, limit: -1 });
    return res.data;
  }

  let alive = true;
  onDestroy(() => (alive = false));

  async function fetchItems() {
    fetching = true;
    fetchingPhase = 0;
    let unread = null; // the last scan, when it can't be read: as none, a new scan replaces it
    try {
      [dbItems, apiItems] = await Promise.all([
        fetchDbItems(),
        fetchSnapshot(selectedCompany).catch((e) => ((unread = e), null)),
      ]);
    } catch (e) {
      dbItems = apiItems = null; // not the last company's, merged with this one
      $scanRequest = null;
      if (alive) tell(e.message);
      return;
    } finally {
      fetching = false;
    }
    if (unread && alive) tell(unread.message);
    if ($scanRequest === selectedCompany.id) {
      $scanRequest = null;
      if (alive) fetchApi(); // leaving the page while it loaded calls it off
    }
  }

  globals.update(companies);
  globals.update(colors);
  globals.update(priceViews);
  globals.update(globalMargins);
  globals.update(labelings);
  globals.update(categories);

  // triggered by fetchApi (heimdall.ask)
  heimdall.get(async (data) => {
    if (!fetching || fetchingPhase !== 1) return; // not a scan this page asked for
    const failed = (why, title = 'Skanowanie nie powiodło się') => {
      fetching = false;
      tell(`${why}\nBaza danych nie została zmodyfikowana.`, { title, danger: true });
    };
    if (data?.notice) return failed(data.notice, 'Skanowanie niemożliwe');
    if (!data || data?.error) {
      return failed(
        `${data?.error ?? 'Brak odpowiedzi.'}\nSpróbuj ponownie za chwilę. Jeśli to się powtarza, zgłoś to naszemu ogromnemu działowi IT.`,
      );
    }

    // only apply to the company the scan was requested for
    if (data.company !== selectedCompany?.id) return failed('Wynik skanowania nie pasuje do wybranego producenta.');

    const { items } = data;
    if (!items || items.length === 0) {
      return failed('API nie zwróciło żadnych produktów. Możliwe, że dostawca zmienił jego strukturę.');
    }

    const companyUpdates = {};

    const tryAddCompanyUpdate = (dbKey, key) => {
      // update if a given property was provided in the response and is different from the current value
      if (data?.[key] && !dequal(selectedCompany[dbKey], data[key])) companyUpdates[dbKey] = data[key];
    };
    tryAddCompanyUpdate('api_last_scan', 'lastScan');
    tryAddCompanyUpdate('api_discount', 'discount');
    tryAddCompanyUpdate('api_handling_costs', 'handlingCosts');
    // the product editor needs the api's labeling codes to know which labelings the scanner manages
    const codes = labelingCodes(items);
    if (codes.length && !dequal(codes, selectedCompany.api_labelings_codes)) companyUpdates.api_labelings_codes = codes;

    // the scan itself (the snapshot) and the company's details are saved once the products are written - a scan
    // stopped halfway is then still compared with the one before it next time - and not at all when the admin doesn't
    // write the scan (see updatePricesAndStorages)
    const snapshotChanged = !dequal(items, apiItems);
    async function saveScan() {
      if (snapshotChanged) {
        const formData = new FormData();
        const file = new Blob([JSON.stringify(items)], { type: 'application/json' });
        const fileName = `api_snapshot_${selectedCompany.name.toLowerCase()}.json`;
        formData.append('company', selectedCompany.id); // (Directus reads the fields before the file only)
        formData.append('file', file, fileName);
        if (selectedCompany.api_snapshot) {
          await api.files.updateOne(selectedCompany.api_snapshot, formData);
        } else {
          const { id } = await api.files.createOne(formData);
          await api.files.updateOne(id, { tags: ['hidden'] }); // out of the library, as the avatars
          companyUpdates.api_snapshot = id;
        }
        heimdall.emit('directus_files', companyUpdates?.api_snapshot || selectedCompany.api_snapshot);
      }
      if (Object.keys(companyUpdates).length > 0) {
        const saved = await api.items('companies').updateOne(selectedCompany.id, companyUpdates);
        storeSnapshot(saved, items); // before the tabs hear of it, so they don't download it again
        heimdall.emit('companies', selectedCompany.id);
      }
    }

    const previousItems = apiItems; // the last scan, to tell names we set from ones renamed by hand
    apiItems = items;
    await updateDb(previousItems, saveScan).catch(writeFailed);
  });

  // a change made elsewhere (or here: hiding a product, deleting one) reloads the list in the background,
  // the table stays where it is; kept only while its company is still picked, and done once more for a change that
  // came in meanwhile
  let refreshing = false;
  let again = false;
  heimdall.listen(async ({ data }) => {
    if (fetching || !selectedCompany || data.collection != 'products') return;
    if (refreshing) return void (again = true);
    refreshing = true;
    try {
      do {
        again = false;
        const id = selectedCompany.id;
        const items = await fetchDbItems();
        if (selectedCompany.id === id) dbItems = items;
      } while (again);
    } finally {
      refreshing = false;
    }
  });
</script>

<svelte:head>
  <title>Admin | API | REED Kalisz</title>
</svelte:head>

<!-- the page doesn't scroll, the list does (see .ui-fill) -->
<div class="ui-fill">
  {#if supportedCompanies && selectedCompany}
    <CompanyBar
      companies={supportedCompanies}
      selected={selectedCompany}
      disabled={fetching}
      busy={scanning}
      on:change={handleCompanyChange}>
      <!-- only what's always there, so the companies next to it never move -->
      <Button slot="before" disabled={fetching || !dbItems} icon="cloud" on:click={fetchApi}>Skanuj</Button>

      <!-- labels on one line, values on the next, each on a shared baseline -->
      <div class="stats">
        {#if selectedCompany.api_discount !== null}
          <label class="ui-stat-label" for="discount">Rabat</label>
          <span class="ui-stat-value discount">
            <Input
              id="discount"
              size="compact"
              type="number"
              min={0}
              max={100}
              value={discount}
              invalid={discountInvalid}
              disabled={fetching}
              on:input={(e) => discountTyped(e.detail.e)}
              on:blur={discountLeft} />&nbsp;%
          </span>
        {/if}
        <span class="ui-stat-label">Ostatni skan</span>
        <span class="ui-stat-value">{lastScan}</span>
      </div>

      <small slot="busy">
        <span class="warning">Nie zamykaj przeglądarki</span> i nie opuszczaj tej strony, dopóki skanowanie się nie zakończy.
      </small>
    </CompanyBar>
  {/if}

  <div class="content ui-fill-col">
    {#if fetching}
      {#if fetchingPhase === 0}
        <p class="aligned"><Loader dark /> Pobieranie danych</p>
      {:else if fetchingPhase === 1}
        <p class="aligned"><Loader dark /> Pobieranie zewnętrznych danych (1/3)</p>
        <small class="indent">Pobierana jest duża ilość danych, może to zająć kilka minut.</small>
      {:else if fetchingPhase === 2}
        <p class="aligned"><Loader dark /> Aktualizacja cen, stanów magazynowych, znakowań i kategorii (2/3)</p>
      {:else if fetchingPhase === 3}
        <p class="aligned"><Loader dark /> Aktualizacja cenników (3/3)</p>
      {/if}

      {#if statusLog}
        <small class="indent">{statusLog}</small>
      {/if}
    {/if}

    {#if !fetching && mergedItems && selectedCompany && $colors}
      {@const pagedItems = mergedItems.slice((page - 1) * limit, page * limit)}

      <!-- the sorting (and adding what's picked) in a bar of its own, like the companies above -->
      <Bar>
        {#if selectedCount.all}
          <Button disabled={uploading} icon={uploading ? 'api' : 'add'} on:click={upload}>
            {uploading ? 'Importowanie...' : 'Importuj'}
          </Button>
          <!-- what's picked, a number and its label on each line (the labels like the last scan's in the bar above) -->
          <div class="ui-counts">
            <span class="ui-stat-value">{selectedCount.items}</span>
            <span class="ui-stat-label">Produkty</span>
            <span class="ui-stat-value">{selectedCount.storages}</span>
            <span class="ui-stat-label">Warianty</span>
          </div>
          <span class="ui-divider" />
        {/if}
        <div class="sorting">
          <Input size="small" type="checkbox" bind:value={sort.notInApiFirst}>Najpierw wycofane</Input>
          <Input size="small" type="checkbox" bind:value={sort.dbFirst}>Najpierw zaimportowane</Input>
        </div>
        <!-- what acts on the list, at the other end -->
        <div class="list-actions">
          {#if retiredCount}
            <!-- deletes the retired products and variants (the confirmation says how many) -->
            <Button
              size="sm"
              dangerous
              disabled={deletingRetired}
              icon="delete"
              on:click={() => deleteRetired().catch(writeFailed)}>
              {deletingRetired ? 'Usuwanie...' : 'Posprzątaj'}
            </Button>
          {/if}
          <Search {searchParams} {query} />
        </div>
      </Bar>

      <div class="products ui-fill-col">
        {#if pagedItems.length === 0}
          <p>Brak wyników</p>
        {:else}
          <Items
            items={pagedItems}
            company={selectedCompany}
            {apiItems}
            bind:sort
            scrollKey={[page, limit, query, selectedCompany.id]} />
        {/if}
      </div>
      <Pagination {searchParams} {limit} {page} count={mergedItems.length} />
    {/if}
  </div>
</div>

{#if !fetching && newImages.length}
  <NewImages
    title="Nowe zdjęcia w API"
    groups={newImages}
    busy={addingImages}
    on:confirm={(e) => addNewImages(e).catch(writeFailed)}
    on:later={() => (newImages = [])} />
{/if}
{#if importImages}
  <NewImages
    title="Zdjęcia importowanych produktów"
    groups={importImages.groups}
    on:confirm={(e) => importImages.decide(e.detail)}
    on:later={() => importImages.decide(null)} />
{/if}

<style>
  /* no taller than the buttons (2rem), so the bar keeps its height */
  .stats {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: auto auto;
    align-items: baseline;
    align-content: center;
    gap: 0.1rem 1.25rem;
    height: 2rem;
    line-height: 1;
  }
  label.ui-stat-label {
    cursor: pointer;
  }
  /* the field and its "%" on one line */
  .discount {
    display: flex;
    align-items: baseline;
  }
  .discount :global(.wrapper) {
    width: 3rem;
  }
  p {
    display: flex;
    align-items: center;
    margin: 0;
  }
  /* the spinner right under the scan button's icon: the bar's border and padding, the button's padding, half the
     icon (58% of 2rem) less half the spinner (a 1.5rem line); the texts under it start where its text does */
  .content {
    --under-scan: calc(1px + 0.5rem + 1rem + 0.58rem - 0.75rem);
  }
  .aligned {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-left: var(--under-scan);
  }
  .indent {
    margin-left: calc(var(--under-scan) + 2rem);
  }
  .warning {
    color: var(--red-500);
  }
  /* at the other end of the bar */
  .list-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
  }
  /* like the flags next to the products, each option in one piece */
  .sorting {
    padding-left: 0.25rem;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem 1rem;
  }
  .sorting :global(label) {
    white-space: nowrap;
  }
</style>
