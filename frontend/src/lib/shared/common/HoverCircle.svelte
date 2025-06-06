<script>
  import { onMount } from 'svelte';

  export let show = false;
  export let color = 'var(--primary-light)';

  let visible = false;

  let elem;
  let parent;

  let size;
  let sizeVisible = 0;
  let x = 50;
  let y = 50;

  function getMouse(e) {
    return { x: e.clientX, y: e.clientY };
  }
  function getRect() {
    const parentRect = parent.getBoundingClientRect();
    return {
      x: parentRect.left,
      y: parentRect.top,
      w: parentRect.width,
      h: parentRect.height
    };
  }

  function update(mouse, rect) {
    const { w, h } = rect;
    sizeVisible = w > h ? w : h;
    sizeVisible *= 3; // needs to be 3 times bigger then the parent
    x = ((mouse.x - rect.x) / rect.w) * 100;
    if (x < 0) x = 0;
    else if (x > 100) x = 100;
    y = ((mouse.y - rect.y) / rect.h) * 100;
    if (y < 0) y = 0;
    else if (y > 100) y = 100;
  }

  onMount(() => {
    // this might seem 'unsvelty' but it allows this component to be put as a child of any element and it will just work
    parent = elem.parentNode;
    update({ x: 0, y: 0 }, getRect());
    parent.addEventListener('mouseenter', e => {
      update(getMouse(e), getRect());
      visible = true;
    });
    parent.addEventListener('mouseleave', e => {
      update(getMouse(e), getRect());
      visible = false;
    });
  });

  $: size = show || visible ? sizeVisible : 0;
</script>

<div
  class="circle"
  bind:this={elem}
  style:background-color={color}
  style:width={size + 'px'}
  style:height={size + 'px'}
  style:left={x + '%'}
  style:top={y + '%'}
/>

<style>
  .circle {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    transform: translate(-50%, -50%);
    border-radius: 50%; /* TODO: probably should be calculated differently */
    background-color: var(--primary-3);
    transition:
      width 300ms,
      height 300ms;
  }
</style>
