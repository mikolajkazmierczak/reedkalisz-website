<script>
  import Icon from '$c/Icon.svelte';

  export let show = true;

  export let padding = '0';
</script>

{#if show}
  <div class="wrapper" style:padding>
    <div class="overlay">
      <div class="icon">
        <Icon width="50%" name="eye_off" color="var(--main)" />
      </div>
    </div>
  </div>
{/if}

<style>
  div {
    height: 100%;
    width: 100%;
  }
  .wrapper {
    z-index: 1;
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
  }
  .overlay {
    outline: 1px solid var(--main);
    background-color: rgba(255, 255, 255, 0.5);
  }
  .icon {
    opacity: 0.3;
    display: grid;
    place-items: center;
  }
</style>
