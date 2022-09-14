import { goto } from '$app/navigation';

import api from '$lib/api';
import socket from '$lib/admin/heimdall';
import { deleteFields } from '$lib/utils';

async function save(collection, item, itemOriginal, fieldsToIgnore = [], reload = false, path = '/admin') {
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

  // replace original
  itemOriginal = JSON.parse(JSON.stringify(item));
  // broadcast changes to other admins
  socket.emitChanges(collection, item.id);
  // reload (if needed) while replacing state
  if (reload) goto(path, { replace: true });

  return [item, itemOriginal];
}

async function cancel(item, itemOriginal, path) {
  if (item.id == '+') goto(path);
  else item = JSON.parse(JSON.stringify(itemOriginal));

  return [item, itemOriginal];
}

export default { save, cancel };
