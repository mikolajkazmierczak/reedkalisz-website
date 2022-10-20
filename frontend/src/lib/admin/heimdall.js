import { get } from 'svelte/store';

import { io } from 'socket.io-client';
import { me } from '$lib/auth';

// export const baseUrl = 'http://localhost:999';
// export const baseUrl = 'http://192.168.1.10:999';
// export const baseUrl = 'http://formixhome.ddns.net:999';
export const baseUrl = 'http://produktpolski.ddns.net:999';

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

  checkMatches(data, collection, ids) {
    // check if any ids from `ids` array are in `data.ids` array
    console.log('data.ids', data.ids);
    console.log('ids', ids);
    if (!Array.isArray(ids)) ids = [ids];
    const matchingIds = data.ids.filter(id => ids.includes(id));
    console.log('matchingIds', matchingIds);
    const matches = data.collection === collection && matchingIds.length;
    return {
      matches,
      me: get(me).id == data.user,
      ids: matchingIds.length ? matchingIds : null
    };
  }
}

export default new Socket(baseUrl);
