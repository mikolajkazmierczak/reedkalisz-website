<script>
  import { goto } from '$app/navigation';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  import { edited, save, cancel } from '$lib/admin/stores';
  import Icon from '$lib/common/Icon.svelte';
  import HoverCircle from '$lib/components/HoverCircle.svelte';

  function spin(node, { duration }) {
    return {
      duration,
      css: t => {
        const eased = cubicOut(t);
        return `transform: rotate(${eased * 360}deg);`;
      }
    };
  }

  export let back;
  export let icon;
  export let title;

  let saving = false;

  function handleExit() {
    // nagivate back
    if (back) goto(back, { noscroll: true });
  }

  async function handleCancel() {
    if (confirm('Na pewno chcesz cofnąć zmiany?')) {
      $cancel();
      $edited = false;
    }
  }

  async function handleSave() {
    saving = true;
    await $save();
    saving = false;
    $edited = false;
  }
</script>

<div class="wrapper" on:click|self={handleExit} in:fade={{ duration: 200 }} out:fade={{ duration: 100 }}>
  <div class="box" in:fly={{ x: 100, duration: 400 }} out:fly={{ x: 50, duration: 100 }}>
    <div class="bar">
      <div class="actions">
        {#if $edited}
          <div class="button back" role="button" on:click={handleCancel}>
            <HoverCircle color={'var(--main-3)'} />
            <div class="icon" in:spin>
              <Icon name="close" dark />
            </div>
          </div>
        {:else}
          <a class="button back" href={back}>
            <HoverCircle color={'var(--accent-light)'} />
            <div class="icon" in:spin>
              <Icon name="arrow_left" dark />
            </div>
          </a>
        {/if}

        <div class="save-wrapper" class:visible={$edited}>
          {#if $edited}
            <div class="button save" role="button" on:click={handleSave}>
              <HoverCircle color={'var(--success)'} />
              {#if !saving}
                <div class="icon"><Icon name="ok" dark /></div>
              {/if}
              <span>
                {#if saving}Zapisuję...{:else}Zapisz{/if}
              </span>
            </div>
          {/if}
        </div>
      </div>

      <div class="title">
        <div class="icon">
          <Icon name={icon} />
        </div>
        <h2>{title ?? 'Wczytywanie...'}</h2>
      </div>
    </div>
    <div class="content">
      <slot />
    </div>
  </div>
</div>

<style>
  .button {
    cursor: pointer;
    overflow: hidden;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    border: solid 2px var(--accent-text);
    padding: 0 1rem;
    height: 100%;
  }
  .button .icon,
  .button span {
    z-index: 1;
    position: relative;
  }
  .button .icon {
    height: 65%;
  }

  .wrapper {
    z-index: 100;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
  }

  .box {
    position: absolute;
    top: 0;
    right: 0;
    overflow: auto;
    width: 80vw;
    height: 100%;
    background-color: var(--accent-white);
    background-image: url('/imgs/dot_grid.png');
    background-size: 160px;
  }

  .bar {
    z-index: 1;
    position: sticky;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0 2rem;
    height: 4rem;
    background-color: var(--accent);
  }

  .actions {
    overflow: hidden;
    display: flex;
    align-items: center;
    height: 2rem;
  }
  .back {
    padding: 0;
    aspect-ratio: 1.2 / 1;
  }
  .save-wrapper {
    width: 0;
    height: 100%;
    transition: width 200ms;
  }
  .save-wrapper.visible {
    width: 7.75rem;
  }
  .save {
    margin-left: 1rem;
  }

  .title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    height: 100%;
  }
  .title .icon {
    background-color: var(--primary-white);
    border-radius: 50%;
    padding: 0.4rem;
    height: 60%;
    aspect-ratio: 1 / 1;
  }
  .title h2 {
    white-space: nowrap;
    font-weight: 900;
  }

  .content {
    z-index: 0;
    padding: 2rem;
  }
</style>
