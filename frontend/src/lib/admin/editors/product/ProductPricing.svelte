<script>
  import { moveItem } from '$/utils';
  import { recalculateLabelings, toggleCustomPrices } from '@/calculations';
  import { repairPrices, cleanupPrices } from '@/calculationsPrices';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';

  import { updateGlobal, companies, globalMargins, priceViews, labelings } from '@/global';
  import ProductPricingTable from './ProductPricingTable.svelte';
  import ProductPricingMargins from './ProductPricingMargins.svelte';
  import { tick } from 'svelte';

  export let product;
  export let productOriginal;

  async function read() {
    // info: $companies are loaded in parent component
    await updateGlobal(globalMargins);
    await updateGlobal(priceViews);
    await updateGlobal(labelings);
  }

  function checkDuplicateLabeling(id) {
    if (!id) return false;
    const owners = product.labelings.filter(l => l.labeling == id);
    return owners.length > 1;
  }

  function pushLabeling() {
    if ($labelings.length == 0) throw new Error('Brak znakowań w bazie danych');
    const labeling = $labelings.find(l => l.company.id == product.company && l.default) ?? $labelings[0];
    product.labelings.push({
      index: product.labelings.length,
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
  function moveLabeling(i, d) {
    product.labelings = moveItem(product.labelings, i, d);
  }

  read();

  // PRICE VIEW
  function selectDefaultPriceView() {
    product.price_view = $priceViews.find(p => p.default).id;
  }
  $: priceViewData = $priceViews?.find(p => p.id == product.price_view);
  $: if ($priceViews && !priceViewData) selectDefaultPriceView(); // if unset or the already set doesn't exist

  // LABELINGS
  function updateLabelingsPrices() {
    if ($globalMargins && $priceViews && $labelings && product)
      recalculateLabelings(priceViewData.amounts, $globalMargins, $labelings, product, productLabelingsReusable);
  }
  $: $labelings?.sort((a, b) => {
    // labelings are sorted by the user with the exception of the company
    const company = x => $companies.find(c => c.id == x.company)?.name ?? '-';
    return company(a).localeCompare(company(b));
  });
  $: productLabelingsReusable = productOriginal.labelings.map(({ id, prices, prices_sale }) => {
    const pricesIDs = prices.map(p => p.id);
    const pricesSaleIDs = prices_sale.map(p => p.id);
    return { id, pricesIDs, pricesSaleIDs };
  });
  $: someLabelingsEnabled = product.labelings.some(l => l.enabled);
  $: if (product.labelings.length) updateLabelingsPrices();

  // CUSTOM PRICES
  function cleanupCustomPrices() {
    [product.custom_prices, product.custom_prices_sale] = cleanupPrices(
      priceViewData.amounts,
      product.custom_prices,
      product.custom_prices_sale,
      customPricesReusable
    );
  }
  $: customPricesReusable = {
    prices1: productOriginal.custom_prices.map(({ id, amount, price }) => ({ id, amount, price })),
    prices2: productOriginal.custom_prices_sale.map(({ id, amount, price }) => ({ id, amount, price }))
  };
  // repair (only once) and clean prices
  [product.custom_prices, product.custom_prices_sale] = repairPrices(product.custom_prices, product.custom_prices_sale);
  $: if (priceViewData?.amounts) cleanupCustomPrices();
  // toggle state (enabled/disabled)
  $: toggleCustomPrices(
    product.custom_prices,
    product.custom_prices_sale,
    product.show_price,
    product.sale,
    someLabelingsEnabled
  );
</script>

{#if product && $labelings && $priceViews && $globalMargins}
  <section class="ui-section">
    <h2 class="ui-h2">Cennik</h2>
    <div class="ui-section__row">
      <div class="ui-section__col">
        <div class="ui-box">
          <Input type="checkbox" bind:value={product.show_price}>Pokaż cenę</Input>
          <Input type="checkbox" bind:value={product.sale}>Promocja</Input>
          <Input
            type="select"
            bind:value={product.price_view}
            options={$priceViews.map(({ id, name, amounts }) => ({ id, text: `${name} [${amounts}]` }))}
          >
            Widok
          </Input>
        </div>

        {#if product.show_price}
          {#if someLabelingsEnabled}
            <div class="ui-box">
              <Input type="number" min={0} step={0.01} bind:value={product.price} api>Cena</Input>

              {#if product.sale}
                <div class="ui-box ui-box--optional">
                  <h3 class="ui-h3">Promocja</h3>
                  <div class="ui-pair">
                    <Input type="number" min={0} step={0.01} bind:value={product.price_sale}>Cena</Input>
                    <Input
                      type="list"
                      placeholder="np. 500;1000"
                      bind:value={product.price_sale_blacklist}
                      listDisallowString
                      listDisallowNegative
                      listDisallowZero
                    >
                      Wykluczenia
                    </Input>
                  </div>
                </div>
              {/if}

              <ProductPricingMargins
                text="na całość"
                globalMargin={$globalMargins.full_margin}
                globalMinimum={$globalMargins.full_minimum}
                bind:globalEnabled={product.global_full_margin}
                bind:margin={product.full_margin}
                bind:minimum={product.full_minimum}
              />
              <ProductPricingMargins
                text="na produkt"
                globalMargin={$globalMargins.product_margin}
                globalMinimum={$globalMargins.product_minimum}
                bind:globalEnabled={product.global_product_margin}
                bind:margin={product.product_margin}
                bind:minimum={product.product_minimum}
              />
            </div>
          {:else}
            <div class="ui-box">
              <ProductPricingTable
                bind:prices={product.custom_prices}
                bind:pricesSale={product.custom_prices_sale}
                sale={product.sale}
              />
              <Input type="checkbox" bind:value={product.custom_prices_with_labeling}>Ceny ze znakowaniem</Input>
            </div>
          {/if}
        {/if}
      </div>

      <div class="ui-section__col labelings">
        <div class="ui-box">
          <h3 class="ui-h3">Kalkulacje</h3>
          <div class="ui-section__row">
            {#each product.labelings as labeling, i (labeling)}
              {@const chosenLabeling = $labelings.find(l => l.id == labeling.labeling)}
              {@const duplicateLabeling = checkDuplicateLabeling(labeling.labeling)}
              <div
                class="ui-box ui-box--element"
                class:ui-box--uneditable={!labeling.enabled}
                class:warning={duplicateLabeling}
              >
                <div class="ui-pair actions">
                  <Input type="checkbox" bind:value={labeling.enabled}>Włączone</Input>
                  <div>
                    {#if !i == 0}
                      <Button icon="arrow_left" on:click={() => moveLabeling(i, -1)} square />
                    {/if}
                    {#if i < product.labelings.length - 1}
                      <Button icon="arrow_right" on:click={() => moveLabeling(i, 1)} square />
                    {/if}
                    <Button icon="delete" on:click={() => removeLabeling(i)} dangerous />
                  </div>
                </div>
                {#if duplicateLabeling}
                  <h4 class="ui-h4" style:color="var(--main-4)">DUPLIKAT</h4>
                {/if}
                <Input
                  type="select"
                  bind:value={labeling.labeling}
                  options={$labelings.map(({ id, company, code, type, name }) => {
                    company = $companies.find(c => c.id == company);
                    return { id, text: `${company.name} ${code || '-'} ${type || '-'} ${name || '-'}` };
                  })}
                />

                {#if chosenLabeling && labeling.enabled}
                  <ProductPricingTable
                    prices={labeling.prices}
                    pricesSale={labeling.prices_sale}
                    sale={product.sale}
                    fixed
                  />
                  <ProductPricingMargins
                    text="na znakowanie"
                    globalMargin={chosenLabeling.margin}
                    globalMinimum={chosenLabeling.minimum}
                    bind:globalEnabled={labeling.global_margin}
                    bind:margin={labeling.margin}
                    bind:minimum={labeling.minimum}
                  />
                {/if}
              </div>
            {/each}

            <Button icon="add" on:click={pushLabeling}>Dodaj</Button>
          </div>
        </div>
      </div>
    </div>

    <!-- <pre style="display:flex;">
      <pre>{JSON.stringify(product.custom_prices, null, 2)}</pre>
      <pre>{JSON.stringify(product.custom_prices_sale, null, 2)}</pre>
      {#each product.labelings as labeling}
        <pre>{JSON.stringify(labeling.prices, null, 2)}</pre>
        <pre>{JSON.stringify(
            labeling.prices_sale,
            null,
            2
          )}</pre>
      {/each}
    </pre> -->
  </section>
{/if}

<style>
  .warning {
    --border: 2px solid var(--main-3);
  }

  .labelings {
    grid-column: 2 / span 3;
  }
  .actions div {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
</style>
