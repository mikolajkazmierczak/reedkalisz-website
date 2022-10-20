import { get } from 'svelte/store';

import { io } from 'socket.io-client';
import { me } from '$lib/auth';

export const baseUrl = 'http://localhost:999';
// export const baseUrl = 'http://192.168.1.10:999';
// export const baseUrl = 'http://formixhome.ddns.net:999';
// export const baseUrl = 'http://produktpolski.ddns.net:999';

class Socket {
  constructor(url) {
    this.socket = io(url);
  }
  close() {
    this.socket.close();
  }

  onChanges(listener) {
    this.socket.on('changes', listener);
  }
  offChanges(listener) {
    this.socket.off('changes', listener);
  }
  emitChanges(collection, ids) {
    if (!Array.isArray(ids)) ids = [ids];
    const data = {
      collection,
      ids,
      user: get(me).id
    };
    this.socket.emit('changes', data);
  }

  checkMatch(data, collection, ids = null) {
    // check if:
    // - collection matches
    // - optionally check if any ids from `ids` array are in `data.ids` array
    // return:
    // - match [boolean]
    // - ids [null OR array] - empty array when ids was passed and nothing matched
    // - me [boolean] - whether the user was current user
    if (ids && !Array.isArray(ids)) ids = [ids];
    const matchingIds = ids ? data.ids.filter(id => ids.includes(id)) : null;
    const match = data.collection === collection && (ids === null || matchingIds);
    return {
      match,
      me: get(me).id == data.user,
      ids: matchingIds
    };
  }
}

export default new Socket(baseUrl);
