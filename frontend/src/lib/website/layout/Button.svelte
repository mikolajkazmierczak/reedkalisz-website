<script>
  import Icon from '$c/Icon.svelte';

  export let icon;
  export let bold = false;
  export let width = '1.25rem';
  export let height = '1.25rem';

  export let disabled = false;

  export let float = '';
  export let offset = 0;

  $: floats = parseFloat(float);

  function parseFloat(value) {
    // "top right", "bottom left", ...
    // "top right" -> { top: true, right: true, bottom: false, left: false, center: false }
    let [first, second] = value ? value.split(' ') : [null, null];
    const values = ['top', 'right', 'bottom', 'left', 'center'];
    return values.reduce((acc, value) => {
      return { ...acc, [value]: first === value || second === value };
    }, {});
  }

  export let onclick = () => {};
  export let onmousedown = () => {};
</script>

<button
  {disabled}
  style:width
  style:height
  class:float
  style:top={floats.top ? `${offset}px` : ''}
  style:right={floats.right ? `${offset}px` : ''}
  style:bottom={floats.bottom ? `${offset}px` : ''}
  style:left={floats.left ? `${offset}px` : ''}
  style:center={floats.left ? `${offset}px` : ''}
  on:click={onclick}
  on:mousedown={onmousedown}
>
  <Icon width="80%" name={icon} color={bold ? 'var(--main)' : 'var(--main-4)'} strokeWidth={bold ? 0.5 : 0.3} />
</button>

<style>
  button {
    cursor: pointer;
    display: grid;
    place-items: center;
    margin: 0;
    border: none;
    padding: 0;
    width: 1.25rem;
    height: 1.25rem;
    background-color: var(--main-1);
  }
  button:hover {
    background-color: var(--main-0);
  }
  button[disabled] {
    cursor: not-allowed;
    filter: grayscale(1);
  }
  .float {
    z-index: 10;
    position: absolute;
  }
</style>
