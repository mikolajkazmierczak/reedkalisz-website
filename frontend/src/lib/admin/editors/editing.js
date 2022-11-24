import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';

import api from '$/api';
import heimdall from '$/heimdall';
import { unsaved } from '@/stores';
import { deep, deleteFields } from '$/utils';
import fields from '$/fields';

function checkRoot(root) {
  if (!root) throw new Error('Root pathname was not provided');
}

function getNewPathname(root, oldKey, newKey) {
  // pathname: root/oldKey/...
  // newPathname: root/newKey/...
  checkRoot(root);
  const pathname = get(page).url.pathname;
  return pathname.replace(new RegExp(`^${root}/${oldKey}`), `${root}/${newKey}`);
}

function gotoRoot(root) {
  checkRoot(root);
  goto(root, { replaceState: true, noScroll: true });
}

async function save(collection, item, itemOriginal, { root, fieldsToIgnore = [] } = {}) {
  const isNew = item.id == '+';
  const oldKey = itemOriginal?.slug ?? itemOriginal.id;
  const newKey = item?.slug ?? item.id;

  // clone data
  const itemData = deep.copy(item);

  // cleanup
  fieldsToIgnore.push(...['user_created', 'date_created', 'user_updated', 'date_updated']);
  await deleteFields(itemData, fieldsToIgnore);

  // save
  if (isNew) {
    delete itemData.id;
    const res = await api.items(collection).createOne(itemData);
    item.id = res.id;
  } else {
    await api.items(collection).updateOne(item.id, itemData);
  }
  // read item again beacuse nested fields may have been added (with their ids)
  if (!fields[collection].edit) throw new Error(`No fields matching the provided collection "${collection}"`);
  item = await api.items(collection).readOne(item.id, { fields: fields[collection].edit });

  // replace original
  itemOriginal = deep.copy(item);
  heimdall.emit(collection, item.id);
  unsaved.set(false);

  // rewrite url (if needed) while replacing history
  if (oldKey != newKey) {
    const newPathname = getNewPathname(root, oldKey, newKey);
    goto(newPathname, { replaceState: true, noScroll: true, keepFocus: true });
  }

  return [item, itemOriginal];
}

async function cancel(item, itemOriginal, { root, prompt = null } = {}) {
  if (confirm(prompt ?? 'Na pewno chcesz cofnąć zmiany?')) {
    if (item.id == '+') {
      unsaved.set(false);
      gotoRoot(root);
    } else {
      console.log('cancel', JSON.parse(JSON.stringify(item)), JSON.parse(JSON.stringify(itemOriginal)));
      item = deep.copy(itemOriginal);
    }
  }
  return [item, itemOriginal];
}

async function remove(collection, id, { root, prompt = null } = {}) {
  if (confirm(prompt ?? 'Na pewno chcesz usunąć ten element?')) {
    if (id != '+') {
      await api.items(collection).deleteOne(id);
      heimdall.emit(collection, id);
    }
    unsaved.set(false);
    gotoRoot(root);
  }
}

export default { save, remove, cancel };
