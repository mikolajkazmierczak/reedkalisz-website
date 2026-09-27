<script>
  import { createEventDispatcher, tick } from 'svelte';
  import { nanoid } from 'nanoid';
  import { portal } from '@/portal';
  import Button from '@c/Button.svelte';
  import CategoryCode from '@c/CategoryCode.svelte';

  // The admin's select: a button showing the chosen option and, under it, the options in a white box, a search field
  // over them (always: open, type, Enter). Like the browser's own: a click beside the box only closes it, the arrows
  // move, Enter picks, Escape closes; typing on the closed button opens it, searching.
  //   options: [{ id, text, disabled, color, special, depth, code, swatch, note, chosen }]
  //     color   - the option's background (e.g. a status)
  //     special - a choice beside the list ("Wszyscy", "Bez producenta"): a button over it, as the products' "Wszystkie"
  //               and "Bez kategorii", never searched away
  //     depth   - a tree (the categories): its level, drawn with the lines of the ones above, all open
  //     code    - its number in the tree ("4.5.3"), before its name (searched too)
  //     swatch  - a colour (a css background, see $/colors swatch): a pill of it before its name
  //     note    - more about it, on a line of its own under its name in the list, smaller (searched too)
  //     chosen  - already had (e.g. the product's categories, a select adding another): outlined as the one chosen,
  //               picked again it's let go (on:unchoose)
  //   on:change - { detail: { value } }, only when picked by hand
  //   on:unchoose - { detail: { value } }, a `chosen` one picked again: to take it away
  // The one chosen, picked again, is let go too - back to `clearTo` (by default the special with no value: "Brak",
  // "Wszyscy"; none there, a select that needs a value, keeps it).
  const dispatch = createEventDispatcher();

  export let id = `select-${nanoid(6)}`;
  export let value = null;
  export let options = [];
  export let disabled = false;
  export let size = 'normal'; // normal, small, compact (see Input)
  export let color = null; // the button's background
  export let error = null;
  export let borderless = false;
  export let borderRadius = null; // its own (else a squircle by its size, as the Input's fields)
  export let label = null; // its name for screen readers, when nothing labels it
  export let placeholder = null; // on the button while nothing is chosen ("Dodaj kategorię…")
  export let keepOpen = false; // picking one leaves the box open, for the next (adding several) - a special closes it
  export let clearTo = undefined; // what the chosen one picked again goes back to (see above)
  $: empty = clearTo !== undefined ? clearTo : specials.find((o) => o.id === null || o.id === '')?.id;
  export let open = false; // opened right away, e.g. by a "+ add" that shows it
  export let button = null; // the element (focus)

  const GAP = 6; // between the button and the box
  const EDGE = 8; // from the window's edges

  $: selected = options.find((o) => o.id === value) ?? options.find((o) => o.id == value); // (a number from a string)
  $: specials = options.filter((o) => o.special);
  $: listed = options.filter((o) => !o.special);

  let query = '';
  const fold = (text) =>
    String(text ?? '')
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase();
  const words = (o) => fold([o.code, o.text, o.note].filter(Boolean).join(' '));
  // the specials first, then the list: one order for the arrows
  $: shown = [...specials, ...(query ? listed.filter((o) => words(o).includes(fold(query))) : listed)];

  let active = -1; // index in `shown`
  let box;
  let list;
  let search;
  let place = null; // { left, top | bottom, minWidth, maxHeight }

  $: if (open && button && !place) show();

  // where the box goes: under the button, or over it when there's more room there
  // measured once, on opening: while open the box stays put, even when a pick moves the button
  function measure() {
    const r = button.getBoundingClientRect();
    const below = innerHeight - r.bottom - GAP - EDGE;
    const above = r.top - GAP - EDGE;
    const up = below < 240 && above > below;
    return {
      left: Math.max(EDGE, Math.min(r.left, innerWidth - EDGE - Math.max(r.width, 160))),
      top: up ? null : r.bottom + GAP,
      bottom: up ? innerHeight - r.top + GAP : null,
      minWidth: r.width,
      maxHeight: up ? above : below, // the list holds 10 rows at most (see .list), the window may hold fewer
    };
  }

  async function show() {
    if (disabled) return;
    place = measure();
    open = true;
    query = '';
    active = shown.indexOf(selected);
    await tick();
    // as wide as its options: moved left when that runs past the window's edge (a select on the right of a phone)
    const over = place.left + box.offsetWidth - (innerWidth - EDGE);
    if (over > 0) place = { ...place, left: Math.max(EDGE, place.left - over) };
    search?.focus();
    reveal();
  }

  // outlined (see .selected): next to another at the same level they're one block, sharing the line between them
  // (`sel` passed in, so the class directives below update when only `value` changes)
  const outlined = (o, sel) => o && (o === sel || o.chosen);
  const joins = (a, b, sel) => outlined(a, sel) && outlined(b, sel) && (a.depth ?? 0) === (b.depth ?? 0);

  // white fades over the list's ends while there's more to scroll that way
  let fadeTop = false;
  let fadeBottom = false;
  function fades() {
    if (!list) return;
    fadeTop = list.scrollTop > 0;
    fadeBottom = list.scrollTop + list.clientHeight < list.scrollHeight - 1;
  }
  $: if (place && shown) tick().then(fades);

  function close(focusButton = true) {
    if (!place) return;
    place = null;
    open = false;
    query = ''; // the whole list again, before the next show() reads it
    if (focusButton) button?.focus();
    dispatch('close');
  }

  function pick(option) {
    if (!option || option.disabled) return;
    if (option.chosen) {
      dispatch('unchoose', { value: option.id });
      if (!keepOpen) close();
      return;
    }
    // the chosen one again: let go, when there's a "no value" to go back to
    if (option === selected && empty !== undefined && option.id !== empty) option = { id: empty };
    const changed = option.id !== value;
    value = option.id;
    if (changed) dispatch('change', { value }); // before the close: an owner may go on close (see CategoryPicker)
    if (!keepOpen || option.special) close();
  }

  function reveal() {
    list?.children[active - specials.length]?.scrollIntoView({ block: 'nearest' });
  }
  async function move(step) {
    const n = shown.length;
    if (active < 0 && step < 0) active = n; // none active: up goes to the last (as End)
    for (let i = 1; i <= n; i++) {
      const next = (((active + step * i) % n) + n) % n;
      if (!shown[next].disabled) {
        active = next;
        break;
      }
    }
    await tick();
    reveal();
  }

  function keydownButton(e) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      show();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      show().then(() => (query = e.key));
    }
  }
  function keydownBox(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') move(e.key === 'ArrowDown' ? 1 : -1);
    else if (e.key === 'Home' || e.key === 'End') {
      active = e.key === 'Home' ? -1 : shown.length;
      move(e.key === 'Home' ? 1 : -1);
    } else if (e.key === 'Enter') pick(shown[active]);
    else if (e.key === 'Escape') close();
    else if (e.key === 'Tab') close();
    else return;
    e.preventDefault();
    e.stopPropagation(); // Escape is the select's, not the editor's or the popup's under it
  }

  // the search narrows the list: the first option found is the one Enter picks; emptied, back to the chosen one
  // (on a new query only: options rebuilt after a keepOpen pick leave the active one where it is)
  $: if (open) activate(query);
  function activate(q) {
    active = q ? shown.findIndex((o) => !o.disabled && !o.special) : shown.indexOf(selected);
    tick().then(reveal);
  }

  // While it's open the page doesn't scroll - a wheel beside the box, or over a list too short to scroll, would move
  // the button away from it (thinking there's more to see) - only its list does, not past its ends
  function wheel(e) {
    if (!list?.contains(e.target) || list.scrollHeight <= list.clientHeight) e.preventDefault();
  }
  // a page scrolled anyway (the keyboard, a script): the box would stay behind, so it closes
  function scrolled(e) {
    if (place && !box?.contains(e.target)) close(false);
  }
</script>

<svelte:window on:scroll|capture={scrolled} on:resize={() => close(false)} />

<button
  {id}
  type="button"
  class="select {size}"
  class:error
  class:borderless
  class:placeholder={!selected && placeholder}
  role="combobox"
  aria-label={label}
  aria-haspopup="listbox"
  aria-expanded={!!place}
  aria-controls="{id}-list"
  {disabled}
  style:border-radius={borderRadius}
  style:background-color={color}
  bind:this={button}
  on:click={() => (place ? close() : show())}
  on:keydown={keydownButton}>
  <span class="text">
    {#if selected?.swatch}<span class="swatch" style:background={selected.swatch} />{/if}
    {#if selected?.code}<CategoryCode code={selected.code} />{/if}
    {selected?.text ?? placeholder ?? ''}
  </span>
</button>

{#if place}
  <!-- a click beside the box only closes it, it doesn't reach what's under it -->
  <div
    class="backdrop"
    role="presentation"
    use:portal
    on:click={() => close()}
    on:wheel|nonpassive|preventDefault
    on:touchmove|nonpassive|preventDefault />
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="box {size}"
    use:portal
    bind:this={box}
    style:left="{place.left}px"
    style:top={place.top != null ? `${place.top}px` : null}
    style:bottom={place.bottom != null ? `${place.bottom}px` : null}
    style:min-width="{place.minWidth}px"
    style:max-height="{place.maxHeight}px"
    on:wheel|nonpassive={wheel}
    on:keydown={keydownBox}>
    {#if specials.length}
      <div class="specials">
        {#each specials as option, i (option.id)}
          <span class="special" id="{id}-{i}" class:active={i === active}>
            <Button
              small
              width="100%"
              dashed={option !== selected}
              selected={option === selected}
              disabled={option.disabled}
              on:click={() => pick(option)}>
              {option.text}
            </Button>
          </span>
        {/each}
      </div>
    {/if}
    <input
      class="search"
      type="text"
      placeholder="Szukaj..."
      aria-label="Szukaj"
      aria-controls="{id}-list"
      aria-activedescendant={active >= 0 ? `${id}-${active}` : null}
      bind:this={search}
      bind:value={query} />
    <div class="scroll" class:fade-top={fadeTop} class:fade-bottom={fadeBottom}>
      <div
        class="list"
        id="{id}-list"
        role="listbox"
        tabindex="-1"
        aria-label={label}
        bind:this={list}
        on:scroll={fades}>
        {#each shown.slice(specials.length) as option, j (option.id)}
          {@const i = j + specials.length}
          <!-- the arrows move between them (aria-activedescendant), not Tab -->
          <!-- svelte-ignore a11y-click-events-have-key-events a11y-interactive-supports-focus -->
          <div
            id="{id}-{i}"
            class="option"
            class:active={i === active}
            class:selected={outlined(option, selected)}
            class:join-up={joins(option, shown[i - 1], selected)}
            class:join-down={joins(option, shown[i + 1], selected)}
            class:disabled={option.disabled}
            class:colored={option.color}
            role="option"
            aria-selected={option === selected}
            aria-disabled={option.disabled}
            on:pointermove={() => !option.disabled && (active = i)}
            on:click={() => pick(option)}>
            {#each { length: option.depth ?? 0 } as _}<span class="guide" />{/each}
            <span class="label" style:background-color={option.color}>
              {#if option.swatch}<span class="swatch" style:background={option.swatch} />{/if}
              {#if option.code}<CategoryCode code={option.code} />{/if}
              <span class="name" class:coded={option.code}>
                {option.text}
                {#if option.note}<small class="note">{option.note}</small>{/if}
              </span>
            </span>
          </div>
        {:else}
          <div class="empty">Nic nie pasuje</div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  /* as the Input's fields; the arrow takes the border's colour (--line) */
  .select {
    --line: var(--edge);
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 2rem;
    padding: 0.25rem 1.5rem 0.25rem 0.5rem;
    border: solid 1px var(--line);
    border-radius: var(--field-radius);
    corner-shape: squircle;
    font-size: 0.95rem;
    text-align: left;
    background-color: var(--light);
    transition: border-color 100ms;
  }
  .select::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 0.5rem;
    width: 0.65rem;
    aspect-ratio: 10 / 6;
    transform: translateY(-50%);
    background-color: var(--line);
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23000' stroke-width='1.4'/%3E%3C/svg%3E")
      center / contain no-repeat;
    transition: background-color 100ms;
  }
  .select:not([disabled]):hover {
    --line: var(--navy-500);
  }
  .select:focus-visible,
  .select:focus-visible:hover,
  .select[aria-expanded='true'] {
    --line: var(--navy-700);
    outline: none;
  }
  .select[disabled] {
    cursor: not-allowed;
    opacity: 0.6;
  }
  .select.borderless {
    border: none;
    border-radius: 0;
  }
  .select.error,
  .select.error:hover {
    --line: var(--red-500);
  }
  .text {
    min-width: 0; /* cut with "…" when the button is narrower than the option */
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /* a colour: a circle, ringed over the colour as the website's swatches */
  .swatch {
    flex: none;
    display: inline-block;
    vertical-align: middle;
    margin-right: 0.4em;
    width: 1em;
    height: 1em;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px var(--black-20);
  }
  .label .swatch {
    align-self: center;
    margin-right: 0;
  }
  .select.placeholder .text {
    color: rgb(27 47 78 / 0.4); /* as the fields' placeholders */
  }
  .select.small {
    height: 1.5rem;
    padding: 0 1.25rem 0 0.35rem;
    border-radius: var(--field-radius-small);
    font-size: 0.85rem;
  }
  .select.small::after {
    right: 0.35rem;
    width: 0.6rem;
  }
  .select.compact {
    height: 1.2rem;
    padding: 0 1.1rem 0 0.3rem;
    border-radius: var(--field-radius-compact);
    font-size: 0.85rem;
  }
  .select.compact::after {
    right: 0.3rem;
    width: 0.55rem;
  }

  /* over popups and dialogs (1000, 1500), under tooltips (2000) */
  .backdrop {
    z-index: 1600;
    position: fixed;
    inset: 0;
  }
  .box {
    z-index: 1601;
    position: fixed;
    width: max-content; /* (not narrowed by the window's edge: moved left instead, see show) */
    max-width: min(24rem, calc(100vw - 1rem)); /* at least as wide as the button (min-width): longer options wrap */
    display: flex;
    flex-direction: column;
    border: solid 1px var(--edge);
    border-radius: var(--box-radius);
    corner-shape: squircle;
    background-color: var(--light);
    box-shadow: 0 0.375rem 1.25rem var(--black-20);
    overflow: hidden;
    font-size: 0.95rem;
  }
  .box.small,
  .box.compact {
    font-size: 0.85rem;
  }
  .search {
    flex: none;
    margin: 0.35rem;
    padding: 0.25rem 0.5rem;
    height: 1.9rem;
    border: solid 1px var(--edge);
    border-radius: var(--field-radius);
    corner-shape: squircle;
    font-size: inherit;
  }
  .search:hover {
    border-color: var(--navy-500);
  }
  .search:focus {
    outline: none;
    border-color: var(--navy-700);
  }
  .scroll {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  /* ten options without scrolling (one line each: a row is its line and its padding), more scroll */
  .list {
    max-height: calc(10 * (1.25em + 0.6rem) + 0.5rem);
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain; /* its ends don't hand the scroll on to the page */
    padding: 0.25rem 0;
    outline: none;
  }
  .scroll::before,
  .scroll::after {
    content: '';
    pointer-events: none;
    z-index: 1;
    position: absolute;
    left: 0;
    right: 0;
    height: 1.5rem;
    opacity: 0;
    transition: opacity 150ms;
  }
  .scroll::before {
    top: 0;
    background: linear-gradient(var(--light), transparent);
  }
  .scroll::after {
    bottom: 0;
    background: linear-gradient(transparent, var(--light));
  }
  .scroll.fade-top::before,
  .scroll.fade-bottom::after {
    opacity: 1;
  }
  /* side by side, as the products' "Wszystkie" and "Bez kategorii" */
  .specials {
    flex: none;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    gap: 0.35rem;
    padding: 0.35rem 0.35rem 0;
  }
  .special {
    display: flex;
    border-radius: var(--border-radius);
    corner-shape: squircle;
  }
  .special.active {
    outline: solid 2px var(--navy-500);
  }
  /* tree lines, then the option; rows touch so the lines run on */
  .option {
    cursor: pointer;
    display: flex;
    align-items: stretch;
    padding: 0 0.35rem;
  }
  .name.coded {
    margin-left: calc(0.455rem - 0.35em); /* with the gap, 0.455rem from its number (see CategoryCode) */
  }
  .label {
    flex: 1;
    display: flex;
    align-items: baseline;
    gap: 0.35em;
    --code-after: 0; /* the name makes the room (.name.coded): an em here would be the number's, a smaller one */
    min-width: 0;
    padding: 0.3rem 0.5em;
    line-height: 1.25;
    border-radius: var(--field-radius);
    corner-shape: squircle;
  }
  .name {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .note {
    display: block;
    font-size: 0.8em;
    font-weight: 400;
    color: var(--ink-muted);
  }
  /* a level of a tree: a line under the first digit of the number of the level above (past the option's padding, in
     the middle of a digit - a CategoryCode is 0.85em, bold), the next level's option a little after it */
  .guide {
    flex: none;
    position: relative;
    width: 1.1em;
  }
  .guide::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0.72em;
    border-left: solid 1px var(--black-10);
  }
  .option.active .label {
    background-color: var(--blue-100); /* as a button under the pointer */
  }
  /* the one chosen: bold, and outlined (a coloured one keeps its colour inside) */
  .option.selected {
    font-weight: 600;
  }
  .option.selected .label {
    box-shadow: inset 0 0 0 1.5px var(--navy-700);
  }
  /* one line between two outlined ones, not two: the lower one up over it, square where they meet */
  .option.join-up {
    margin-top: -1.5px;
  }
  .option.join-up .label {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  .option.join-down .label {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  /* a coloured one keeps its colour: under the pointer it's framed instead */
  .option.colored.active .label {
    box-shadow: inset 0 0 0 2px var(--navy-500);
  }
  /* as a disabled button */
  .option.disabled {
    cursor: not-allowed;
  }
  .option.disabled .label {
    background-color: var(--grey-100);
  }
  .option.disabled .name {
    color: var(--grey-500);
  }
  .option.disabled :global(.code) {
    opacity: 0.5;
  }
  .empty {
    padding: 0.3rem 0.85rem;
    color: var(--grey-500);
  }
</style>
