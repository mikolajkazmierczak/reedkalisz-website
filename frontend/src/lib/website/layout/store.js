import { writable } from 'svelte/store';

export let layout = writable([]);

export let editing = writable(false);
export let modified = writable(false);
