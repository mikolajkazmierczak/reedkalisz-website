<script>
  import { page } from '$app/stores';
  import { header } from '@/stores';
  import Info from './Info.svelte';
  import { calculationsTabs } from './tabs.js';

  let formula = false;

  $: $header = {
    title: 'Kalkulacje',
    icon: 'calculator',
    tabs: calculationsTabs($page.url.pathname),
    buttons: [{ label: 'Jak wyliczane są ceny?', onClick: () => (formula = true) }],
  };
</script>

<Info bind:open={formula} />

<slot />
