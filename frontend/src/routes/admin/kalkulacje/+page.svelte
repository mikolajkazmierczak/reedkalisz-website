<script>
  import { fly } from 'svelte/transition';
  import { header } from '@/stores';

  import { globals, companies, labelings, priceViews, globalMargins } from '@/globals';
  import Button from '@c/Button.svelte';
  import PriceViews from './PriceViews.svelte';
  import GlobalMargins from './GlobalMargins.svelte';
  import Labelings from './Labelings.svelte';

  $header = { title: 'Kalkulacje', icon: 'calculator' };

  async function read() {
    await globals.update(globalMargins);
    await globals.update(priceViews);
    await globals.update(companies);
    await globals.update(labelings);
  }

  $: $companies?.sort((a, b) => a.name.localeCompare(b.name));

  read();

  let info = false;
  function toggleInfo() {
    info = !info;
  }
</script>

<div class="wrapper">
  {#if $globalMargins && $priceViews}
    <sidebar>
      <Button icon="info" on:click={toggleInfo}>Jak wyliczane są ceny?</Button>
      <div class="ui-box ui-box--uneditable notice">
        <h3>Zmiany na żywo</h3>
        <p>
          <i>Najlepiej nie edytować tego panelu jednocześnie.</i>
          Zapisywane zmiany są wprowadzane także u pozostałych użytkowników co może powodować nadpisywanie swoich zmian.
        </p>
      </div>
      <div class="ui-box">
        <h3 class="ui-h3 title">Odgórne marże</h3>
        <GlobalMargins data={$globalMargins} />
      </div>
      <div class="ui-box">
        <h3 class="ui-h3 title">Widoki</h3>
        <PriceViews items={$priceViews} />
      </div>
    </sidebar>
  {/if}

  <div class="labelings">
    {#if $companies && $labelings}
      {#each $companies as company}
        {@const items = $labelings.filter(l => l.company === company.id)}
        <div class="company">
          <h1>{company.name}</h1>
          <Labelings {company} {items} />
        </div>
      {/each}
    {/if}
  </div>
</div>

{#if info}
  <div class="info" on:click={toggleInfo} transition:fly={{ y: -30, duration: 200 }}>
    <img src="/imgs/price_formula.svg" alt="price formula" />
  </div>
{/if}

<slot />

<style>
  .wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1.5rem;
  }

  sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 40ch;
  }

  .labelings {
    overflow-x: auto;
    width: 100%;
  }
  .company {
    margin-bottom: 2rem;
  }
  .company h1 {
    margin-bottom: 0.5rem;
  }

  @keyframes outline-flash {
    0% {
      background-color: var(--accent-white);
    }
    50% {
      background-color: var(--main-1);
    }
    100% {
      background-color: var(--accent-white);
    }
  }
  .notice {
    gap: 0.25rem;
    animation-name: outline-flash;
    animation-duration: 2s;
  }

  .info {
    z-index: 1000;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: zoom-out;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5px);
  }
  .info img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: block;
    max-width: 100%;
    max-height: 100%;
    width: 80%;
    height: 80%;
  }
</style>
