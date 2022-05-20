import { writable } from 'svelte/store';

export const page = writable(null); // [str] or { title [str], path: [{ href [str], name [str]}, ...]}
export const error = writable(null); // [str]
