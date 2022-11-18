import { goto } from '$app/navigation';

import api from '$/api';
import socket from '$/heimdall';
import { edited } from '@/stores';
import { deleteFields } from '$/utils';

async function save(collection, item, itemOriginal, fields, fieldsToIgnore = [], reloadPath = null) {
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
  if (reloadPath) goto(reloadPath, { replaceState: true, noScroll: true });

  return [item, itemOriginal];
}

async function del(collection, id, reloadPath = null, message = null) {
  if (confirm(message ?? 'Czy na pewno chcesz usunąć ten element?')) {
    if (id != '+') {
      await api.items(collection).deleteOne(id);
      socket.emitChanges(collection, id);
    }

    if (reloadPath) goto(reloadPath, { replaceState: true, noScroll: true });
  }
}

async function cancel(item, itemOriginal, reloadPath) {
  if (item.id == '+') {
    if (reloadPath) goto(reloadPath, { replaceState: true, noScroll: true });
  } else {
    item = JSON.parse(JSON.stringify(itemOriginal));
  }
  return [item, itemOriginal];
}

export default { save, del, cancel };
