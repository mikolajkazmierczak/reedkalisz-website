import { goto } from '$app/navigation';

import api from '$lib/api';
import socket from '$lib/admin/heimdall';
import { edited } from '$lib/admin/stores';
import { deleteFields } from '$lib/utils';

async function save(collection, items, itemsOriginal, fields, fieldsToIgnore = [], reload = false, path = '/admin') {
  const isSingle = !Array.isArray(items);
  if (isSingle) items = [items];

  for (let item of items) {
    // get data and cleanup
    const itemData = JSON.parse(JSON.stringify(item));
    await deleteFields(itemData, fieldsToIgnore);
    // save
    if (item.id == '+') {
      delete itemData.id;
      const res = await api.items(collection).createOne(itemData);
      item.id = res.id;
    } else {
      await api.items(collection).updateOne(item.id, itemData);
    }
    // read item again beacuse nested fields may have been added (with their ids)
    item = await api.items(collection).readOne(item.id, { fields });
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
