import api from '$/api';
import heimdall from '$/heimdall';
import { treeGetItem } from '%/utils';

const smallestCellWidth = 2.25;
export const hierarchyCellWidth = smallestCellWidth * 0.8;
const checkboxCellWidth = 1.4; // the flag columns: narrow, there are many of them
// the "add a subcategory" column: its grey cell, over the row's padding and the gap after it (see TableRow), is a
// little wider than the row is tall (a small button, 1.5rem, and the row's padding above and below), the button in
// its middle
export const addCellWidth = 'calc(1.5rem + 2 * var(--row-pad) + 0.6rem - var(--cell-pad) - var(--col-gap))';

// a row of the table is being dragged (it carries its path, see TableRow), not a file or a text from elsewhere: only
// the row's dragend closes a drop zone, nothing would close one opened for those
export const draggingRow = (e) => e.dataTransfer?.types.includes('path');

// a whole list (a global's, not searched) sorted here by Table's `sort`: as text, numbers as numbers; `value` reads a
// field that isn't the item's own (a producer's name)
export function sorted(list, sort, value = (item, field) => item[field]) {
  if (!sort) return list;
  const field = sort.replace(/^-/, '');
  const way = sort.startsWith('-') ? -1 : 1;
  const text = (item) => String(value(item, field) ?? '');
  return [...list].sort((a, b) => way * text(a).localeCompare(text(b), 'pl', { numeric: true }));
}

export function getColumnWidths(head, tree, order, maxDepth) {
  // the columns in the order of TableRow: "add a subcategory" (a tree), the hierarchy (a tree or an order), the head's
  let widths = [];
  if (tree) widths.push(addCellWidth);
  if (tree || order) widths.push(hierarchyCellWidth * (maxDepth + 1) + 'rem');
  widths.push(
    ...head.map((h) => {
      if (h.width) return h.width;
      if (h.checkbox) return checkboxCellWidth + 'rem';
      // a Blame pill (an avatar, a name, a date), cut when short: it gives way to the text (a name, a title), both
      // when the table is narrow (a smaller minimum) and wide (half the share). Shares, not a cap like 16.5rem: a
      // column with a set maximum grows to it before the shares get anything
      if (h.blame) return 'minmax(7rem, 1fr)';
      return 'minmax(10rem, 2fr)';
    }),
  );
  return widths.join(' ');
}

export async function saveAfterMove(collection, tree, oldItemData, newItemData) {
  function getItemsToUpdate(tree, parentID, startIndex) {
    const parent = treeGetItem(tree, parentID); // if parentID is null, we're at the root -> parent is undefined
    const children = parent?.children ?? tree; // root edge case
    const updated = children.filter((c) => c.index >= startIndex);
    const indexes = updated.map((c) => c.index);
    const ids = updated.map((c) => c.id);
    return { children, indexes, ids };
  }

  const { id, parent, index } = newItemData;
  const movedItemsIDs = [id];

  // update the new item's parent and index
  await api.items(collection).updateOne(id, { parent, index });

  // update indexes of both parent's children
  const oldParent = oldItemData.parent;
  const oldIndex = oldItemData.index;
  if (parent == oldParent) {
    if (index == oldIndex) return;
    const startIndex = index > oldIndex ? oldIndex : index + 1;
    // get indexes of parent's children and update them
    const { children, indexes, ids } = getItemsToUpdate(tree, parent, startIndex);
    await Promise.all(indexes.map((i) => api.items(collection).updateOne(children[i].id, { index: i })));
    movedItemsIDs.push(...ids);
  } else {
    // get indexes of new parent's children, old parent's children and update both
    const newChildrenData = getItemsToUpdate(tree, parent, index + 1);
    const oldChildrenData = getItemsToUpdate(tree, oldParent, oldIndex);
    const { children: newChildren, indexes: newIndexes, ids: newIDs } = newChildrenData;
    const { children: oldChildren, indexes: oldIndexes, ids: oldIDs } = oldChildrenData;
    await Promise.all([
      ...newIndexes.map((i) => api.items(collection).updateOne(newChildren[i].id, { index: i })),
      ...oldIndexes.map((i) => api.items(collection).updateOne(oldChildren[i].id, { index: i })),
    ]);
    movedItemsIDs.push(...newIDs, ...oldIDs);
  }

  heimdall.emit(collection, movedItemsIDs);
}
