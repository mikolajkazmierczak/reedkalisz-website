import { writable } from 'svelte/store';

export const page = writable(null); // str or { title: str, path: [{ href: str, name: str}]}
export const errors = writable([]); // [str]

export const edited = writable(false); // bool
export const save = writable(() => {}); // function
export const cancel = writable(() => {}); // function
