// Moves an element to the end of <body>: a fixed overlay inside a stacking context (the editor's content is one)
// would stay under that context's neighbours, whatever its z-index. Inside a `data-portal` host (the homepage's editor
// on the website, which carries the admin's look) it goes to the end of that host instead, keeping the look.
export function portal(node) {
  const host = node.parentElement?.closest('[data-portal]') ?? document.body;
  host.appendChild(node);
  return { destroy: () => node.remove() }; // Svelte removes only a destroyed component's top nodes, not this one
}
