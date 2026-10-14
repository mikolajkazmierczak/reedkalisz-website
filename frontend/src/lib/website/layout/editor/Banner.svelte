<script>
  import { createEventDispatcher } from 'svelte';
  import Button from '@c/Button.svelte';
  import Input from '@c/Input.svelte';
  import Select from '@c/Select.svelte';
  import Picker from '@c/library/Picker.svelte';

  import { isUUID } from '#/layout/utils';
  import { GROUNDS, FITS, groundHex } from '#/layout/grounds';
  import LinesField from '#/layout/editor/LinesField.svelte';
  import LinkField from '#/layout/editor/LinkField.svelte';

  const dispatch = createEventDispatcher();

  export let tile; // the banner (its size and place: the arrows on its sides on the page, see Tile)

  const grounds = GROUNDS.map(({ id, name, hex }) => ({ id, text: name, swatch: hex }));

  // the picture, picked in the library: its id, as the banners keep it (an address put in before stays, until another
  // is picked)
  const asId = (img) => (isUUID(img) ? img : null);
  let picked = asId(tile.img);
  $: if (picked !== asId(tile.img)) tile.img = picked ?? '';
</script>

<div class="bar">
  <Button icon="chevron_left" ghost size="sm" on:click={() => dispatch('back')}>Kafelki</Button>
</div>

<div class="head">
  <h3 class="ui-h3">Baner</h3>
  <div class="head__acts">
    <Button
      icon={tile.hide ? 'eye_off' : 'eye'}
      secondary
      edge
      size="sm"
      title={tile.hide ? 'Ukryty: pokaż go na stronie' : 'Ukryj na stronie (zostaje w edycji)'}
      on:click={() => (tile.hide = !tile.hide)} />
    <Button icon="delete" dangerous size="sm" title="Usuń baner" on:click={() => dispatch('remove')} />
  </div>
</div>
{#if tile.hide}<p class="note">Ukryty: odwiedzający go nie widzą.</p>{/if}

<section class="ui-box">
  <div>
    <div class="ui-label">Zdjęcie</div>
    <Picker look="button" empty="Wybierz zdjęcie" bind:selected={picked} />
  </div>
  <div>
    <div class="ui-label">Na banerze</div>
    <div class="fits">
      {#each FITS as fit}
        <button
          type="button"
          class="fit"
          class:on={tile.fit === fit.id}
          disabled={!tile.img}
          aria-pressed={tile.fit === fit.id}
          on:click={() => (tile.fit = fit.id)}>
          <span
            class="fit__pic {fit.id.replace('-', ' ')}"
            class:margin={tile.margin}
            style:--ground={groundHex(tile.ground)}>
            <span class="fit__room"><span class="fit__thing" /></span>
            <span class="fit__edge" />
            <span class="fit__card" />
          </span>
          {fit.name}
        </button>
      {/each}
    </div>
    <p class="hint">{FITS.find((f) => f.id === tile.fit)?.hint ?? ''}</p>
    <div class="margined">
      <Input type="checkbox" bind:value={tile.margin} disabled={!tile.img}>Margines</Input>
      <p class="hint">Odstęp zdjęcia od brzegów baneru i karty: do zdjęć, które nie mają go same.</p>
    </div>
  </div>
  <div>
    <div class="ui-label">Tło</div>
    <Select bind:value={tile.ground} options={grounds} search={false} label="Tło" />
  </div>
</section>

<section class="ui-box">
  <LinesField bind:html={tile.title} placeholder="Np. Długopisy metalowe">Tytuł</LinesField>
  <LinesField bind:html={tile.subtitle} rows={3} placeholder="Np. klasyczny niezbędnik">Podtytuł</LinesField>
  <p class="hint">Każda linia tutaj to osobna linia na banerze.</p>
</section>

<section class="ui-box">
  <Input type="text" bind:value={tile.button} placeholder="Np. Zobacz">Przycisk</Input>
  <LinkField bind:uri={tile.uri} />
  {#if tile.button && !tile.uri}<p class="hint">Bez linku przycisku nie widać na stronie.</p>{/if}
</section>

<style>
  .bar {
    margin: calc(-1 * var(--quarter)) 0 0 calc(-1 * var(--quarter));
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--half);
  }
  .head .ui-h3 {
    margin: 0;
  }
  .head__acts {
    display: flex;
    gap: var(--quarter);
  }
  .note {
    margin: 0;
    color: var(--orange-700);
    font-size: 0.8rem;
    font-weight: 600;
  }
  .hint {
    margin: var(--quarter) 0 0;
    color: var(--ink-muted);
    font-size: 0.75rem;
    line-height: 1.35;
  }

  /* the four ways a picture takes the banner, drawn: a banner on its ground, squircled, the card at its left, and a
     disc doing what the picture will - in its room beside the card or in the whole banner (outlined dashed where it
     isn't the whole banner), centred; contained, whole, touching the room's bounds; covering, as big as covering the
     room takes and cut only by the banner's edges. With a margin the room is inset a little from the banner's edges
     and the card. Proportions as the banner's: a 2:1 one, its inset 5% of its width. */
  .fits {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--quarter);
  }
  .fit {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    padding: var(--quarter);
    border: 1px solid var(--edge);
    border-radius: var(--border-radius);
    corner-shape: squircle;
    background-color: var(--paper-field);
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.15;
    text-align: center;
    transition:
      border-color 100ms,
      background-color 100ms;
  }
  .fit:hover:not(:disabled) {
    border-color: var(--navy-500);
  }
  .fit.on {
    border-color: var(--navy-700);
    background-color: var(--navy-100);
    box-shadow: inset 0 0 0 1px var(--navy-700);
  }
  .fit:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .fit__pic {
    --i: 5cqw; /* the banner's inset */
    --m: 2cqw; /* a margin: half the card's padding */
    --card: 30cqw;
    container-type: inline-size;
    position: relative;
    overflow: hidden;
    width: 100%;
    aspect-ratio: 2;
    border-radius: 0.55rem;
    corner-shape: squircle;
    background-color: var(--ground);
    box-shadow: inset 0 0 0 1px var(--black-10);
  }
  .fit__card {
    z-index: 2;
    position: absolute;
    top: 50%;
    left: var(--i);
    width: var(--card);
    height: 25cqw;
    border: 1.5px solid var(--navy-950);
    border-radius: 0.25rem;
    corner-shape: squircle;
    background-color: #fff;
    translate: 0 -50%;
  }
  /* the room: the whole banner, or from the card's edge to the banner's; with a margin, inset from both */
  .fit__room,
  .fit__edge {
    position: absolute;
    inset: 0;
  }
  .side .fit__room,
  .side .fit__edge {
    left: calc(var(--i) + var(--card));
  }
  .margin .fit__room,
  .margin .fit__edge {
    inset: var(--m);
  }
  .side.margin .fit__room,
  .side.margin .fit__edge {
    left: calc(var(--i) + var(--card) + var(--m));
  }
  .fit__room {
    container-type: size;
  }
  .fit__edge {
    z-index: 1;
    outline: 1px dashed var(--navy-300);
    outline-offset: -1px;
    pointer-events: none;
  }
  .full:not(.margin) .fit__edge {
    display: none;
  }
  .fit__thing {
    position: absolute;
    top: 50%;
    left: 50%;
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: var(--navy-500);
    translate: -50% -50%;
  }
  .contain .fit__thing {
    width: min(100cqw, 100cqh);
    box-shadow: 0 0.15rem 0.3rem rgb(14 27 47 / 0.3);
  }
  /* a square picture covering: as wide as the room's longer side, so it runs past the shorter one */
  .cover .fit__thing {
    width: max(100cqw, 100cqh);
  }
  .margined {
    margin-top: var(--half);
  }
</style>
