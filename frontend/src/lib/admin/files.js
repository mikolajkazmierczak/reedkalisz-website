import api from '$/api';

// every file a product uses: variant images, the gallery and the attachments
export function usedFiles(product) {
  const files = new Set();
  for (const s of product.storage ?? []) for (const img of s.img ?? []) if (img.img) files.add(img.img);
  for (const img of product.gallery ?? []) if (img.img) files.add(img.img);
  for (const a of product.attachments ?? []) if (a.file) files.add(a.file);
  return files;
}

// Where files are used. A file id can sit in a file field, but also inside text or json - an image in a
// markdown description, a homepage layout, a snapshot - so every field that can hold an id is looked through,
// and a file is unused only if its id is nowhere at all.

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const HOLDERS = ['uuid', 'string', 'text', 'json', 'csv'];
// system collections that point at files
const SYSTEM = {
  directus_users: ['avatar'],
  directus_settings: ['project_logo', 'public_foreground', 'public_background'],
};
// bookkeeping, not a use: the files a product had once, and the images the api scanner imported
const NOT_USES = ['products.images_history', 'products.api_images'];

async function holderFields() {
  // -> Map(collection -> { pk, fields: [...], singleton })
  const [{ data: fields }, { data: collections }, relations] = await Promise.all([
    api.fields.readAll(),
    api.collections.readAll(),
    api.relations.readAll(),
  ]);
  const singletons = new Set(collections.filter((c) => c.meta?.singleton).map((c) => c.collection));
  // a field pointing at something else than files (user_created, product, ...) holds no file ids
  const elsewhere = new Set(
    relations
      .filter((r) => r.related_collection && r.related_collection !== 'directus_files')
      .map((r) => `${r.collection}.${r.field}`),
  );
  const holders = new Map();
  for (const f of fields) {
    const system = f.collection.startsWith('directus_');
    if (system && !SYSTEM[f.collection]?.includes(f.field)) continue;
    const key = `${f.collection}.${f.field}`;
    if (!f.schema || !HOLDERS.includes(f.type) || NOT_USES.includes(key) || elsewhere.has(key)) continue;
    if (!holders.has(f.collection)) {
      const pk = fields.find((p) => p.collection === f.collection && p.schema?.is_primary_key)?.field ?? 'id';
      holders.set(f.collection, { pk, fields: [], singleton: singletons.has(f.collection), types: {} });
    }
    holders.get(f.collection).fields.push(f.field);
    holders.get(f.collection).types[f.field] = f.type;
  }
  return holders;
}

async function readRows(collection, { pk, fields, singleton }, filter = null) {
  if (collection === 'directus_settings') return [{ [pk]: 1, ...(await api.settings.read({ fields })) }];
  if (singleton) return [{ [pk]: null, ...(await api.singleton(collection).read({ fields })) }];
  const query = { fields: [pk, ...fields], limit: -1, ...(filter && { filter }) };
  if (collection === 'directus_users') return (await api.users.readByQuery(query)).data;
  return (await api.items(collection).readByQuery(query)).data;
}

function collect(refs, collection, pk, fields, rows, only = null) {
  // `only`: a Set of the file ids looked for
  for (const row of rows ?? []) {
    for (const field of fields) {
      const value = row[field];
      const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
      for (const match of text.match(UUID) ?? []) {
        const id = match.toLowerCase();
        if (only && !only.has(id)) continue;
        if (!refs.has(id)) refs.set(id, []);
        refs.get(id).push({ collection, id: row[pk], field });
      }
    }
  }
}

// Every reference to every file. -> Map(file id -> [{ collection, id, field }])
export async function scanFileReferences() {
  const refs = new Map();
  const holders = await holderFields();
  await Promise.all(
    [...holders].map(async ([collection, holder]) => {
      collect(refs, collection, holder.pk, holder.fields, await readRows(collection, holder));
    }),
  );
  return refs;
}

// The references to a few files - only the rows that mention them are read.
// -> Map(file id -> [{ collection, id, field }]), an unused file not in it
export async function findFileReferences(fileIds) {
  const wanted = new Set(fileIds);
  const refs = new Map();
  const holders = await holderFields();
  await Promise.all(
    [...holders].map(async ([collection, holder]) => {
      if (holder.singleton || collection === 'directus_settings') {
        return collect(refs, collection, holder.pk, holder.fields, await readRows(collection, holder), wanted);
      }
      // json can't be filtered by its content (Directus has no `_contains` for it), so it's read whole, once
      const json = holder.fields.filter((f) => holder.types[f] === 'json');
      const other = holder.fields.filter((f) => holder.types[f] !== 'json');
      const match = (fileId) => (f) =>
        holder.types[f] === 'uuid' ? { [f]: { _eq: fileId } } : { [f]: { _contains: fileId } };
      // one read per file: an `_or` over every file and field would outgrow the url
      const read = (fileId) => readRows(collection, { ...holder, fields: other }, { _or: other.map(match(fileId)) });
      const [jsonRows, ...rows] = await Promise.all([
        json.length && readRows(collection, { ...holder, fields: json }),
        ...(other.length ? [...wanted].map(read) : []),
      ]);
      collect(refs, collection, holder.pk, json, jsonRows || [], wanted);
      // each read only for its file, or a row mentioning two would be counted twice
      [...wanted].forEach((fileId, i) => collect(refs, collection, holder.pk, other, rows[i], new Set([fileId])));
    }),
  );
  return refs;
}

// Products that used the file once, but don't any more.
export async function findFileHistory(fileId) {
  const filter = { images_history: { _contains: fileId } };
  return (await api.items('products').readByQuery({ fields: ['id', 'name', 'code', 'slug'], filter, limit: -1 })).data;
}

// Readable references: where to go to see each use. -> [{ text, href }]
export async function describeReferences(refs) {
  const described = [];
  const ids = (collection) => [...new Set(refs.filter((r) => r.collection === collection).map((r) => r.id))];
  const product = (p, where) => ({
    text: `${p.code} ${p.name}${where ? ` - ${where}` : ''}`,
    href: `/admin/produkty/${p.slug}`,
  });

  const [products, variants, gallery, attachments, categories, pages] = await Promise.all([
    ids('products').length && readByIds('products', ids('products'), ['id', 'name', 'code', 'slug']),
    ids('products_storage_image').length &&
      readByIds('products_storage_image', ids('products_storage_image'), [
        'id',
        'products_storage.api_color_code',
        'products_storage.product.name',
        'products_storage.product.code',
        'products_storage.product.slug',
      ]),
    ids('products_image').length &&
      readByIds('products_image', ids('products_image'), ['id', 'product.name', 'product.code', 'product.slug']),
    ids('products_attachment').length &&
      readByIds('products_attachment', ids('products_attachment'), [
        'id',
        'product.name',
        'product.code',
        'product.slug',
      ]),
    ids('categories').length && readByIds('categories', ids('categories'), ['id', 'name', 'slug']),
    ids('pages').length && readByIds('pages', ids('pages'), ['id', 'name', 'slug']),
  ]);

  for (const ref of refs) {
    const { collection, id, field } = ref;
    const find = (list) => (list || []).find((x) => x.id === id);
    if (collection === 'products' && find(products)) described.push(product(find(products), field));
    else if (collection === 'products_storage_image' && find(variants)?.products_storage?.product) {
      const { product: p, api_color_code: code } = find(variants).products_storage;
      described.push(product(p, code ? `wariant ${code}` : 'wariant'));
    } else if (collection === 'products_image' && find(gallery)?.product) {
      described.push(product(find(gallery).product, 'galeria'));
    } else if (collection === 'products_attachment' && find(attachments)?.product) {
      described.push(product(find(attachments).product, 'załącznik'));
    } else if (collection === 'categories' && find(categories)) {
      described.push({ text: `Kategoria ${find(categories).name}`, href: `/admin/kategorie/${find(categories).slug}` });
    } else if (collection === 'pages' && find(pages)) {
      described.push({ text: `Strona ${find(pages).name}`, href: `/admin/strony/${find(pages).slug}` });
    } else if (collection === 'fragments') {
      described.push({ text: `Fragment #${id}`, href: `/admin/fragmenty/${id}` });
    } else if (collection === 'questions') {
      described.push({ text: `Zapytanie #${id}`, href: `/admin/zapytania/${id}` });
    } else {
      described.push({ text: `${collection}${id != null ? ` #${id}` : ''} (${field})`, href: null });
    }
  }
  return described;
}

async function readByIds(collection, ids, fields) {
  return (await api.items(collection).readByQuery({ fields, filter: { id: { _in: ids } }, limit: -1 })).data;
}

// Files by id (a POST-like SEARCH request, so thousands of ids don't overflow the url). -> { data, meta }
export async function searchFiles(query) {
  const res = await api.transport.request('SEARCH', '/files', { query });
  return { data: res.data, meta: res.meta };
}

// After deleting products or variants: delete the files they had that nothing else uses (the rows go with the
// product, the files don't). Tagged files - avatars and other hidden ones - are always kept. -> deleted ids
export async function removeUnusedFiles(ids) {
  const candidates = [...new Set(ids)].filter(Boolean);
  if (!candidates.length) return [];
  // a few files: just the rows that mention them; more: everything, once
  const refs = candidates.length <= 20 ? await findFileReferences(candidates) : await scanFileReferences();
  const unused = candidates.filter((id) => !refs.has(id));
  if (!unused.length) return [];
  const { data } = await searchFiles({ filter: { id: { _in: unused } }, fields: ['id', 'tags'], limit: -1 });
  const deletable = data.filter((f) => !f.tags?.length).map((f) => f.id);
  for (let i = 0; i < deletable.length; i += 100) await api.files.deleteMany(deletable.slice(i, i + 100));
  return deletable;
}
