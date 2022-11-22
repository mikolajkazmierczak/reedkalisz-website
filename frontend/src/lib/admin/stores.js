import { writable } from 'svelte/store';

export const header = writable(null); // str or { title: str, path: [{ href: str, name: str}]}
export const errors = writable([]); // [str]

export const unsaved = writable(false); // bool
