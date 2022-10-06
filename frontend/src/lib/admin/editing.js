import { goto } from '$app/navigation';

import api from '$lib/api';
import socket from '$lib/admin/heimdall';
import { edited } from '$lib/admin/stores';
import { deleteFields } from '$lib/utils';

async function save(collection, item, itemOriginal, fields, fieldsToIgnore = [], reload = false, path = '/admin') {
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

  // replace original
  itemOriginal = JSON.parse(JSON.stringify(item));
  edited.set(false);
  // broadcast changes to other admins
  socket.emitChanges(collection, item.id);
  // reload (if needed) while replacing history
  if (reload) goto(path, { replace: true, noscroll: true });

  return [item, itemOriginal];
}

async function del(collection, item, message = null, path = null) {
  await api.items(collection).deleteOne(item.id);
  if (confirm(message ?? 'Czy na pewno chcesz usunąć ten element?')) {
    await api.items(collection).deleteOne(item.id);
    socket.emitChanges(collection, item.id);
    if (path) goto(path);
  }
}

async function cancel(item, itemOriginal, path) {
  if (item.id == '+') goto(path);
  else item = JSON.parse(JSON.stringify(itemOriginal));

  return [item, itemOriginal];
}

export default { save, del, cancel };
