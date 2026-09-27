import { writable } from 'svelte/store';

// { title, icon, tabs?: [{ label, href, active }], buttons?: [{ label, onClick }] } (see Header)
export const header = writable(null);
export const errors = writable([]); // [str]

export const unsaved = writable(false); // bool
