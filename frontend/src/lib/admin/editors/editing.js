import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';

import api from '$/api';
import heimdall from '$/heimdall';
import { unsaved } from '@/stores';
import { ask } from '@/dialog';
import { deep, deleteFields } from '%/utils';
import fields from '%/fields';

function checkRoot(root) {
  if (!root) throw new Error('Root pathname was not provided');
}

function getNewPathname(root, oldKey, newKey) {
  // pathname: root/oldKey/...
  // newPathname: root/newKey/...
  checkRoot(root);
  const pathname = get(page).url.pathname;
  const prefix = `${root}/${oldKey}`; // (not a RegExp: a new item's key is '+')
  return pathname.startsWith(prefix) ? `${root}/${newKey}${pathname.slice(prefix.length)}` : pathname;
}

function gotoRoot(root) {
  checkRoot(root);
  goto(root, { replaceState: true, noScroll: true });
}

async function save(collection, item, itemOriginal, { root } = {}) {
  const isNew = item.id == '+';
  const oldKey = isNew ? '+' : (itemOriginal.slug ?? itemOriginal.id); // (the url of a new item has '+')

  // clone data
  const itemData = deep.copy(item);

  // cleanup
  await deleteFields(itemData, ['user_created', 'date_created', 'user_updated', 'date_updated']);

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
  const newKey = item.slug ?? item.id; // (a new item's id is known only now)

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

async function cancel(item, itemOriginal, { root } = {}) {
  if (await ask('Cofnąć wszystkie niezapisane zmiany?', { ok: 'Cofnij zmiany', danger: true })) {
    if (item.id == '+') {
      unsaved.set(false);
      gotoRoot(root);
    } else {
      item = deep.copy(itemOriginal);
    }
  }
  return [item, itemOriginal];
}

// `prompt: false`: the caller has already asked
async function remove(collection, id, { root, prompt = null, parent = null, index = null } = {}) {
  if (
    prompt === false ||
    (await ask(prompt ?? 'Usunąć ten element? Tego nie można cofnąć.', { ok: 'Usuń', danger: true }))
  ) {
    if (id != '+') {
      const ids = [id];
      await api.items(collection).deleteOne(id);

      // refresh indexes
      if (index != null) {
        const filters = [{ parent: parent ? { _eq: parent } : { _null: true } }];
        const options = {
          fields: ['id', 'index'],
          filter: { _and: filters },
        };
        const itemsToUpdate = (await api.items(collection).readByQuery(options)).data;
        for (const { id, index: i } of itemsToUpdate) {
          if (i > index) {
            await api.items(collection).updateOne(id, { index: i - 1 });
            ids.push(id);
          }
        }
      }

      heimdall.emit(collection, ids);
    }
    unsaved.set(false);
    gotoRoot(root);
    return true;
  } else {
    return false;
  }
}

export default { save, remove, cancel };
