import api from '$/api';
import heimdall from '$/heimdall';
import { treeGetItem } from '%/utils';

export const smallestCellWidth = 2.25;
export const hierarchyCellWidth = smallestCellWidth * 0.8;

export function getColumnWidths(head, tree, order, maxDepth) {
  let widths = [];
  if (order) widths.push(smallestCellWidth + 'rem');
  if (tree) widths.push(hierarchyCellWidth * (maxDepth + 1) + 'rem');
  widths.push(
    ...head.map(h => {
      if (h.width) widths.push(h.width);
      if (h.checkbox) return smallestCellWidth + 'rem';
      if (h.id || h.thin) return '4rem';
      if (h.blame) return 'minmax(20ch, 1fr)';
      return 'minmax(15ch, 1fr)';
    })
  );
  return widths.join(' ');
}

export async function saveAfterMove(collection, tree, oldItemData, newItemData) {
  function getItemsToUpdate(tree, parentID, startIndex) {
    const parent = treeGetItem(tree, parentID); // if parentID is null, we're at the root -> parent is undefined
    const children = parent?.children ?? tree; // root edge case
    const updated = children.filter(c => c.index >= startIndex);
    const indexes = updated.map(c => c.index);
    const ids = updated.map(c => c.id);
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
    await Promise.all(indexes.map(i => api.items(collection).updateOne(children[i].id, { index: i })));
    movedItemsIDs.push(...ids);
  } else {
    // get indexes of new parent's children, old parent's children and update both
    const newChildrenData = getItemsToUpdate(tree, parent, index + 1);
    const oldChildrenData = getItemsToUpdate(tree, oldParent, oldIndex);
    const { children: newChildren, indexes: newIndexes, ids: newIDs } = newChildrenData;
    const { children: oldChildren, indexes: oldIndexes, ids: oldIDs } = oldChildrenData;
    await Promise.all([
      ...newIndexes.map(i => api.items(collection).updateOne(newChildren[i].id, { index: i })),
      ...oldIndexes.map(i => api.items(collection).updateOne(oldChildren[i].id, { index: i }))
    ]);
    movedItemsIDs.push(...newIDs, ...oldIDs);
  }

  heimdall.emit(collection, movedItemsIDs);
}
