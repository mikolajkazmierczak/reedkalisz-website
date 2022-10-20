<script>
  import { calculateLabeling } from '$lib/admin/calculations';
  import Input from '$lib/admin/input/Input.svelte';
  import Button from '$lib/admin/input/Button.svelte';

  import { updateGlobal, companies, labelings, priceViews, globalMargins } from '$lib/admin/global';
  import ProductPricingTable from './ProductPricingTable.svelte';

  export let product;

  async function read() {
    await updateGlobal(labelings);
    await updateGlobal(priceViews);
    await updateGlobal(globalMargins);
  }

  function checkDuplicate(id) {
    if (!id) return false;
    const owners = product.labelings.filter(l => l.labeling == id);
    return owners.length > 1;
  }

  function pushLabeling() {
    const labeling = $labelings.find(l => l.company.id == product.company && l.default) ?? $labelings[0];
    product.labelings.push({
      enabled: true,
      labeling: labeling.id,
      prices: [],
      prices_sale: [],
      global_margin: true,
      margin: null,
      minimum: null
    });
    product.labelings = product.labelings;
  }
  function removeLabeling(i) {
    product.labelings.splice(i, 1);
    product.labelings = product.labelings;
  }

  function reuseIDs(oldPrices, newPrices) {
    // use oldPrices ids to assign as many ids in newPrices as possible
    // this maximizes reusability instead of creating new objects
    oldPrices.forEach((oldPrice, i) => {
      if (newPrices?.[i]) newPrices[i].id = oldPrice.id;
    });
  }

  function updateLabelingsPrices(productLabelings) {
    if (product && $labelings && $priceViews && $globalMargins) {
      productLabelings.forEach(labeling => {
        // check if labeling is set
        if (labeling.labeling) {
          const data = calculateLabeling(
            priceView.amounts,
            $globalMargins,
            $labelings.find(l => l.id == labeling.labeling),
            product,
            labeling
          );
          data.prices.forEach(p => (p.enabled = labeling.enabled));
          data.pricesSale.forEach(p => (p.enabled = product.sale ? labeling.enabled : false));
          reuseIDs(labeling.prices, data.prices);
          reuseIDs(labeling.prices_sale, data.pricesSale);
          labeling.prices = data.prices;
          labeling.prices_sale = data.pricesSale;
        }
      });
      product.labelings = product.labelings;
    }
  }

  function disablePrices(prices) {
    prices.forEach(p => (p.enabled = false));
    prices = prices;
  }
  function enablePrices(prices) {
    prices.forEach(p => (p.enabled = true));
    prices = prices;
  }

  read();

  $: $labelings?.sort((a, b) => {
    const props = x => ({
      company: $companies.find(c => c.id == x.company)?.name ?? '-',
      code: x.code ?? '-',
      type: x.type ?? '-'
    });
    a = props(a);
    b = props(b);
    return a.company.localeCompare(b.company) || a.code.localeCompare(b.code) || a.type.localeCompare(b.type);
  });

  // set default priceView if unset or the already set no longer exists
  $: if (!product.price_view || !$priceViews?.find(p => p.id == product.price_view)) {
    product.price_view = $priceViews?.find(p => p.default)?.id;
  }

  $: priceView = $priceViews?.find(p => p.id == product.price_view);
  $: labelingsEnabled = product.labelings.some(l => l.enabled);

  $: updateLabelingsPrices(product.labelings);

  $: if (labelingsEnabled) {
    disablePrices(product.custom_prices);
    disablePrices(product.custom_prices_sale);
  } else {
    enablePrices(product.custom_prices);
    if (product.sale) {
      enablePrices(product.custom_prices_sale);
    } else {
      disablePrices(product.custom_prices_sale);
    }
  }
</script>

{#if product && $labelings && $priceViews && $globalMargins}
  <section class="ui-section">
    <h2 class="ui-h2">Cennik</h2>
    <div class="ui-section__row">
      <div class="ui-section__col">
        <div class="ui-box">
          <Input
            type="select"
            bind:value={product.price_view}
            options={$priceViews.map(({ id, name, amounts }) => ({ id, text: `${name} [${amounts}]` }))}
          >
            Widok
          </Input>
          <Input type="checkbox" bind:value={product.show_price}>Pokaż cenę</Input>
          <Input type="checkbox" bind:value={product.sale}>Promocja</Input>
        </div>

        <div class="ui-box">
          {#if labelingsEnabled}
            <Input type="number" bind:value={product.price}>Cena</Input>

            {#if product.sale}
              <div class="ui-box ui-box--optional">
                <h3 class="ui-h3">Promocja</h3>
                <div class="ui-pair">
                  <Input type="number" bind:value={product.price_sale}>Cena</Input>
                  <Input bind:value={product.price_sale_blacklist} placeholder={'np. 500;1000;'}>Wykluczenia</Input>
                </div>
              </div>
            {/if}

            <Input type="checkbox" bind:value={product.global_full_margin}>
              Odgórna marża <b>na całość</b> ({$globalMargins.full_margin}%, <small>min</small>
              {$globalMargins.full_minimum}zł)
            </Input>
            {#if !product.global_full_margin}
              <div class="ui-box ui-box--optional">
                <div class="ui-pair">
                  <Input type="number" bind:value={product.full_margin}>Marża <small>%</small></Input>
                  <Input type="number" bind:value={product.full_minimum}>Minimum <small>zł</small></Input>
                </div>
              </div>
            {/if}

            <Input type="checkbox" bind:value={product.global_product_margin}>
              Odgórna marża <b>na produkt</b> ({$globalMargins.product_margin}%, <small>min</small>
              {$globalMargins.product_minimum}zł)
            </Input>
            {#if !product.global_product_margin}
              <div class="ui-box ui-box--optional">
                <div class="ui-pair">
                  <Input type="number" bind:value={product.product_margin}>Marża <small>%</small></Input>
                  <Input type="number" bind:value={product.product_minimum}>Minimum <small>zł</small></Input>
                </div>
              </div>
            {/if}
          {:else}
            <ProductPricingTable
              bind:prices={product.custom_prices}
              bind:pricesSale={product.custom_prices_sale}
              fixedAmountsArray={priceView.amounts}
              sale={product.sale}
            />
            <Input type="checkbox" bind:value={product.custom_prices_with_labeling}>Ceny ze znakowaniem</Input>
          {/if}
        </div>
      </div>

      <div class="ui-section__col labelings">
        <div class="ui-box">
          <h3 class="ui-h3">Kalkulacje</h3>
          <div class="ui-section__row">
            {#each product.labelings as labeling, i (labeling)}
              {@const chosenLabeling = $labelings.find(l => l.id == labeling.labeling)}
              <div
                class="ui-box ui-box--element"
                class:ui-box--uneditable={!labeling.enabled}
                class:warning={checkDuplicate(labeling.labeling)}
              >
                <div class="ui-pair">
                  <Input type="checkbox" bind:value={labeling.enabled}>Włączone</Input>
                  <Button icon="delete" on:click={() => removeLabeling(i)} dangerous>Usuń</Button>
                </div>
                {#if checkDuplicate(labeling.labeling)}
                  <h4 class="ui-h4" style:color="var(--main)">DUPLIKAT</h4>
                {/if}
                <Input
                  type="select"
                  bind:value={labeling.labeling}
                  options={$labelings.map(({ id, company, code, type, name }) => {
                    company = $companies.find(c => c.id == company);
                    return { id, text: `${company.name} ${code ?? '-'} ${type ?? '-'} ${name ?? ''}` };
                  })}
                />

                {#if chosenLabeling && labeling.enabled}
                  <ProductPricingTable
                    bind:prices={labeling.prices}
                    bind:pricesSale={labeling.prices_sale}
                    fixedAmountsArray={priceView.amounts}
                    sale={product.sale}
                    fixedPrices
                  />
                  <Input type="checkbox" bind:value={labeling.global_margin}>
                    Odgórna marża <b>na znakowanie</b> ({chosenLabeling.margin ?? 0}%, <small>min</small>
                    {chosenLabeling.minimum ?? 0}zł)
                  </Input>
                  {#if !labeling.global_margin}
                    <div class="ui-box ui-box--optional">
                      <div class="ui-pair">
                        <Input type="number" bind:value={labeling.margin}>Marża <small>%</small></Input>
                        <Input type="number" bind:value={labeling.minimum}>Minimum <small>zł</small></Input>
                      </div>
                    </div>
                  {/if}
                {/if}
              </div>
            {/each}

            <Button icon="add" on:click={pushLabeling}>Dodaj</Button>
          </div>
        </div>
      </div>
    </div>
  </section>
{/if}

<style>
  .labelings {
    grid-column: 2 / span 3;
  }

  .warning {
    --border: 2px solid var(--main);
  }
</style>
