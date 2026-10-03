<script>
  import { createEventDispatcher, tick } from 'svelte';
  import { nanoid } from 'nanoid';
  import { portal } from '@/portal';
  import { pluralWord } from '@/plural';
  import Icon from '$c/Icon.svelte';
  import { NO_COLOR } from '$/colors';
  import Button from '@c/Button.svelte';
  import CategoryCode from '@c/CategoryCode.svelte';

  // The admin's select: a button showing the chosen option and, under it, the options in a white box, a search field
  // over them (always: open, type, Enter). Like the browser's own: a click beside the box only closes it, the arrows
  // move, Enter picks, Escape closes; typing on the closed button opens it, searching.
  //   options: [{ id, text, disabled, color, special, depth, code, swatch, image, icon, note, noteImage, after, chosen }]
  //     color   - the option's background (e.g. a status)
  //     special - a choice beside the list ("Wszystkie", "Brak"): a button over it, as the products' "Wszystkie"
  //               and "Bez kategorii", never searched away
  //     depth   - a tree (the categories): its level, drawn with the lines of the ones above, all open
  //     code    - its number in the tree ("4.5.3"), before its name (searched too)
  //     swatch  - a colour (a css background, see $/colors swatch): a pill of it before its name; `true` for a colour
  //               without one yet: the website's "no colour" (a white dot crossed out) in its place
  //     image   - a picture's url (a company's favicon) before its name
  //     icon    - an icon's name, in a swatch's place (the gallery among the variants)
  //     note    - more about it, on a line of its own under its name in the list, smaller (searched too)
  //     noteImage - a picture's url before the note (a company's favicon)
  //     after   - more about it on the button, after its name, fainter (a price view's amounts)
  //     chosen  - already had (e.g. the product's categories, a select adding another): marked as the one chosen,
  //               picked again it's let go (on:unchoose)
  //   on:change - { detail: { value } }, only when picked by hand
  //   on:unchoose - { detail: { value } }, a `chosen` one picked again: to take it away
  // `multiple`: `value` is a list, a pick toggles the option in it and the box stays open (e.g. a table's columns); a
  // special is picked on its own: with no value ("Wszyscy") it empties the list, else it's the only one ("Brak").
  // The button shows that special while it's empty, the option when there's one, and how many there are after that
  // ("3 Wybrane").
  // `icon`: the button is just that icon (see Table); `search={false}`: no search field.
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
  export let emptyLabel = null; // on the button while none are chosen (or the special with no value, "Wszyscy"), as a
  // field's name ("PRODUCENT")
  export let keepOpen = false; // picking one leaves the box open, for the next (adding several) - a special closes it
  export let clearTo = undefined; // what the chosen one picked again goes back to (see above)
  $: empty = clearTo !== undefined ? clearTo : specials.find((o) => isEmpty(o.id))?.id;
  export let open = false; // opened right away, e.g. by a "+ add" that shows it
  export let button = null; // the element (focus)
  export let multiple = false;
  export let icon = null;
  export let title = null; // what an icon button is for, on hover
  export let search = true;

  const GAP = 6; // between the button and the box
  const EDGE = 8; // from the window's edges

  const isEmpty = (id) => id === null || id === '';
  // the chosen one (a number from a string too); of several (`multiple`) the only one
  $: selected = multiple
    ? value.length === 1
      ? options.find((o) => o.id === value[0])
      : null
    : (options.find((o) => o.id === value) ?? options.find((o) => o.id == value));
  $: specials = options.filter((o) => o.special);
  // what the button shows: the chosen one, or "all" while none of several are
  $: shownOption = multiple && !value.length ? specials.find((o) => isEmpty(o.id)) : selected;
  $: count = multiple && value.length > 1 ? value.length : 0;
  $: showsLabel = !!emptyLabel && (multiple ? !value.length : value == null || value === '');
  $: countWord = pluralWord(count, 'Wybrany', 'Wybrane', 'Wybranych');
  $: listed = options.filter((o) => !o.special);
  // a swatch or picture before some of the names: the others' names start where theirs do (an empty one in its place)
  $: lead = listed.some((o) => o.swatch || o.icon) ? 'swatch' : listed.some((o) => o.image) ? 'image' : null;

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
  let searchField;
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
    active = shown.indexOf(shownOption);
    await tick();
    // as wide as its options: moved left when that runs past the window's edge (a select on the right of a phone)
    const over = place.left + box.offsetWidth - (innerWidth - EDGE);
    if (over > 0) place = { ...place, left: Math.max(EDGE, place.left - over) };
    (searchField ?? list)?.focus();
    reveal();
  }

  // marked as chosen (see .selected) (`sel` and `val` passed in, so the class directive updates when only `value` does)
  const marked = (o, sel, val) => (multiple ? val.includes(o.id) : o === sel || o.chosen);
  // a special's button, lit when it's the one chosen (of several: "all" while none are)
  const specialOn = (o, sel, val) => (multiple ? (isEmpty(o.id) ? !val.length : val.includes(o.id)) : o === sel);

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
    if (multiple) {
      // a special is on its own ("Wszyscy" empties the list, "Brak" is all there is - or, picked again, nothing), and
      // closes the box; an option joins the others, leaving the specials
      if (option.special) {
        value = isEmpty(option.id) || (value.length === 1 && value[0] === option.id) ? [] : [option.id];
        dispatch('change', { value });
        close();
        return;
      }
      const specialIds = specials.map((o) => o.id);
      const rest = value.filter((id) => !specialIds.includes(id));
      value = rest.includes(option.id) ? rest.filter((id) => id !== option.id) : [...rest, option.id];
      dispatch('change', { value });
      return;
    }
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
  // on one of the specials (side by side), left and right go between them; elsewhere they're the search field's
  function sideways(e) {
    if (active < 0 || active >= specials.length) return false;
    const n = specials.length;
    const step = e.key === 'ArrowRight' ? 1 : -1;
    for (let i = 1; i < n; i++) {
      const next = (((active + step * i) % n) + n) % n;
      if (!specials[next].disabled) {
        active = next;
        break;
      }
    }
    return true;
  }
  function keydownBox(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') move(e.key === 'ArrowDown' ? 1 : -1);
    else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && sideways(e)) {
      // (handled)
    } else if (e.key === 'Home' || e.key === 'End') {
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
    active = q ? shown.findIndex((o) => !o.disabled && !o.special) : shown.indexOf(shownOption);
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
  class:iconic={icon}
  class:pictured={!icon && shownOption?.image && !showsLabel}
  class:error
  class:borderless
  class:placeholder={!shownOption && placeholder}
  role="combobox"
  aria-label={label ?? title}
  {title}
  aria-haspopup="listbox"
  aria-expanded={!!place}
  aria-controls="{id}-list"
  {disabled}
  style:border-radius={borderRadius}
  style:background-color={color}
  bind:this={button}
  on:click={() => (place ? close() : show())}
  on:keydown={keydownButton}>
  {#if !icon && shownOption?.image && !showsLabel}<img class="image picture" src={shownOption.image} alt="" />{/if}
  {#if icon}
    <Icon fill name={icon} color="currentColor" strokeWidth={0.3} />
  {:else if count}
    <span class="text"><span class="count">{count}</span>{countWord}</span>
  {:else if showsLabel}
    <span class="text ui-stat-label empty-label">{emptyLabel}</span>
  {:else}
    <span class="text">
      {#if shownOption?.swatch}<span
          class="swatch"
          style:background={shownOption.swatch === true ? NO_COLOR : shownOption.swatch} />{/if}
      {#if shownOption?.code}<CategoryCode code={shownOption.code} />{/if}
      {shownOption?.text ?? placeholder ?? ''}
      {#if shownOption?.after}<span class="after">{shownOption.after}</span>{/if}
    </span>
  {/if}
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
    {#if search}
      <input
        class="search"
        type="text"
        placeholder="Szukaj..."
        aria-label="Szukaj"
        aria-controls="{id}-list"
        aria-activedescendant={active >= 0 ? `${id}-${active}` : null}
        bind:this={searchField}
        bind:value={query} />
    {/if}
    {#if specials.length}
      <div class="specials">
        {#each specials as option, i (option.id)}
          <span class="special" id="{id}-{i}" class:active={i === active}>
            <Button
              size="sm"
              width="100%"
              dashed={!specialOn(option, selected, value)}
              selected={specialOn(option, selected, value)}
              disabled={option.disabled}
              on:click={() => pick(option)}>
              {option.text}
            </Button>
          </span>
        {/each}
      </div>
    {/if}
    <div class="scroll" class:fade-top={fadeTop} class:fade-bottom={fadeBottom}>
      <div
        class="list"
        id="{id}-list"
        role="listbox"
        tabindex="-1"
        aria-label={label ?? title}
        aria-multiselectable={multiple || null}
        aria-activedescendant={!search && active >= 0 ? `${id}-${active}` : null}
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
            class:selected={marked(option, selected, value)}
            class:disabled={option.disabled}
            class:colored={option.color}
            role="option"
            aria-selected={multiple ? value.includes(option.id) : option === selected}
            aria-disabled={option.disabled}
            on:pointermove={() => !option.disabled && (active = i)}
            on:click={() => pick(option)}>
            {#each { length: option.depth ?? 0 } as _}<span class="guide" />{/each}
            <span class="label" style:background-color={option.color}>
              {#if option.swatch}<span
                  class="swatch"
                  style:background={option.swatch === true ? NO_COLOR : option.swatch} />{/if}
              {#if option.image}<img class="image" src={option.image} alt="" />{/if}
              {#if option.icon}<span class="swatch glyph"><Icon fill name={option.icon} dark /></span>{/if}
              {#if lead && !option.swatch && !option.image && !option.icon}<span class="{lead} blank" />{/if}
              {#if option.code}<CategoryCode code={option.code} />{/if}
              <span class="name" class:coded={option.code}>
                {option.text}
                {#if option.note}<small class="note"
                    >{#if option.noteImage}<img
                        class="note__image"
                        src={option.noteImage}
                        alt="" />{/if}{option.note}</small
                  >{/if}
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
  /* just an icon, as a table head's SortButton: navy while open */
  .select.iconic {
    flex: none;
    display: grid;
    place-items: center;
    width: 1.2rem;
    height: 1.2rem;
    padding: 0.15rem;
    border: none;
    border-radius: 0.4rem;
    color: var(--grey-500);
    background-color: transparent;
  }
  .select.iconic::after {
    content: none;
  }
  .select.iconic :global(svg),
  .select.iconic :global(use) {
    color: inherit; /* the admin gives every element its own text colour */
  }
  .select.iconic:not([disabled]):hover {
    color: var(--navy-700);
    background-color: var(--black-6);
  }
  .select.iconic[aria-expanded='true'] {
    color: var(--light);
    background-color: var(--navy-700);
  }
  .select.iconic:focus-visible {
    outline: solid 2px var(--navy-700);
  }
  .text {
    min-width: 0; /* cut with "…" when the button is narrower than the option */
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  /* as the list's note (cut with the name, see .text) */
  .after {
    margin-left: 0.2em;
    font-size: 0.8em;
    color: var(--ink-muted);
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
  .image {
    flex: none;
    width: 1em;
    height: 1em;
    object-fit: contain;
  }
  /* the chosen one's picture in the button's padding, as far from the text as in the list (the label's gap) */
  .select.pictured {
    padding-left: calc(0.5rem + 1.35em);
  }
  .select.small.pictured {
    padding-left: calc(0.35rem + 1.35em);
  }
  .picture {
    position: absolute;
    top: 50%;
    left: 0.5rem;
    transform: translateY(-50%);
  }
  .select.small .picture {
    left: 0.35rem;
  }
  .label .swatch,
  .label .image {
    align-self: center;
  }
  .label .image {
    margin-right: 0;
  }
  /* a swatch a little further from the name than a picture: it's bigger to the eye */
  .label .swatch {
    margin-right: 0.25em;
  }
  .label .blank {
    visibility: hidden;
  }
  /* an icon in a swatch's place, without its ring: bigger than a swatch (its lines are thin), over the edges of the
     swatch's room so the name starts where the others' do */
  .label .glyph {
    display: grid;
    width: 1.5em;
    height: 1.5em;
    margin: -0.25em 0 -0.25em -0.25em;
    box-shadow: none;
  }

  /* a filter's name while none are chosen: a field's label, a little bigger (it's in the field) */
  .empty-label {
    font-size: calc(0.65rem + 2px);
  }
  /* how many are chosen: a grey circle, its number blue, before the word */
  .count {
    display: inline-grid;
    place-items: center;
    vertical-align: middle;
    min-width: 1.35em;
    height: 1.35em;
    margin: -0.2em 0.35em 0 0;
    padding: 0 0.3em;
    border-radius: 100rem;
    font-size: 0.85em;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: var(--blue-700);
    background-color: var(--grey-100);
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
    padding: 0.35rem 0.35rem 0.15rem; /* (room for the active one's ring under them) */
    position: relative;
    z-index: 2; /* over the list that follows them: the active one's ring reaches into it */
  }
  /* under the search field, its margin between them */
  .search + .specials {
    padding-top: 0;
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
  /* as big as the note's letters, on its line */
  .note__image {
    display: inline-block;
    vertical-align: -0.12em;
    width: 1em;
    height: 1em;
    margin-right: 0.3em;
    object-fit: contain;
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
  /* the one chosen: bold, on a selected button's ground (a coloured one keeps its colour, outlined instead) */
  .option.selected {
    font-weight: 600;
  }
  .option.selected .label {
    background-color: var(--navy-100);
  }
  .option.selected.active .label {
    background-color: var(--navy-200);
  }
  .option.selected.colored .label {
    box-shadow: inset 0 0 0 1.5px var(--navy-700);
  }
  /* and a check at its end, as big as the button's arrow: it says so under the pointer too, where the ground changes */
  .option.selected .label::after {
    content: '';
    flex: none;
    align-self: center;
    margin-left: auto;
    width: 0.65rem;
    aspect-ratio: 10 / 8;
    background-color: var(--black-50);
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 8'%3E%3Cpath d='M1 4l3 3 5-6' fill='none' stroke='%23000' stroke-width='1.4'/%3E%3C/svg%3E")
      center / contain no-repeat;
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
  /* chosen and can't be let go (e.g. a table's last column) */
  .option.selected.disabled .label {
    background-color: var(--navy-100);
  }
  .option.disabled :global(.code) {
    opacity: 0.5;
  }
  .empty {
    padding: 0.3rem 0.85rem;
    color: var(--grey-500);
  }
</style>
