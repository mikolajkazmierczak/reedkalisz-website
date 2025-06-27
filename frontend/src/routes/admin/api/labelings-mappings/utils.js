import { tick } from 'svelte';

function reindex(items) {
  // Reassigns indexes from scratch to make sure they are sequential and start from 0.
  items.map((item, i) => (item._index = i)).sort((a, b) => a._index - b._index);
}

export function handleIndexClick(e) {
  e.detail.e.target.select();
}

export async function handleIndexInput(e, items, item) {
  // WARNING: This function works in-place.
  // Validate the input (setting the index to 0 if incorrect) and fixes the new order.
  const input = parseInt(e.detail.e.target.value);
  const inputIndex = isNaN(input) || input < 0 ? 0 : input > items.length ? items.length : input; // basic validation

  const currentIndex = items.findIndex(m => m._uid === item._uid);
  items.splice(currentIndex, 1); // remove the item from the array
  items.splice(inputIndex, 0, { ...item, index: inputIndex }); // insert at the new index
  reindex(items);

  await tick();
  e.detail.e.target.focus();
}
