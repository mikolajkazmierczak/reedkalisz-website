// Moves an element to the end of <body>: a fixed overlay inside a stacking context (the editor's content is one)
// would stay under that context's neighbours, whatever its z-index.
export function portal(node) {
  document.body.appendChild(node);
  return { destroy: () => node.remove() }; // Svelte removes only a destroyed component's top nodes, not this one
}
