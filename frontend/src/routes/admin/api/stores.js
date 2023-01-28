import { writable } from 'svelte/store';

export const apiSnapshot = writable(null); // [obj]
export const apiSnapshotDate = writable(null); // [str] (ISO date)
export const selected = writable([]); // [str] (code)
export const expanded = writable([]); // [str] (code)
