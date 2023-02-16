import { get } from 'svelte/store';
import { onDestroy } from 'svelte';

import { io } from 'socket.io-client';
import { me } from '$/auth';

// export const baseUrl = 'http://localhost:9999';
// export const baseUrl = 'http://192.168.1.10:9999';
// export const baseUrl = 'http://formixhome.ddns.net:9999';
// export const baseUrl = 'http://produktpolski.ddns.net:9999';
export const baseUrl = 'https://new.reed.kalisz.pl';

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
  emitChanges(collection, ids = null, { refresh = false, selfBroadcast = true } = {}) {
    // TODO: test the additional options
    if (ids && !Array.isArray(ids)) ids = [ids];
    const data = {
      collection,
      ids,
      user: get(me).id,
      selfBroadcast,
      refresh
    };
    this.socket.emit('changes', data);
  }

  onFetch(listener) {
    this.socket.on('fetch', listener);
  }
  offFetch(listener) {
    this.socket.off('fetch', listener);
  }
  emitFetch(companyName, data) {
    this.socket.emit('fetch', { companyName, data });
  }
}

class Heimdall {
  constructor(socket) {
    this.socket = socket;
  }

  emit(collection, ids, options) {
    this.socket.emitChanges(collection, ids, options);
  }
  listen(func, root = false) {
    const listener = data => {
      const match = (collection, ids) => this.match(data, collection, ids);
      const filter = ids => this.filter(data, ids);
      const isMe = get(me).id == data.user;
      func({ match, filter, me: isMe, data });
    };

    this.socket.onChanges(listener);

    onDestroy(() => {
      this.socket.offChanges(listener);
      if (root) this.socket.close();
    });
  }

  ask(companyName, data) {
    this.socket.emitFetch(companyName, data);
  }
  get(func, root = false) {
    this.socket.onFetch(func);

    onDestroy(() => {
      this.socket.offFetch(func);
      if (root) this.socket.close();
    });
  }

  filter(data, ids = null) {
    // get ids from `data.ids` that are in `ids`
    if (ids && !Array.isArray(ids)) ids = [ids];
    return ids ? data.ids.filter(id => ids.includes(id)) : [];
  }
  match(data, collection, ids = null) {
    // check if:
    // - collection matches
    // - optionally check if any ids from `data.ids` are in `ids`
    return data.collection === collection && (ids === null || this.filter(data, ids).length != 0);
  }
}

const socket = new Socket(baseUrl);
export default new Heimdall(socket);
