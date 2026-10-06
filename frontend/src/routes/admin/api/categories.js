import { mostSpecific, sortCategoryRows } from '@/categories';
import { isManagedCategory, mappedCategories } from '@/sync';

// Supplier categories are paths of names, root first: ['Do pisania', 'Długopisy'].
// A mapping points one path at any number of our categories:
//   [{ path: ['Do pisania'], categories: [12] }, { path: ['Do pisania', 'Wkłady'], categories: [] }]
// It covers the whole branch below it, unless a deeper path has a mapping of its own -
// an empty one (`categories: []`) keeps that branch out.
// The products in no supplier category are in the empty path, [] ("BEZ KATEGORII"): mapped like any other, above or
// below nothing - but without a mapping it gets them no category on purpose, as "ignoruj" would (see pathState).

export const pathKey = (path) => path.join('\u0000');

// a product's supplier category paths ([item._categories]), "BEZ KATEGORII" ([[]]) when there are none
export const apiPaths = (paths) => (paths?.length ? paths : [[]]);

// path key -> categories, made once per list of mappings (a scan resolves thousands of products with one)
const lookups = new WeakMap();
function lookup(mappings) {
  if (!lookups.has(mappings))
    lookups.set(mappings, new Map(mappings.map((m) => [pathKey(m.path), m.categories ?? []])));
  return lookups.get(mappings);
}

// the categories of the deepest mapping of a path (its own, or one above it), or undefined without any
export function mappingAt(mappings, path) {
  if (!mappings?.length) return undefined;
  const byPath = lookup(mappings);
  if (!path.length) return byPath.get(pathKey(path));
  for (let depth = path.length; depth > 0; depth--) {
    const categories = byPath.get(pathKey(path.slice(0, depth)));
    if (categories) return categories;
  }
}

// what the mappings do with a path's products: 'mapped' (to one of ours still there; without the `index` any), 'ignored'
// ("ignoruj", its own or from above; "BEZ KATEGORII" without a mapping), 'unmapped' (no mapping, or one to deleted
// categories only)
export function pathState(mappings, path, index = null) {
  const ids = mappingAt(mappings, path);
  if (!ids) return path.length ? 'unmapped' : 'ignored';
  if (!ids.length) return 'ignored';
  return !index || ids.some((id) => index.existing.has(id)) ? 'mapped' : 'unmapped';
}

export function resolveCategories(mappings, paths, index = null) {
  // Our categories for a product in the given supplier categories: for each path the deepest mapping wins.
  // With the `index` (see `categoryIndex`) categories deleted since the mapping was made are dropped,
  // and so are the less specific ones (a category next to one of its subcategories).
  if (!mappings?.length) return [];
  const existing = index?.existing;
  const result = [];
  for (const path of apiPaths(paths)) {
    for (const id of mappingAt(mappings, path) ?? []) {
      if (!result.includes(id) && (!existing || existing.has(id))) result.push(id);
    }
  }
  return index ? mostSpecific(result, index.parents) : result;
}

export function listApiCategories(apiItems) {
  // Every supplier category (and every level above it) with the products under it, and "BEZ KATEGORII" (`none`: the
  // empty path) first when some products are in none - only while the supplier has categories at all.
  // Sorted as a tree: [{ path, name, depth, items, hasChildren, none }]
  const nodes = new Map();
  const without = [];
  for (const item of apiItems ?? []) {
    if (!item._categories?.length) without.push(item);
    const counted = new Set(); // a product in two subcategories counts once for the parent
    for (const path of item._categories ?? []) {
      for (let depth = 1; depth <= path.length; depth++) {
        const sub = path.slice(0, depth);
        const k = pathKey(sub);
        if (!nodes.has(k)) nodes.set(k, { path: sub, name: sub.at(-1), depth: depth - 1, items: [], children: [] });
        if (!counted.has(k)) {
          counted.add(k);
          nodes.get(k).items.push(item);
        }
      }
    }
  }

  const roots = [];
  for (const node of nodes.values()) {
    const parent = nodes.get(pathKey(node.path.slice(0, -1)));
    (parent ? parent.children : roots).push(node);
  }
  const flat = [];
  if (nodes.size && without.length) {
    flat.push({ path: [], name: 'BEZ KATEGORII', depth: 0, items: without, hasChildren: false, none: true });
  }
  const walk = (list) => {
    list.sort((a, b) => a.name.localeCompare(b.name, 'pl', { numeric: true }));
    for (const { children, ...node } of list) {
      flat.push({ ...node, hasChildren: children.length > 0 });
      walk(children);
    }
  };
  walk(roots);
  return flat;
}

export function planCategories(selectedCompany, product, apiItem, index) {
  // What to change so the product's categories follow the api and the mappings.
  // Only categories the mappings lead to are removed; one already there (even added by hand) is just kept,
  // unless a subcategory of it is there too (see `mostSpecific`).
  // All of them are then ordered by the category tree (`index`, see `categoryIndex`).
  // -> { create: [category], update: [{ id, data }], remove: [id] }
  const targets = mappedCategories(selectedCompany);
  const wanted = resolveCategories(selectedCompany.api_categories_mappings, apiItem._categories, index);
  const current = product.categories ?? [];

  const plan = { create: [], update: [], remove: [] };
  let kept = [];
  for (const row of current) {
    const duplicate = kept.some((k) => k.category === row.category);
    const unwanted = isManagedCategory(row, selectedCompany, targets) && !wanted.includes(row.category);
    if (duplicate || unwanted) plan.remove.push(row.id);
    else kept.push(row);
  }
  const added = wanted
    .filter((id) => !kept.some((k) => k.category === id))
    .map((category) => ({ product: product.id, category }));
  // a kept category with a subcategory next to it goes too
  const specific = mostSpecific(
    [...kept, ...added].map((r) => r.category),
    index.parents,
  );
  for (const row of kept) if (!specific.includes(row.category)) plan.remove.push(row.id);
  kept = kept.filter((row) => specific.includes(row.category));
  const finalAdded = added.filter((row) => specific.includes(row.category));
  if (!plan.remove.length && !finalAdded.length) return plan; // nothing changed, the order stays as it is

  for (const row of sortCategoryRows([...kept, ...finalAdded], index.order)) {
    if (row.id === undefined) plan.create.push(row);
    else if (row.index !== current.find((c) => c.id === row.id).index)
      plan.update.push({ id: row.id, data: { index: row.index } });
  }
  return plan;
}
