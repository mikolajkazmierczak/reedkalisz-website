import api from '$lib/api';
import { error } from '$lib/admin/stores';
import { writable } from 'svelte/store';

export const auth = writable(false);
export const me = writable(null);

export async function readme() {
  try {
    const user = await api.users.me.read();
    me.set(user);
    auth.set(true);
    return me;
  } catch (err) {
    if (err.response.status == 401) {
      // unathorized
      // DO NOT set $me to null or the user will loose all their progress
      // instead try to reauthenticate ($auth=false will show the login form)
      auth.set(false);
    } else {
      // unexpected error
      error.set(err);
    }
    return null;
  }
}

export async function login(email, password) {
  await api.auth.login({ email, password });
  await readme();
  return true;
}

export async function logout() {
  await api.auth.logout();
  me.set(null);
  auth.set(false);
  return true;
}

export default { auth, me, readme, logout };
