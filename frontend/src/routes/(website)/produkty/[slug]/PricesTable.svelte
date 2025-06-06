<script>
  export let prices;
  export let pricesSale;
</script>

<table>
  <tr>
    <th>Ilość</th>
    {#each prices as { amount }}
      <td>{amount ?? '-'}</td>
    {/each}
  </tr>

  <tr>
    <th>Cena /szt.</th>
    {#each prices as { price }, i}
      {@const sale = !!pricesSale[i]?.price}
      <td>
        {#if sale}
          <span class="sale-price">{pricesSale[i].price.toFixed(2)}<small>zł</small></span><br />
        {/if}
        <span class:sale>
          {price?.toFixed(2) ?? '-'}{#if !sale}<small>zł</small>{/if}
        </span>
      </td>
    {/each}
  </tr>
</table>

<style>
  table {
    font-size: 1.15rem;
    background-color: var(--white);
  }
  .sale {
    text-decoration: line-through;
    opacity: 0.5;
  }
  .sale-price {
    color: var(--sale-dark);
    font-weight: bold;
  }
  table {
    border-collapse: collapse;
  }
  th,
  td {
    padding: 0.35rem 0.5rem;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    vertical-align: top;
  }
  small {
    font-weight: normal;
    margin-left: 2px;
  }
</style>
