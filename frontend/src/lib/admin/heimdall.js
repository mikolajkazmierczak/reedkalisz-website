import { get } from 'svelte/store';

import { io } from 'socket.io-client';
import { me } from '$lib/auth';

export const baseUrl = 'http://localhost:999';
// export const baseUrl = 'http://83.21.66.94:999';

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
  emitChanges(collection, id) {
    this.socket.emit('changes', {
      collection,
      id,
      user: get(me).id
    });
  }
}

export default new Socket(baseUrl);
