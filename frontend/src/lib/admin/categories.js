import { makeTree, treeFlatten } from '%/utils';

// A product's categories are kept in the order of the category tree, and only the most specific ones:
// a category that has one of its subcategories next to it is dropped (the subcategory is listed under it anyway).

// -> Map(category id -> position in the tree)
export function categoryOrder(categories) {
  return new Map(treeFlatten(makeTree(categories ?? [])).map((c, i) => [c.id, i]));
}

// How a category is shown: its number in the tree and its own name ("4.5.3 Latarki"), the whole path on hover.
// -> Map(id -> { number, name, label, path, depth })
export function categoryLabels(categories) {
  const flat = treeFlatten(makeTree(categories ?? []));
  const names = new Map(flat.map((c) => [c.id, c.name]));
  const parents = new Map(flat.map((c) => [c.id, c.parent]));
  return new Map(
    flat.map((c) => {
      const number = c._meta.path.map((p) => p + 1).join('.');
      const path = [...ancestorIds(c.id, parents).reverse(), c.id].map((id) => names.get(id)).join(' › ');
      const label = `${number} ${c.name}`;
      return [c.id, { number, name: c.name, label, path, depth: c._meta.depth }];
    }),
  );
}

// The categories to pick from, in the tree's order, drawn as a tree (see Select) -> [{ id, text, code, depth }]
export const categoryOptions = (labels) =>
  [...labels].map(([id, { name, number, depth }]) => ({ id, text: name, code: number, depth }));

// Everything the helpers below need, worked out once. -> { order, parents, existing }
export function categoryIndex(categories) {
  const list = categories ?? [];
  return {
    order: categoryOrder(list),
    parents: new Map(list.map((c) => [c.id, c.parent])),
    existing: new Set(list.map((c) => c.id)),
  };
}

// -> ids of the categories above this one, the closest first
export function ancestorIds(id, parents) {
  const ids = [];
  for (let p = parents.get(id); p != null && !ids.includes(p); p = parents.get(p)) ids.push(p);
  return ids;
}

// -> the ids without the ones that have a subcategory among them
export function mostSpecific(ids, parents) {
  const covered = new Set(ids.flatMap((id) => ancestorIds(id, parents)));
  return ids.filter((id) => !covered.has(id));
}

// Rows ({ category, index, ... }) sorted by the tree and reindexed. Unknown categories go last.
export function sortCategoryRows(rows, order) {
  const position = (row) => order.get(row.category) ?? Infinity;
  return [...rows].sort((a, b) => position(a) - position(b)).map((row, index) => ({ ...row, index }));
}
