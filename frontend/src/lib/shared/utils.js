import { diffJson } from 'diff';
import { klona } from 'klona';
import { dequal } from 'dequal';
import { nanoid } from 'nanoid';
import { default as generateSlug } from 'slugify';

export const range = (start = 0, stop, step = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

export const deep = {
  copy: obj => klona(obj),
  same: (obj1, obj2) => dequal(obj1, obj2)
};

export const slugify = (parts, partsOriginal = null, slugOriginal = null) => {
  if (!Array.isArray(parts)) parts = [parts];
  if (!Array.isArray(partsOriginal)) partsOriginal = [partsOriginal];
  const text = parts.filter(p => p).join('-');
  const textOriginal = partsOriginal.filter(p => p).join('-');
  if (text == textOriginal) return slugOriginal;
  return generateSlug(text, { lower: true, strict: true }) + '-' + nanoid(8);
};

function filtersToRegex(filters) {
  // Individual filter formats: a / a.b / *.a / a.*.b (where * means any level of nesting)
  // Acceptable either: "a,*.b" / ["a", "*.b"]
  if (!Array.isArray(filters)) filters = filters.split(',');
  const individual = filters.map(filter =>
    filter
      .split('.')
      .map(part => (part == '*' ? '.*' : '\\b' + part + '\\b'))
      .join('\\.')
  );
  return new RegExp(individual.join('|'));
}

export async function walkObject(object, filters, func, _regex = null, _path = '', _parent = null, _index = null) {
  // Recursively walk all object properties and do something on fields matching any of the filters.

  if (!filters || filters.length === 0) return;
  _regex = filtersToRegex(filters);

  if (Array.isArray(object)) {
    for (const [index, val] of object.entries()) {
      if (typeof val === 'object' && val !== null) {
        await walkObject(val, null, func, _regex, _path, object, index);
      }
    }
  } else {
    for (const [key, val] of Object.entries(object)) {
      // TODO: optimize to skip paths that couldn't possibly be matched
      const newPath = _path ? _path + '.' + key : key;
      const match = _regex.test(newPath);
      if (match) {
        await func(object, key, val, _path, _parent, _index);
      } else if (typeof val === 'object' && val !== null) {
        await walkObject(val, null, func, _regex, newPath, object, key);
      }
    }
  }

  return;
}

export async function getFields(object, filters) {
  const fields = [];
  await walkObject(object, filters, (obj, key, val) => fields.push(val));
  return fields;
}
export async function deleteFields(object, filters) {
  // WARNING: inplace!
  await walkObject(object, filters, (obj, key) => {
    delete obj[key];
  });
}

function diffToHtml(diff) {
  if (!diff) return null;
  return diff
    .map(part => {
      if (part.added) {
        return `<span style="font-weight: bold;">${part.value}</span>`;
      } else if (part.removed) {
        return `<span style="text-decoration: line-through; opacity: 0.5;">${part.value}</span>`;
      } else return part.value;
    })
    .join('');
}

export function diff(item, itemOriginal, { editorPreset = false, fieldsToIgnore = [] } = {}) {
  if (editorPreset) fieldsToIgnore.push(...['user_created', 'date_created', 'user_updated', 'date_updated']);
  return new Promise(async resolve => {
    if (!item) return resolve({ diff: null, changed: null, html: null });
    const itemCopy = deep.copy(item);
    const itemOriginalCopy = deep.copy(itemOriginal);
    if (fieldsToIgnore.length) {
      await deleteFields(itemCopy, fieldsToIgnore);
      await deleteFields(itemOriginalCopy, fieldsToIgnore);
    }
    const diff = diffJson(itemOriginalCopy, itemCopy);
    return resolve({
      diff: diff,
      changed: diff.some(part => part.added || part.removed),
      html: diffToHtml(diff)
    });
  });
}

export function filetypeToReadable(filetype) {
  const str = filetype.split('/')[1].toUpperCase();
  if (str == 'SVG+XML') return 'SVG';
  if (str == 'JPEG') return 'JPG';
  return str;
}

export function bytesToReadable(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 B';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  if (i == 0) return bytes + ' ' + sizes[i];
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

export function reuseIDs(items, reusableIDs = []) {
  // Use both `items` and `oldItems` ids to reassign as many ids in items as possible.
  // This maximizes reusability instead of creating new objects.
  // e.g.: 2 _ 1 3 ; 3 1 _ 2  (items ; reusableIDs)
  //       1 2 3 _
  //             ^ delete previous ids if there were not enough new ones to avoid duplication
  const oldIds = items.map(item => item.id);
  const newIds = reusableIDs.concat(oldIds).filter(id => id);
  const ids = newIds.filter((id, i, self) => self.indexOf(id) === i); // remove duplicates
  ids.sort((a, b) => a - b);
  items.forEach((item, i) => {
    if (ids[i]) item.id = ids[i];
    else delete item.id;
  });
}

export function makeTree(items, inplace = false, _root = true, _parent = null, _depth = 0, _path = []) {
  // Convert a flat array of items into a tree structure and add metadata (_meta property).
  if (!inplace && _root) items = deep.copy(items);
  const tree = [];
  for (const item of items) {
    if (item.parent == _parent) {
      const path = [..._path, item.index];
      tree.push({
        ...item,
        _meta: { depth: _depth, path, isFirst: false, isLast: false },
        children: makeTree(items, inplace, false, item.id, _depth + 1, path)
      });
    }
  }
  // sort children by their indexes
  tree.sort((a, b) => a.index - b.index);
  if (tree.length > 0) {
    tree[0]._meta.isFirst = true;
    tree[tree.length - 1]._meta.isLast = true;
  }
  return tree;
}

export function treeFlatten(tree, inplace = false, _root = true) {
  // Convert a tree structure into a flat array of items.
  if (!inplace && _root) tree = deep.copy(tree);
  return tree.reduce((acc, item) => {
    const newItem = { ...item };
    delete newItem.children;
    acc.push(newItem);
    if (item.children) {
      acc.push(...treeFlatten(item.children, inplace, false));
    }
    return acc;
  }, []);
}

export function treeRefreshMetaAndParent(tree, _parent = null, _depth = 0, _path = [], _prev = null) {
  // Recalculate metadata and parent field for a tree structure.
  let prev;
  let index = 0;
  for (const item of tree) {
    const path = [..._path, index];
    item._meta = { depth: _depth, path, isFirst: index === 0, isLast: true };
    item.parent = _parent;
    item.index = index;
    if (item.children) {
      treeRefreshMetaAndParent(item.children, item.id, _depth + 1, path, item);
    }
    if (index > 0) {
      prev._meta.isLast = false;
    }
    prev = item;
    index++;
  }
}

export function treeGetItem(tree, id) {
  // Find item in a tree with a given id.
  for (const item of tree) {
    if (item.id == id) return item;
    if (item.children) {
      const found = treeGetItem(item.children, id);
      if (found) return found;
    }
  }
}
export function treeRemoveItem(tree, id) {
  // Remove item in a tree with a given id and return it.
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];
    if (item.id == id) {
      tree.splice(i, 1);
      return item;
    }
    if (item.children) {
      const found = treeRemoveItem(item.children, id);
      if (found) return found;
    }
  }
}

export function treeMarkToRemove(tree, id) {
  // Mark item in a tree with a given id to be removed.
  for (const item of tree) {
    if (item.id == id) {
      item._meta.toBeRemoved = true;
      return;
    }
    if (item.children) {
      treeMarkToRemove(item.children, id);
    }
  }
}
export function treeRemoveMarked(tree) {
  // Remove all items in a tree that are marked to be removed.
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];
    if (item._meta.toBeRemoved) {
      tree.splice(i, 1);
      i--;
    }
    if (item.children) {
      treeRemoveMarked(item.children);
    }
  }
}

export function treeGetItemAtPath(tree, path) {
  // Find item using it's path.
  if (path.length === 0) return tree;
  if (path.length === 1) return tree[path[0]];
  return treeGetItemAtPath(tree[path[0]].children, path.slice(1));
}
export function treePushItemAtPath(tree, path, item) {
  // Insert item at path.
  const parent = tree[path[0]];
  if (path.length === 1) {
    tree.splice(path[0], 0, item); // if path[0] is bigger then the array, it will still be added at the end
  } else treePushItemAtPath(parent.children, path.slice(1), item);
}

export function treeMoveItemToPath(tree, oldPath, newPath) {
  // Move item at oldPath to newPath.
  if (oldPath.join() === newPath.join()) return;
  const getData = item => ({ id: item.id, parent: item.parent, index: item.index });
  const oldItem = treeGetItemAtPath(tree, oldPath);
  const oldItemData = getData(oldItem);
  const newItem = deep.copy(oldItem);
  treeMarkToRemove(tree, oldItem.id);
  treePushItemAtPath(tree, newPath, newItem);
  treeRemoveMarked(tree);
  treeRefreshMetaAndParent(tree);
  const newItemData = getData(newItem);
  return { oldItemData, newItemData };
}

export function treeGetItemIDsFromPath(tree, path) {
  // Find ids of all items in a path.
  const ids = [];
  for (let i = 0; i < path.length; i++) {
    const item = treeGetItemAtPath(tree, path.slice(0, i + 1));
    ids.push(item.id);
  }
  return ids;
}

export function treeGetAllChildrenIDs(tree, id) {
  // Find ids of all children of an item with a given id.
  const item = treeGetItem(tree, id);
  if (!item) return [];
  const ids = [];
  for (const child of item.children) {
    ids.push(child.id);
    ids.push(...treeGetAllChildrenIDs(tree, child.id));
  }
  return ids;
}

export function moveItem(items, i, d) {
  // Move item in array.
  // i = index of item to move
  // d = -1 or 1 (direction "up" or "down")
  const j = i + d;
  if (j < 0 || j >= items.length) return items;
  [items[j], items[i]] = [items[i], items[j]];
  return items.map((item, i) => ({ ...item, index: i })); // restart indexes
}
