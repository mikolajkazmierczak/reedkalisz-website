<script>
  import Input from '$lib/components/Input.svelte';
  import Button from '$lib/components/Button.svelte';
  import Loader from '$lib/components/Loader.svelte';
  import { auth, me, login } from '$lib/auth';
  import { fade, fly } from 'svelte/transition';

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
      <img src="/icon/lock.svg" alt="security icon" />
    </div>
    <form>
      <h1>Logowanie</h1>
      <Input placeholder="E-mail" bind:value={email} />
      <Input placeholder="Password" bind:value={password} type="password" />
      <br />
      <Button submit={true} onclick={handleLogin}>
        {#if awaitingLogin}<Loader />{:else}Zaloguj{/if}
      </Button>
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
    background-color: rgba(0, 0, 0, 0.8);
  }

  .login {
    z-index: 1001;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 1rem 2rem;
    width: 30ch;
    border: solid 2px var(--grey-light);
    background-color: var(--light);
  }

  .circle {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: var(--shadow);
    border: solid 2px var(--grey-light);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    background-color: var(--light);
  }
  .circle img {
    width: 60%;
  }

  form {
    display: flex;
    flex-flow: column;
    justify-content: center;
  }
  h1 {
    margin-top: 1rem;
    font-size: 1.5rem;
    text-align: center;
  }
</style>
