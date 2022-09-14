import { diffJson } from 'diff';

export const uuid = () => Math.random().toString(36).substring(2);

export async function walkObject(object, filters, func, _regexes = null, _path = '', _parent = null, _index = null) {
  // Recursively walk all object properties and do something on fields matching any of the filters.
  // Acceptable filter formats: a, a.b, *.a, a.*.b (where * means any level of nesting)
  // The filters should be provided as either:
  // - a string separated by commas ("a,*.b")
  // - an array of strings (["a", "*.b"])

  if (filters) {
    if (!Array.isArray(filters)) filters = filters.split(',');
    _regexes = filters.map(filter => {
      const regex = filter
        .split('.')
        .map(part => (part == '*' ? '.*' : '\\b' + part + '\\b'))
        .join('\\.');
      return new RegExp(regex);
    });
    if (_regexes.length == 0) return;
  }

  if (Array.isArray(object)) {
    for (const [index, val] of object.entries()) {
      if (typeof val === 'object' && val !== null) {
        await walkObject(val, null, func, _regexes, _path, object, index);
      }
    }
  } else {
    for (const [key, val] of Object.entries(object)) {
      // TODO: optimize to skip paths that couldn't possibly be matched
      const newPath = _path ? _path + '.' + key : key;
      const match = _regexes.some(r => r.test(newPath));
      if (match) {
        await func(object, key, val, _path, _parent, _index);
      } else if (typeof val === 'object' && val !== null) {
        await walkObject(val, null, func, _regexes, newPath, object, key);
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

export async function diff(item, itemOriginal, fieldsToIgnore) {
  // console.log(
  //   'diff requested',
  //   item && JSON.parse(JSON.stringify(item)),
  //   itemOriginal && JSON.parse(JSON.stringify(itemOriginal))
  // );
  if (!item) return null;
  const itemCopy = JSON.parse(JSON.stringify(item));
  await deleteFields(itemCopy, fieldsToIgnore);
  const itemOriginalCopy = JSON.parse(JSON.stringify(itemOriginal));
  await deleteFields(itemOriginalCopy, fieldsToIgnore);
  return diffJson(itemOriginalCopy, itemCopy);
}
export function isDiff(changes) {
  if (!changes) return null;
  return changes.some(change => change.added || change.removed);
}
export function diffToHtml(diff) {
  if (!diff) return null;
  return diff
    .map(change => {
      if (change.added) {
        return `<span style="font-weight: bold;">${change.value}</span>`;
      } else if (change.removed) {
        return `<span style="text-decoration: line-through; opacity: 0.5;">${change.value}</span>`;
      } else return change.value;
    })
    .join('');
}

export function filetypeToReadable(filetype) {
  const str = filetype.split('/')[1].toUpperCase();
  if (str == 'SVG+XML') return 'SVG';
  if (str == 'JPEG') return 'JPG';
  return str;
}

export function bytesToReadable(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  if (bytes == 0) return '0 B';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  if (i == 0) return bytes + ' ' + sizes[i];
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}
