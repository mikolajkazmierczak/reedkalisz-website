import { diffJson } from 'diff';

export const uuid = () => Math.random().toString(36).substring(2);

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
    if (!item) return resolve({ diff: null, parts: null, html: null });
    const itemCopy = JSON.parse(JSON.stringify(item));
    await deleteFields(itemCopy, fieldsToIgnore);
    const itemOriginalCopy = JSON.parse(JSON.stringify(itemOriginal));
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

export function makeTree(items, inplace = false, _root = true, _parent = null, _depth = 0, _path = []) {
  // Convert a flat array of items into a tree structure and add metadata (_meta property).
  const getPrev = () => (index > 0 ? tree[tree.length - 1] : null);
  if (!inplace && _root) items = JSON.parse(JSON.stringify(items));
  const tree = [];
  let index = 0;
  for (const item of items) {
    if (item.parent == _parent) {
      const prev = getPrev();
      const path = [..._path, index];
      tree.push({
        ...item,
        _meta: { depth: _depth, index, path, isFirst: index === 0, isLast: true },
        children: makeTree(items, inplace, false, item.id, _depth + 1, path)
      });
      if (prev) prev._meta.isLast = false;
      index++;
    }
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

function treeRefreshMetaAndParent(tree, _parent = null, _depth = 0, _path = [], _prev = null) {
  // Recalculate metadata and parent field for a tree structure.
  let prev;
  let index = 0;
  for (const item of tree) {
    const path = [..._path, index];
    item._meta = { depth: _depth, index, path, isFirst: index === 0, isLast: true };
    item.parent = _parent;
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

export function treeRemoveItemAtPath(tree, path, refresh = true, _root = true) {
  // Remove item at path.
  const item = tree[path[0]];
  if (path.length === 1) {
    tree.splice(path[0], 1);
    return JSON.parse(JSON.stringify(item));
  } else {
    if (_root && refresh) treeRefreshMetaAndParent(tree);
    return treeRemoveItemAtPath(item.children, path.slice(1), refresh, false);
  }
}

export function treePushItemAtPath(tree, path, item, refresh = true, _root = true) {
  // Insert item at path.
  const parent = tree[path[0]];
  if (path.length === 1) {
    tree.splice(path[0], 0, item);
  } else treePushItemAtPath(parent.children, path.slice(1), item, refresh, false);
  if (_root && refresh) treeRefreshMetaAndParent(tree);
}

export function treeMoveItemToPath(tree, item, newPath) {
  // Move item to newPath.
  const oldPath = item._meta.path;
  console.log('old', oldPath, 'new', newPath);
  console.log('before', JSON.parse(JSON.stringify(tree)));
  const removedItem = treeRemoveItemAtPath(tree, oldPath, false);
  console.log('removedItem', removedItem);
  treePushItemAtPath(tree, newPath, removedItem, false);
  treeRefreshMetaAndParent(tree);
  console.log('after', JSON.parse(JSON.stringify(tree)));
  return tree;
}
