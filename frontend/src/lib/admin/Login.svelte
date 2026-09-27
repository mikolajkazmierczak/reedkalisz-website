<script>
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import Loader from '$c/Loader.svelte';
  import { auth, me, login } from '$/auth';
  import { fade, fly } from 'svelte/transition';
  import Icon from '$c/Icon.svelte';

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

{#if !$auth}
  {#if $me}
    <div class="bg" transition:fade={{ duration: 300 }} />
  {/if}

  <div class="login" transition:fly={{ y: 20, duration: 600 }}>
    <div class="circle">
      <Icon height="60%" name="lock" dark />
    </div>
    <form>
      <h1>Zaloguj się</h1>
      <Input placeholder="E-mail" bind:value={email} />
      <Input placeholder="Hasło" bind:value={password} type="password" />
      <div class="gap" />
      <Button action on:click={handleLogin}>
        {#if awaitingLogin}<Loader />{:else}Zaloguj{/if}
      </Button>
      <div class="gap" />
    </form>
    {#if error}{error}{/if}
  </div>
{/if}

<style>
  .bg {
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: var(--black-50);
  }

  .login {
    z-index: 1001;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: var(--box-radius);
    corner-shape: squircle;
    padding: 1rem 2rem;
    width: 30ch;
    border: var(--border);
    background-color: var(--light);
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
    background-color: var(--light);
  }

  form {
    display: grid;
    row-gap: 0.5rem;
  }
  h1 {
    margin-top: 1rem;
    font-size: 1.5rem;
    text-align: center;
  }
</style>
