import { tick } from 'svelte';

function reindex(items) {
  // Reassigns indexes from scratch, making sure they are sequential and start from 0.
  let i = 0;
  for (const item of items) item.index = i++;
  items.sort((a, b) => a.index - b.index);
}

export function handleIndexClick(e) {
  e.detail.e.target.select();
}

export async function handleIndexInput(e, items, item) {
  // WARNING: This function works in-place.
  // Validate the input (setting the index to 0 if incorrect) and fixes the new order.
  const input = parseInt(e.detail.e.target.value);
  const inputIndex = isNaN(input) || input < 0 ? 0 : input; // item property (with basic validation)
  const orderIndex = inputIndex + items.length; // order in the array (with removing items)

  const currentIndex = items.findIndex(m => m.uid === uid);
  items.splice(currentIndex, 1); // remove the item from the array
  items.splice(orderIndex, 0, { ...item, index: inputIndex }); // insert at the new index
  reindex(items);
  await tick();
  e.detail.e.target.focus();
}
