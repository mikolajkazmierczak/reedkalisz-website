import { goto } from '$app/navigation';

import api from '$lib/api';
import socket from '$lib/admin/heimdall';
import { edited } from '$lib/admin/stores';
import { deleteFields, diff, makeTree, treeFlatten } from '$lib/utils';

async function save(
  collection,
  items,
  itemsOriginal,
  fields,
  fieldsToIgnore = [],
  reload = false,
  path = '/admin',
  tree = false
) {
  console.log(JSON.parse(JSON.stringify(items)));
  const isSingle = !Array.isArray(items);
  if (isSingle) items = [items];

  if (tree) {
    items = treeFlatten(items);
    itemsOriginal = treeFlatten(itemsOriginal);
  }
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    let itemOriginal = itemsOriginal.find(i => i.id == item.id);
    const itemData = JSON.parse(JSON.stringify(item));
    await deleteFields(itemData, fieldsToIgnore);
    if (itemOriginal) {
      const itemOriginalData = JSON.parse(JSON.stringify(itemOriginal));
      await deleteFields(itemOriginalData, fieldsToIgnore);
      console.log(item.id, itemOriginal);
      let diffData = await diff(itemData, itemOriginalData, fieldsToIgnore);
      let changed = diffData.changed;
      let changes = diffData.diff;
      console.log(changes);
      console.log(item.id, changed);
      if (!changed) continue;
    }

    // get data and cleanup
    // save
    if (item.id == '+') {
      delete itemData.id;
      console.log('create', itemData);
      const res = await api.items(collection).createOne(itemData);
      item.id = res.id;
    } else {
      console.log('update', item.id, itemData);
      await api.items(collection).updateOne(item.id, itemData);
    }
    // read item again beacuse nested fields may have been added (with their ids)
    items[i] = await api.items(collection).readOne(item.id, { fields });
    console.log('item', JSON.parse(JSON.stringify(item)));
    console.log(JSON.parse(JSON.stringify(item)));
  }
  if (tree) {
    console.log('tree', JSON.parse(JSON.stringify(items)));
    items = makeTree(items);
    console.log('after', JSON.parse(JSON.stringify(items)));
  }

  // replace original
  itemsOriginal = JSON.parse(JSON.stringify(items));
  edited.set(false);
  // broadcast changes to other admins
  socket.emitChanges(
    collection,
    items.map(item => item.id)
  );

  // reload (if needed) while replacing history
  if (reload) goto(path, { replace: true, noscroll: true });

  if (isSingle) {
    items = items[0];
    itemsOriginal = itemsOriginal[0];
  }
  return [items, itemsOriginal];
}

async function del(collection, id, path = null, message = null, callback = null) {
  if (confirm(message ?? 'Czy na pewno chcesz usunąć ten element?')) {
    if (id != '+') {
      await api.items(collection).deleteOne(id);
      socket.emitChanges(collection, id);
    }
    if (callback) callback();
    if (path) goto(path, { replace: true });
  }
}

async function cancel(item, itemOriginal, path) {
  if (item.id == '+') goto(path);
  else item = JSON.parse(JSON.stringify(itemOriginal));

  return [item, itemOriginal];
}

export default { save, del, cancel };
