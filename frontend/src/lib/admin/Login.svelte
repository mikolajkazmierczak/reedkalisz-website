<script>
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Loader from '$c/Loader.svelte';
  import { auth, me, login } from '$/auth';
  import { fade, fly } from 'svelte/transition';
  import Icon from '$c/Icon.svelte';
  import Mat from '@c/Mat.svelte';
  import { onGrid } from '@/onGrid';

  let email;
  let password;

  let error;

  let awaitingLogin = false;
  async function handleLogin() {
    awaitingLogin = true;
    try {
      await login(email, password);
    } catch (err) {
      error = err;
    }
    awaitingLogin = false;
  }
</script>

<!-- signed out: the form lies on a cutting mat of its own; the session ended over a page: over it, dimmed -->
{#if !$auth}
  <div class="board" class:over={$me} use:onGrid transition:fade={{ duration: 300 }}>
    {#if !$me}<Mat />{/if}
    <div class="login ui-box" transition:fly={{ y: 20, duration: 600 }}>
      <div class="circle">
        <Icon height="60%" name="lock" dark />
      </div>
      <form>
        <h1>Zaloguj się</h1>
        <Input placeholder="E-mail" bind:value={email} />
        <Input placeholder="Hasło" bind:value={password} type="password" />
        <Button on:click={handleLogin}>
          {#if awaitingLogin}<Loader />{:else}Zaloguj{/if}
        </Button>
      </form>
      {#if error}{error}{/if}
    </div>
  </div>
{/if}

<style>
  /* the window, its mat whole half cells both ways (what's left over past its right and bottom frame, as a page's) */
  .board {
    z-index: 1000;
    position: fixed;
    inset: 0;
    --mat-inset: 0 var(--sheet-leftover) var(--sheet-leftover) 0; /* (100% its width, then its height) */
    background-color: var(--board);
  }
  .board.over {
    background-color: var(--black-50);
  }
  /* a box on the mat (as a page's: 1px inside its slot, whole half cells tall, see onGrid), 22 half cells wide (or the
     mat's width), in the mat's middle across and on a line a little above its middle down, never under the lock's room
     at the top */
  .login {
    --across: round(down, 100% - 2 * var(--mat-margin) - 1px - var(--sheet-leftover), var(--half)); /* the mat's */
    --slot: min(22 * var(--half), var(--across));
    position: absolute;
    top: calc(
      var(--mat-margin) + max(2 * var(--cell), round(down, (100% - 2 * var(--mat-margin)) / 2 - 7rem, var(--cell)))
    );
    left: calc(var(--mat-margin) + round(down, (var(--across) - var(--slot)) / 2, var(--half)));
    width: calc(var(--slot) - 1px);
    padding-inline: calc(var(--cell) - 1px);
    border: var(--border); /* in the ink, as the lock's circle */
  }
  .over .login {
    box-shadow: var(--shadow-lifted); /* (over the page, lifted off it) */
  }

  .circle {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -75%);
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: var(--shadow);
    border: var(--border);
    border-radius: 50%;
    width: 3.125rem;
    height: 3.125rem;
    background-color: var(--paper);
  }

  /* half a cell apart, as a box's fields; the title under the lock */
  form {
    display: grid;
    row-gap: var(--half);
  }
  h1 {
    margin-top: var(--half);
    font-size: 1.5rem;
    line-height: var(--cell);
    text-align: center;
  }
</style>
