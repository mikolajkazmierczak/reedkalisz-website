import { writable } from 'svelte/store';

export let editing = writable(false);
export let modified = writable(false);

// what the editor's panel shows: a block, { element }, or one of its banners, { element, tile } (their _ids); null: the
// list of blocks
export let selected = writable(null);

// the picked block's moves, from the editor (null when it's closed): its buttons beside its name on the page use them
// (see Element) - { move(by), remove(), first, last }
export let actions = writable(null);
