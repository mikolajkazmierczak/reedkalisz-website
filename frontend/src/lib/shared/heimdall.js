import { PUBLIC_HEIMDALL_URL } from '$env/static/public';
import { get } from 'svelte/store';
import { onDestroy } from 'svelte';

import { io } from 'socket.io-client';
import { me } from '$/auth';

// this should be "https://reed.kalisz.pl" not "https://reed.kalisz.pl/heimdall", or "https://localhost:9999"
export const baseUrl = PUBLIC_HEIMDALL_URL;

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
    if (ids && !Array.isArray(ids)) ids = [ids];
    const data = {
      collection,
      ids,
      user: get(me).id,
      selfBroadcast,
      refresh,
    };
    this.socket.emit('changes', data);
  }

  // a scan of the company's api: heimdall's reply (the scan, { error } or { notice }), or an Error when none can come -
  // not connected, nothing within `timeout`, or the connection lost meanwhile (a reconnected one never hears of it)
  fetch(company, timeout) {
    return new Promise((resolve, reject) => {
      // (an emit while disconnected is held until it reconnects, maybe never: heimdall down)
      if (!this.socket.connected) return reject(new Error('Brak połączenia z heimdallem.'));
      const end = () => {
        clearTimeout(timer);
        this.socket.off('fetch', reply);
        this.socket.off('disconnect', lost);
      };
      const reply = (data) => (end(), resolve(data));
      const fail = (message) => (end(), reject(new Error(message)));
      const lost = () => fail('Połączenie z heimdallem zostało przerwane (mógł się zrestartować).');
      const timer = setTimeout(() => fail(`Heimdall nie odpowiedział w ciągu ${timeout / 60000} minut.`), timeout);
      this.socket.on('fetch', reply);
      this.socket.on('disconnect', lost);
      this.socket.emit('fetch', { company });
    });
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
    const listener = (data) => {
      const match = (collection, ids) => this.match(data, collection, ids);
      const isMe = get(me)?.id == data.user; // (logged out: a listener that outlives the admin, e.g. the menu's)
      func({ match, me: isMe, data });
    };

    this.socket.onChanges(listener);

    onDestroy(() => {
      this.socket.offChanges(listener);
      if (root) this.socket.close();
    });
  }

  // see Socket.fetch; the time limit is for a heimdall that's up but silent: past what heimdall gives a supplier (see
  // its FETCH_LIMIT), so its { error } naming the supplier comes first
  ask(company, { timeout = 10 * 60 * 1000 } = {}) {
    return this.socket.fetch(company, timeout);
  }

  filter(data, ids = null) {
    // get ids from `data.ids` that are in `ids`
    if (ids && !Array.isArray(ids)) ids = [ids];
    return ids ? data.ids.filter((id) => ids.includes(id)) : [];
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
