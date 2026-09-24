<script>
  import Badge from './Badge.svelte';

  export let isNew = false;
  export let bestseller = false;
  export let sale = false;
  export let coming_soon = false;
  export let out_of_stock = false;
  /** Inline badges sit in the flow; otherwise they pin to the media corner. */
  export let inline = false;

  $: any = isNew || bestseller || sale || coming_soon || out_of_stock;
</script>

{#if any}
  <div class="badges" class:inline>
    {#if out_of_stock}<Badge tone="out" label="Brak" />{/if}
    {#if sale}<Badge tone="sale" label="Promocja" />{/if}
    {#if isNew}<Badge tone="new" label="Nowość" />{/if}
    {#if bestseller}<Badge tone="bestseller" label="Bestseller" />{/if}
    {#if coming_soon}<Badge tone="soon" label="Wkrótce" />{/if}
  </div>
{/if}

<style>
  .badges {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-1);
  }
  .badges:not(.inline) {
    position: absolute;
    top: var(--sp-2);
    left: var(--sp-2);
    right: var(--sp-2);
    z-index: 1;
    pointer-events: none;
  }
</style>
