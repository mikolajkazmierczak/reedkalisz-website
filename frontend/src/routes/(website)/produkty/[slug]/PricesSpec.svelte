<script>
  // The labeling's field and place as the price table's last rows, labelled in its first column like "Ilość" and
  // "PLN / szt.". Several places (joined with " / " on import) are alternatives: one to a line.
  export let field = null;
  export let place = null;
  /** How many columns the value spans. */
  export let span = 1;

  $: places = (place ?? '').split(' / ').filter((p) => p.trim());
</script>

{#if field}
  <tr>
    <th scope="row">
      <span class="spec__label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Pole
      </span>
    </th>
    <td class="tnum" colspan={span}>{field}</td>
  </tr>
{/if}
{#if places.length}
  <tr>
    <th scope="row">
      <span class="spec__label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" stroke-linejoin="round" />
          <circle cx="12" cy="10" r="2.4" />
        </svg>
        Miejsce
      </span>
    </th>
    <td colspan={span}>
      {#if places.length > 1}
        <ul class="places">
          {#each places as p}<li>{p}</li>{/each}
        </ul>
      {:else}
        {places[0]}
      {/if}
    </td>
  </tr>
{/if}

<style>
  /* the table's cells (see PricesTable), white like the prices, a little tighter; a long place wraps in its cell */
  th,
  td {
    padding: var(--sp-1) var(--sp-3);
    border: 1px solid var(--border);
    background-color: var(--surface);
    font-size: var(--fs-xs);
    line-height: 1.4;
    vertical-align: top;
  }
  th {
    position: sticky;
    left: 0;
    z-index: 1;
    width: 1%;
    color: var(--text-subtle);
    font-weight: 600;
    text-align: left;
    white-space: nowrap;
  }
  td {
    color: var(--text);
    font-weight: 600;
    text-align: left;
    white-space: normal;
  }
  /* the icon on the label's line, whatever the cell's height */
  .spec__label {
    display: flex;
    align-items: center;
    gap: var(--sp-2);
    height: 1lh;
  }
  /* 13px: the field's corners as tall as a capital, centred on the capitals rather than the line box */
  .spec__label svg {
    flex: none;
    width: 0.8125rem;
    height: 0.8125rem;
    translate: 0 -0.03em;
  }
  .places {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  /* the dot on the middle of the lowercase (vertical-align: middle), a wrapped line hanging under the text */
  .places li {
    padding-left: 0.8125rem;
    text-indent: -0.8125rem;
  }
  .places li::before {
    content: '';
    display: inline-block;
    width: 0.3125rem;
    height: 0.3125rem;
    margin-right: var(--sp-2);
    border-radius: 50%;
    background-color: var(--ink-300);
    vertical-align: middle;
  }
</style>
