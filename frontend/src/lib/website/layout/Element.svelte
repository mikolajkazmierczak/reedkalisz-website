<script>
  import Icon from '$c/Icon.svelte';

  import { editing, selected, actions } from '#/layout/store';

  export let element;

  export let types; // [{ type, label, icon }]
  export let fixed = false; // built into the page: always there, no settings (see FIXED)
  export let bleed = false; // full width

  $: ({ type } = element);
  $: ({ label, icon } = types.find((t) => t.type === type));
  $: chosen = $selected?.element === element._id && !$selected?.tile;
  $: acts = chosen && !fixed && $actions;

  // in the editor a block is picked by a click anywhere on it, and nothing in it is followed (its products' links)
  function pick() {
    $selected = { element: element._id };
  }
</script>

{#if $editing}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div
    class="frame"
    class:chosen
    class:hidden={element.hide}
    data-element={element._id}
    data-type={type}
    data-fixed={fixed || null}
    data-bleed={bleed || null}
    on:click|capture={(e) => e.target.closest('a[href]') && e.preventDefault()}
    on:click={pick}>
    <!-- its name, and picked (not a built-in one) its own buttons beside it: floating at the top as it scrolls by -->
    <div class="bar">
      <button class="tag" class:joined={acts} type="button">
        <Icon name={icon} width="0.95rem" color="currentColor" />
        {label}{#if element.hide}<span class="tag__note">ukryty</span>{/if}
      </button>
      {#if acts}
        <span class="acts">
          <button
            type="button"
            title="Wyżej"
            disabled={$actions.first}
            on:click|stopPropagation={() => $actions.move(-1)}
            ><Icon name="arrow_up" width="0.95rem" color="currentColor" /></button>
          <button type="button" title="Niżej" disabled={$actions.last} on:click|stopPropagation={() => $actions.move(1)}
            ><Icon name="arrow_down" width="0.95rem" color="currentColor" /></button>
          <button
            type="button"
            title={element.hide ? 'Ukryty: pokaż go na stronie' : 'Ukryj na stronie (zostaje w edycji)'}
            on:click|stopPropagation={() => (element.hide = !element.hide)}
            ><Icon name={element.hide ? 'eye_off' : 'eye'} width="0.95rem" color="currentColor" /></button>
          <button
            type="button"
            class="acts__remove"
            title="Usuń blok"
            on:click|stopPropagation={() => $actions.remove()}
            ><Icon name="delete" width="0.95rem" color="currentColor" /></button>
        </span>
      {/if}
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
{:else if !element.hide}
  <div class="el" data-type={type} data-fixed={fixed || null} data-bleed={bleed || null}>
    <slot />
  </div>
{/if}

<style>
  /* The data attributes let the page set widths, rules and spacing between blocks (in the editor too: it shows the
     page as it is). */
  .el {
    width: 100%;
  }

  /* In the editor every block in a faint frame of the admin's navy, its name on a tab at its top left; pointed at,
     the frame darkens; picked, it's solid and thick. The frame on a layer of its own over what's in the block (a
     banner, a picture), clicks going through it. A hidden block faded and grey. */
  .frame {
    isolation: isolate; /* (what's in it stacks under the frame, whatever its z-index) */
    position: relative;
    width: 100%;
    cursor: pointer;
  }
  .frame::after {
    content: '';
    z-index: 4;
    position: absolute;
    inset: 0;
    border: 2px dashed rgb(27 47 78 / 0.3);
    pointer-events: none;
    transition: border-color var(--dur-fast) var(--ease-hover);
  }
  .frame:hover::after {
    border-color: rgb(27 47 78 / 0.65);
  }
  .frame.chosen::after {
    border: 3px solid var(--navy);
  }
  .frame.hidden .content {
    opacity: 0.45;
    filter: grayscale(1);
  }
  /* (in the flow but taking no room, so it can stick to the window's top while the block goes by) */
  .bar {
    z-index: 5;
    position: sticky;
    top: 0;
    display: flex;
    align-items: flex-start;
    height: 0;
  }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.55rem 0.25rem 0.45rem;
    border: none;
    border-bottom-right-radius: 0.5rem;
    background-color: rgb(27 47 78 / 0.75);
    color: #fff;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
  }
  .frame.chosen .tag,
  .frame:hover .tag {
    background-color: var(--navy);
  }
  .tag__note {
    margin-left: 0.2rem;
    font-weight: 500;
    opacity: 0.75;
  }
  .tag__note::before {
    content: '· ';
  }
  .tag.joined {
    border-bottom-right-radius: 0;
  }
  /* its buttons: the tag's navy, joined to it */
  .acts {
    display: flex;
    border-bottom-right-radius: 0.5rem;
    overflow: hidden;
    background-color: var(--navy);
  }
  .acts button {
    cursor: pointer;
    display: grid;
    place-items: center;
    width: 1.75rem;
    height: 1.55rem;
    padding: 0;
    border: none;
    border-left: 1px solid rgb(255 255 255 / 0.2);
    background: none;
    color: #fff;
    transition: background-color var(--dur-fast) var(--ease-hover);
  }
  .acts button:hover:not(:disabled) {
    background-color: rgb(255 255 255 / 0.16);
  }
  .acts button:disabled {
    cursor: default;
    opacity: 0.35;
  }
  .acts .acts__remove:hover {
    background-color: var(--red);
  }
</style>
