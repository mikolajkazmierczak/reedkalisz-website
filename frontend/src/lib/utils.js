import { get } from 'svelte/store';
import { page } from '$app/stores';
import { diffJson } from 'diff';
import { goto } from '$app/navigation';

export const uuid = () => Math.random().toString(36).substring(2);
export const range = (start = 0, stop, step = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

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

export function diff(item, itemOriginal, fieldsToIgnore) {
  return new Promise(async resolve => {
    if (!item) return resolve({ diff: null, changed: null, html: null });
    const itemCopy = item ? JSON.parse(JSON.stringify(item)) : null;
    await deleteFields(itemCopy, fieldsToIgnore);
    const itemOriginalCopy = itemOriginal ? JSON.parse(JSON.stringify(itemOriginal)) : null;
    await deleteFields(itemOriginalCopy, fieldsToIgnore);
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

export function getSearchParams(names) {
  // ['numberParam', 'stringParam'] -> { numberParam: 123, stringParam: 'string' }
  if (!Array.isArray(names)) names = [names];
  const searchParams = get(page).url.searchParams;
  return names.reduce((params, name) => {
    const param = searchParams.get(name);
    params[name] = param ? (isNaN(Number(param)) ? param : Number(param)) : null;
    return params;
  }, {});
}

export function setSearchParams(newParams, navigation = null, rootPathname = null) {
  // { numberParam: 123, stringParam: 'string' } -> ?numberParam=123&stringParam=string
  if (navigation) {
    // only set the params if the new url pathname is correct
    // also check if the current url isn't the same as the new one to prevent an infinite loop
    const { from, to } = navigation;
    if (to.url.pathname != rootPathname || from.url.href == to.url.href) {
      return;
    }
  }
  // create new url
  const url = get(page).url;
  for (const [key, value] of Object.entries(newParams)) {
    if (value == null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  // navigate to new url
  goto(url.toString(), { replaceState: true, noscroll: true });
}

export function reuseIDs(oldItems, newItems) {
  // use oldItems ids to assign as many ids in newItems as possible
  // this maximizes reusability instead of creating new objects
  oldItems.forEach((oldItem, i) => {
    if (newItems?.[i]) newItems[i].id = oldItem.id;
  });
}

export function makeTree(items, inplace = false, _root = true, _parent = null, _depth = 0, _path = []) {
  // Convert a flat array of items into a tree structure and add metadata (_meta property).
  if (!inplace && _root) items = JSON.parse(JSON.stringify(items));
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
  if (!inplace && _root) tree = JSON.parse(JSON.stringify(tree));
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

export function treeGetItemAtPath(tree, path) {
  // Find item with id.
  if (path.length === 0) return tree;
  if (path.length === 1) return tree[path[0]];
  return treeGetItemAtPath(tree[path[0]].children, path.slice(1));
}

export function treeRemoveItemAtPath(tree, path) {
  // Remove item at path.
  const item = tree[path[0]];
  if (path.length === 1) {
    tree.splice(path[0], 1);
    return JSON.parse(JSON.stringify(item));
  } else {
    return treeRemoveItemAtPath(item.children, path.slice(1));
  }
}

export function treePushItemAtPath(tree, path, item) {
  // Insert item at path.
  const parent = tree[path[0]];
  if (path.length === 1) {
    tree.splice(path[0], 0, item);
  } else treePushItemAtPath(parent.children, path.slice(1), item);
}

export function treeMoveItemToPath(tree, item, newPath) {
  // Move item to newPath.
  const oldPath = item._meta.path;
  const removedItem = treeRemoveItemAtPath(tree, oldPath);
  treePushItemAtPath(tree, newPath, removedItem);
  treeRefreshMetaAndParent(tree);
  return tree;
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
