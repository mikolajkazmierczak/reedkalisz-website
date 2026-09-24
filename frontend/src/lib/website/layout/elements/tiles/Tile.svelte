<script>
  import { createEventDispatcher } from 'svelte';
  import { baseUrl } from '$/api';
  import Icon from '$c/Icon.svelte';

  import { editing } from '#/layout/store';
  import { parseImg, parseHref } from '#/layout/utils';
  import Input from '#/layout/Input.svelte';
  import Button from '#/layout/Button.svelte';
  import ButtonInputs from '#/layout/ButtonInputs.svelte';
  import FloatingInputs from '#/layout/FloatingInputs.svelte';
  import Contenteditable from '#/layout/Contenteditable.svelte';

  const dispatch = createEventDispatcher();

  export let matrix;

  export let element;
  export let tile;

  $: ({ _empty } = tile);
  $: ({ href, target } = parseHref(tile?.uri));

  $: if (tile.img) {
    tile.red = false;
  }
  $: if (tile.red) {
    tile.dark = false;
    tile.contrast = false;
  }

  let tileInputsOpen = false;
  let buttonInputsOpen = false;

  // One element per <br>-separated line, so each gets its own blur.
  const lines = (html) =>
    html
      .split(/<br\s*\/?>/i)
      .map((line) => line.trim())
      .filter((line) => line && line !== '&nbsp;');

  function toggleButtonInputs() {
    buttonInputsOpen = !buttonInputsOpen;
  }

  function handleDelete() {
    if (confirm('Na pewno usunąć ten kafelek?')) {
      dispatch('delete');
    }
  }

  function handleAdd() {
    dispatch('add');
  }

  function toggleProp(flag) {
    tile[flag] = !tile[flag];
    element = element;
  }

  function validateSide(side) {
    if (!['left', 'right', 'top', 'bottom'].includes(side)) {
      throw new Error('Invalid side');
    }
  }

  function canExpand(tile, side) {
    validateSide(side);

    // based on the matrix checks if there is a free space in the direction
    // also takes account of the edge of the matrix

    const { width, height } = tile;
    const row = tile.row - 1;
    const column = tile.column - 1;

    if (side === 'left') {
      if (column === 0) return false;
      for (let i = row; i < row + height; i++) {
        if (matrix[i][column - 1]) return false;
      }
    } else if (side === 'right') {
      if (column + width === 4) return false;
      for (let i = row; i < row + height; i++) {
        if (matrix[i][column + width]) return false;
      }
    } else if (side === 'top') {
      if (row === 0) return false;
      for (let j = column; j < column + width; j++) {
        if (matrix[row - 1][j]) return false;
      }
    } else if (side === 'bottom') {
      if (row + height === matrix.length) return true;
      for (let j = column; j < column + width; j++) {
        if (matrix[row + height][j]) return false;
      }
    }
    return true;
  }

  function expand(tile, side) {
    validateSide(side);

    if (side === 'left') {
      tile.column--;
      tile.width++;
    } else if (side === 'right') {
      tile.width++;
    } else if (side === 'top') {
      tile.row--;
      tile.height++;
    } else if (side === 'bottom') {
      tile.height++;
    }
    element = element;
  }

  function canShrink(tile, side) {
    validateSide(side);

    if (side === 'left' || side === 'right') {
      return tile.width > 1;
    } else if (side === 'top' || side === 'bottom') {
      return tile.height > 1;
    }
  }

  function shrink(tile, side) {
    validateSide(side);

    if (side === 'left') {
      tile.column++;
      tile.width--;
    } else if (side === 'right') {
      tile.width--;
    } else if (side === 'top') {
      tile.row++;
      tile.height--;
    } else if (side === 'bottom') {
      tile.height--;
    }
    element = element;
  }
</script>

<FloatingInputs bind:open={tileInputsOpen}>
  <Input label="Zdjęcie" bind:value={tile.img} />
  <div />
</FloatingInputs>

<FloatingInputs bind:open={buttonInputsOpen}>
  <ButtonInputs bind:button={tile.button} bind:uri={tile.uri} />
</FloatingInputs>

<div
  class="wrapper"
  class:empty={_empty}
  class:off={tile.hide && !$editing}
  class:wide={tile.width >= 3}
  class:editing={$editing}
  class:greyscale={tile.hide}
  style="grid-row: {tile.row} / span {tile.height}; grid-column: {tile.column} / span {tile.width};">
  {#if _empty && $editing}
    <div class="add">
      <Button icon="add" onclick={handleAdd} width="2rem" height="2rem" />
    </div>
  {/if}

  {#if !_empty}
    {@const { red, contrast, dark } = tile}
    {@const linked = tile.button && tile.uri}

    {#if $editing}
      <div class="actions">
        <div class="left center">
          {#if canExpand(tile, 'left')}
            <Button icon="arrow_left" onclick={() => expand(tile, 'left')} />
          {/if}
          {#if canShrink(tile, 'left')}
            <Button icon="arrow_right" onclick={() => shrink(tile, 'left')} />
          {/if}
        </div>
        <div class="right center">
          {#if canShrink(tile, 'right')}
            <Button icon="arrow_left" onclick={() => shrink(tile, 'right')} />
          {/if}
          {#if canExpand(tile, 'right')}
            <Button icon="arrow_right" onclick={() => expand(tile, 'right')} />
          {/if}
        </div>
        <div class="top center">
          {#if canExpand(tile, 'top')}
            <Button icon="arrow_up" onclick={() => expand(tile, 'top')} />
          {/if}
          {#if canShrink(tile, 'top')}
            <Button icon="arrow_down" onclick={() => shrink(tile, 'top')} />
          {/if}
        </div>
        <div class="bottom center">
          {#if canShrink(tile, 'bottom')}
            <Button icon="arrow_up" onclick={() => shrink(tile, 'bottom')} />
          {/if}
          {#if canExpand(tile, 'bottom')}
            <Button icon="arrow_down" onclick={() => expand(tile, 'bottom')} />
          {/if}
        </div>

        <div class="top left">
          <Button icon="edit" onclick={() => (tileInputsOpen = !tileInputsOpen)} />
          {#if !tile.img}
            <Button icon={red ? 'tab_in_private' : 'tab'} onclick={() => toggleProp('red')} />
          {/if}
          {#if !tile.red}
            <Button icon={contrast ? 'blur' : 'circle'} onclick={() => toggleProp('contrast')} />
            <Button icon={dark ? 'weather_moon' : 'weather_sunny'} onclick={() => toggleProp('dark')} />
          {/if}
        </div>
        <div class="top right">
          <Button icon={tile.hide ? 'eye_off' : 'eye'} onclick={() => (tile.hide = !tile.hide)} />
          <Button icon="delete" bold onclick={handleDelete} />
        </div>
      </div>
    {/if}

    {#if !tile.hide || $editing}
      <a
        href={$editing ? null : href}
        {target}
        class="tile"
        class:locked={!$editing}
        class:red
        class:white={!red && !tile.img}
        class:photo={!!tile.img}
        class:href={$editing ? false : tile.uri}>
        {#if tile.img}
          <img src={parseImg(tile.img)} alt="" draggable="false" />
        {/if}
        <div class="content" class:dark class:contrast>
          <div class="text">
            {#if $editing}
              <h2 class="title editing" class:dark class:greyscale={!tile.title}>
                <Contenteditable bind:html={tile.title} />
              </h2>
              <p class="subtitle editing" class:dark class:greyscale={!tile.subtitle}>
                <Contenteditable bind:html={tile.subtitle} />
              </p>
            {:else}
              {#if tile.title}
                <h2 class="title" class:dark>
                  {#each lines(tile.title) as line}<span class="line">{@html line}</span>{' '}{/each}
                </h2>
              {/if}
              {#if tile.subtitle}
                <p class="subtitle" class:dark>
                  {#each lines(tile.subtitle) as line}<span class="line">{@html line}</span>{' '}{/each}
                </p>
              {/if}
            {/if}
          </div>
          {#if $editing}
            {@const hide = !tile.button || !tile.uri}
            <div class="editing" class:greyscale={hide}>
              <Button icon="edit" onclick={toggleButtonInputs} float="top left" />
              <a href={hide ? null : href} {target} class="button" class:dark class:hide>
                {tile.button ?? ''}
                <Icon name="arrow_right" color="currentColor" />
              </a>
            </div>
          {:else if linked}
            <!-- not a link: the tile already is one, and nested links break the server-rendered HTML -->
            <span class="button" class:dark>
              {tile.button ?? ''}
              <Icon name="arrow_right" color="currentColor" />
            </span>
          {/if}
        </div>
      </a>
    {/if}
  {/if}
</div>

<style>
  .editing {
    position: relative;
    border: 2px dashed var(--main-2);
  }
  .title.editing,
  .subtitle.editing {
    min-width: 5ch;
  }
  .greyscale {
    filter: grayscale(1);
  }
  .button.hide {
    opacity: 0;
  }

  .wrapper {
    position: relative;
  }

  .add {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .actions > * {
    z-index: 1;
    position: absolute;
    display: flex;
  }
  .top {
    top: 0;
  }
  .right {
    right: 0;
  }
  .bottom {
    bottom: 0;
  }
  .left {
    left: 0;
  }
  .top.center,
  .bottom.center {
    flex-direction: column;
    left: 50%;
    transform: translateX(-50%);
  }
  .left.center,
  .right.center {
    top: 50%;
    transform: translateY(-50%);
  }

  .tile {
    /* Text scales to the tile (1–4 columns), not the viewport. */
    container-type: inline-size;
    overflow: hidden;
    z-index: 0;
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: var(--r-sm);
    text-decoration: none;
  }
  /* Hover frame on its own layer: the tile's box-shadow painted under the image. */
  .tile::after {
    content: '';
    z-index: 0;
    position: absolute;
    inset: 0;
    box-shadow: inset 0 0 0 0 var(--ink);
    transition: box-shadow var(--dur) var(--ease);
    pointer-events: none;
  }
  /* Not selectable outside the editor. */
  .tile.locked {
    -webkit-user-select: none;
    user-select: none;
  }
  .tile.white {
    background-color: var(--white); /* needed because of ugly rendering while loading if it's set in .tile */
  }
  .tile.href:hover::after {
    box-shadow: inset 0 0 0 2px var(--ink);
  }

  img {
    z-index: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Content in flow, so the tile grows to fit instead of clipping the button. */
  .content {
    z-index: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--sp-2);
    padding: clamp(0.75rem, 4cqw, 1.75rem);
    width: 100%;
    min-height: 100%;
  }

  .title,
  .subtitle,
  .button {
    color: var(--light);
  }

  .title {
    font-size: clamp(1.125rem, 8.5cqw, 2.5rem);
    line-height: 1.08;
    letter-spacing: -0.02em;
    text-wrap: balance;
    overflow-wrap: break-word;
    hyphens: auto;
  }
  .subtitle {
    margin-top: 0.35em;
    max-width: 30ch;
    font-size: clamp(0.8125rem, 4.4cqw, 1.5rem);
    line-height: 1.25;
    overflow-wrap: break-word;
  }
  .line {
    display: block;
  }
  /* Over a photo each line sits on its own blur (in the editor, the whole field). */
  .photo .title,
  .photo .subtitle {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.125rem;
  }
  /* negative margin: the blur reaches past the text instead of indenting it */
  .photo .line,
  .photo .editing :global([contenteditable]) {
    margin-inline: -0.375rem;
    padding: 0.0625rem 0.375rem;
    border-radius: 0.25rem;
    -webkit-backdrop-filter: blur(0.75rem);
    backdrop-filter: blur(0.75rem);
  }
  .button {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 2px solid var(--light);
    border-radius: var(--r-pill);
    corner-shape: squircle;
    padding: 0.4em 0.9em;
    background-color: transparent;
    -webkit-backdrop-filter: blur(0.5rem);
    backdrop-filter: blur(0.5rem);
    font-size: clamp(0.75rem, 3.2cqw, 1rem);
    font-weight: 600;
    white-space: nowrap;
    text-decoration: none;
    transition:
      background-color var(--dur) var(--ease),
      color var(--dur) var(--ease);
  }
  .tile:hover .button:not(.dark) {
    background-color: var(--light);
    color: var(--text);
  }
  .tile:hover .button.dark {
    background-color: var(--text);
    color: var(--light);
  }
  .button.dark {
    border-color: var(--text);
  }

  .dark {
    color: var(--text);
  }
  .contrast {
    background-color: rgba(0, 0, 0, 0.4);
  }
  .dark.contrast {
    background-color: rgba(255, 255, 255, 0.4);
  }
  .red {
    background-color: var(--main);
  }
</style>
