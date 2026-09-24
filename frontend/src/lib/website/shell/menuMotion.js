import { quartOut, cubicIn } from 'svelte/easing';

// The phone menu opens out of the top bar: the head grows down and turns navy, the rest drops in behind it.
// Quick in, quicker out. `css` is a factory, so nothing is measured when the motion is off.
function motion({ enabled = true, out = false, delay = 0 }, inMs, outMs, css) {
  if (!enabled || matchMedia('(prefers-reduced-motion: reduce)').matches) return { duration: 0 };
  return { delay: out ? 0 : delay, duration: out ? outMs : inMs, easing: out ? cubicIn : quartOut, css: css() };
}

export function growHead(node, opts = {}) {
  return motion(opts, 260, 180, () => {
    const grow = node.offsetHeight - node.firstElementChild.offsetHeight;
    return (t) =>
      `clip-path: inset(0 0 ${(1 - t) * grow}px 0);` +
      `background-color: color-mix(in srgb, var(--navy) ${t * 100}%, var(--paper));`;
  });
}

export function dropIn(node, opts = {}) {
  return motion(opts, 240, 120, () => (t, u) => `opacity: ${t}; transform: translateY(${-u * 0.75}rem);`);
}

export function cover(node, opts = {}) {
  return motion(opts, 200, 140, () => (t) => `opacity: ${t};`);
}
