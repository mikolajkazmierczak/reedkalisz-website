<script>
  import { deep } from '%/utils';
  import { recalculateLabelings, toggleCustomPrices } from '%/calculations';
  import { repairPrices, cleanupPrices } from '%/calculationsPrices';
  import Input from '@c/Input.svelte';
  import Button from '@c/Button.svelte';
  import { beside } from '@/beside';

  import { globals, companies, globalMargins, priceViews, labelings } from '@/globals';
  import { defaultLabeling, labelingText } from '@/labelings';
  import { companyIcon } from '@c/CompanyIcon.svelte';
  import ProductPricingTable from './ProductPricingTable.svelte';
  import ProductPricingMargins from './ProductPricingMargins.svelte';
  import LabelingField from './LabelingField.svelte';
  import { syncsLabelings, mappedLabelings, isManagedLabeling } from '@/sync';
  import { tell } from '@/dialog';

  export let product;
  export let productOriginal;
  export let scanner = { variant: () => false }; // what the API scanner overwrites (see scannerFields)
  // a sale price over the price: said under the price, and the product isn't saved (see Product)
  export let saleTooHigh = false;

  async function read() {
    // $companies loaded in parent component
    await globals.update(globalMargins);
    await globals.update(priceViews);
    await globals.update(labelings);
  }

  // the same labeling on the same field twice (in other places it's another labeling of the product)
  const number = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
  const sameField = (a, b) =>
    a.labeling == b.labeling &&
    number(a.labeling_field_x) === number(b.labeling_field_x) &&
    number(a.labeling_field_y) === number(b.labeling_field_y);
  function checkDuplicateLabeling(labeling) {
    if (!labeling.labeling) return false;
    return product.labelings.filter((l) => sameField(l, labeling)).length > 1;
  }

  $: $labelings?.sort((a, b) => {
    // labelings are sorted by the user with the exception of the company
    const companyName = (x) => $companies.find((c) => c.id == x.company)?.name ?? '-';
    return companyName(a).localeCompare(companyName(b));
  });
  // the labelings a product can have: its company's and REED's (any, without a company)
  $: company = $companies?.find((c) => c.id === product.company);
  $: offered = ($labelings ?? []).filter((l) => !company || [company.id, 4].includes(l.company));
  // the ones the company's labeling mappings lead to: the scanner adds and removes them (see sync.js), they can't be
  // picked here
  $: labelingsSynced = scanner.labelings && syncsLabelings(company);
  $: scannerTargets = labelingsSynced ? mappedLabelings(company) : new Set();
  const byScanner = (l, targets) => !!l && targets.has(`${l.company}|${l.code}`);
  // another of the product's rows with that labeling on the same field: picking it would be a duplicate
  const taken = (row, id, rows) => rows.some((o) => o !== row && sameField(o, { ...row, labeling: id }));
  // a row's choice: its own one, and the others not the scanner's nor taken
  function labelingOptions(row, rows, offered, targets) {
    return offered.map((l) => {
      const { name: cname } = $companies.find((c) => c.id == l.company);
      const note =
        l.id === row.labeling
          ? undefined
          : byScanner(l, targets)
            ? 'Dodaje je skaner API'
            : taken(row, l.id, rows)
              ? 'Już jest w produkcie'
              : undefined;
      return { id: l.id, text: labelingText(l, cname), image: companyIcon(cname), disabled: !!note, note };
    });
  }

  function pushLabeling() {
    if ($labelings.length == 0) throw new Error('Brak znakowań w bazie danych');
    // the company's default, else the first in the list - not one of the scanner's, nor one the product has already
    // (on no field: as the new one)
    const fresh = { labeling_field_x: null, labeling_field_y: null };
    const preferred = defaultLabeling($labelings, product.company, { withCode: false });
    const labeling = [preferred, ...offered].find(
      (l) => l && !byScanner(l, scannerTargets) && !taken(fresh, l.id, product.labelings),
    );
    if (!labeling) return tell('Wszystkie znakowania, które można dodać, są już w tym produkcie.');
    product.labelings.push({
      index: product.labelings.length,
      enabled: true,
      labeling: labeling.id,
      prices: [],
      prices_sale: [],
      global_margin: true,
      margin: null,
      minimum: null,
    });
    product.labelings = product.labelings;
  }
  function removeLabeling(i) {
    product.labelings.splice(i, 1);
    product.labelings = product.labelings;
  }

  read();

  // PRICE VIEW
  // its amounts under its name in the list, and after it on the field - unless its name is just them ("10, 20, 50")
  function viewOption({ id, name, amounts }) {
    const listed = amounts.join(', ');
    const named = String(name).match(/\d+/g)?.join(', ') === listed;
    return { id, text: name, note: listed, ...(!named && { after: listed }) };
  }
  function selectDefaultPriceView() {
    product.price_view = $priceViews.find((p) => p.default).id;
  }
  $: priceViewData = $priceViews?.find((p) => p.id == product.price_view);
  $: if ($priceViews && !priceViewData) selectDefaultPriceView(); // if unset or the already set doesn't exist

  // LABELINGS
  function updateLabelingsPrices() {
    if ($globalMargins && $priceViews && $labelings && product)
      recalculateLabelings(
        priceViewData.amounts,
        $globalMargins,
        $labelings,
        $companies,
        product,
        productLabelingsReusable,
      );
  }
  $: productLabelingsReusable = productOriginal.labelings.map(({ id, prices, prices_sale }) => {
    const pricesIDs = prices.map((p) => p.id);
    const pricesSaleIDs = prices_sale.map((p) => p.id);
    return { id, pricesIDs, pricesSaleIDs };
  });
  $: someLabelingsEnabled = product.labelings.some((l) => l.enabled);
  $: saleTooHigh = !!(
    product.show_price &&
    product.sale &&
    someLabelingsEnabled &&
    product.price != null &&
    product.price_sale != null &&
    product.price_sale > product.price
  );
  $: if (product.labelings.length) updateLabelingsPrices();

  // CUSTOM PRICES
  function cleanupCustomPrices() {
    [product.custom_prices, product.custom_prices_sale] = cleanupPrices(
      priceViewData.amounts,
      product.custom_prices,
      product.custom_prices_sale,
      customPricesReusable,
    );
  }
  $: customPricesReusable = {
    prices1: productOriginal.custom_prices.map(({ id, amount, price }) => ({ id, amount, price })),
    prices2: productOriginal.custom_prices_sale.map(({ id, amount, price }) => ({ id, amount, price })),
  };
  // repair (only once) and clean prices
  [product.custom_prices, product.custom_prices_sale] = repairPrices(product.custom_prices, product.custom_prices_sale);
  let lastPriceViewAmounts = null;
  $: if (priceViewData?.amounts) {
    if (!deep.same(priceViewData, lastPriceViewAmounts)) {
      lastPriceViewAmounts = deep.copy(priceViewData);
      cleanupCustomPrices();
    }
  }
  // toggle state (enabled/disabled)
  $: toggleCustomPrices(
    product.custom_prices,
    product.custom_prices_sale,
    product.show_price,
    product.sale,
    someLabelingsEnabled,
  );
</script>

{#if product && $labelings && $priceViews && $globalMargins}
  <section class="ui-section">
    <h2 class="ui-h2">Cennik</h2>
    <div class="ui-section__row">
      <div class="ui-section__col">
        <!-- a price list that isn't shown: just the switch, the rest stays as it was -->
        <div class="ui-box">
          <div class="toggles">
            <Input type="checkbox" bind:value={product.show_price}>Widoczny</Input>
            {#if product.show_price}
              <Input type="checkbox" bind:value={product.sale}>Promocja</Input>
            {/if}
          </div>
          {#if product.show_price}
            <Input type="select" bind:value={product.price_view} options={$priceViews.map(viewOption)}>Widok</Input>
          {/if}
        </div>

        {#if product.show_price}
          {#if someLabelingsEnabled}
            <div class="ui-box">
              <!-- the price, and beside it the sale's (the amounts it leaves out under it) -->
              <div class="ui-pair prices">
                <div>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    bind:value={product.price}
                    api={scanner.price}
                    disabled={scanner.price}>
                    Cena
                  </Input>
                  {#if saleTooHigh}
                    <p class="price-error">Cena w promocji nie może być wyższa od zwykłej.</p>
                  {/if}
                </div>
                {#if product.sale}
                  <div class="ui-box ui-box--optional sale">
                    <Input type="number" min={0} step={0.01} bind:value={product.price_sale} invalid={saleTooHigh}>
                      Cena<small>Promocja</small>
                    </Input>
                    <Input
                      type="list"
                      placeholder="np. 500;1000"
                      bind:value={product.price_sale_blacklist}
                      listDisallowString
                      listDisallowNegative
                      listDisallowZero>
                      Wykluczenia
                    </Input>
                  </div>
                {/if}
              </div>

              {#if company?.api_handling_costs}
                <Input
                  type="select"
                  bind:value={product.handling_cost}
                  options={[
                    { id: null, text: 'Brak', special: true }, // deselect
                    ...company.api_handling_costs.map(({ price, code, name }) => {
                      const text = `${price} zł (${code}${name ? ` / ${name}` : ''})`;
                      return { id: price, text };
                    }),
                  ]}
                  api={scanner.handling_cost}
                  disabled={scanner.handling_cost}>
                  Koszty manipulacyjne
                </Input>
              {/if}

              <ProductPricingMargins
                text="produkt"
                globalMargin={$globalMargins.product_margin}
                globalMinimum={$globalMargins.product_minimum}
                bind:globalEnabled={product.global_product_margin}
                bind:margin={product.product_margin}
                bind:minimum={product.product_minimum} />
              <ProductPricingMargins
                text="całość"
                globalMargin={$globalMargins.full_margin}
                globalMinimum={$globalMargins.full_minimum}
                bind:globalEnabled={product.global_full_margin}
                bind:margin={product.full_margin}
                bind:minimum={product.full_minimum} />
            </div>
          {:else}
            <div class="ui-box">
              <ProductPricingTable
                bind:prices={product.custom_prices}
                bind:pricesSale={product.custom_prices_sale}
                sale={product.sale} />
              <Input type="checkbox" bind:value={product.custom_prices_with_labeling}>Ceny ze znakowaniem</Input>
              {#if product.custom_prices_with_labeling}
                <div class="ui-box ui-box--optional">
                  <LabelingField
                    bind:x={product.labeling_field_x}
                    bind:y={product.labeling_field_y}
                    bind:place={product.labeling_place} />
                </div>
              {/if}
            </div>
          {/if}
        {/if}
      </div>

      {#if product.show_price}
        <div class="ui-section__col labelings">
          <div class="ui-box">
            <h3 class="ui-h3">Kalkulacje</h3>
            <div class="ui-section__row">
              {#each product.labelings as labeling, i (labeling)}
                {@const chosenLabeling = $labelings.find((l) => l.id == labeling.labeling)}
                {@const duplicateLabeling = checkDuplicateLabeling(labeling)}
                {@const managed = isManagedLabeling(labeling, $labelings, company, scannerTargets)}
                <div
                  class="ui-box ui-box--element"
                  class:ui-box--uneditable={!labeling.enabled}
                  class:warning={duplicateLabeling}>
                  <div class="ui-pair actions">
                    <div class="enabled">
                      <Input type="checkbox" bind:value={labeling.enabled}>Włączone</Input>
                    </div>
                    <div>
                      <Button size="sm" icon="delete" on:click={() => removeLabeling(i)} disabled={managed} dangerous />
                    </div>
                  </div>

                  <Input
                    type="select"
                    label="Znakowanie"
                    bind:value={labeling.labeling}
                    api={managed}
                    apiText={'Prowadzi do niego mapowanie znakowań.\nSkaner API ustawia znakowanie, pole i miejsce, dodaje je i usuwa.'}
                    disabled={managed}
                    options={labelingOptions(labeling, product.labelings, offered, scannerTargets)} />

                  {#if company?.api_handling_costs && product.handling_cost}
                    <small>Do cen jednostkowych dodawane są koszty manipulacyjne</small>
                  {/if}

                  {#if chosenLabeling && labeling.enabled}
                    <ProductPricingTable
                      prices={labeling.prices}
                      pricesSale={labeling.prices_sale}
                      sale={product.sale}
                      fixed />
                    <ProductPricingMargins
                      text="znakowanie"
                      globalMargin={chosenLabeling.margin}
                      globalMinimum={chosenLabeling.minimum}
                      bind:globalEnabled={labeling.global_margin}
                      bind:margin={labeling.margin}
                      bind:minimum={labeling.minimum} />
                  {/if}

                  <LabelingField
                    bind:x={labeling.labeling_field_x}
                    bind:y={labeling.labeling_field_y}
                    bind:place={labeling.labeling_place}
                    api={managed} />
                </div>
              {/each}

              <span class="ui-add" use:beside><Button icon="add" on:click={pushLabeling}>Dodaj</Button></span>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </section>
{/if}

<style>
  .toggles {
    display: flex;
    gap: 1rem;
  }
  /* each as tall as it is (the price's API mark stays under its field) */
  .prices {
    align-items: start;
  }
  /* under the price: what's wrong with the sale's, beside it */
  .price-error {
    margin: 0.5rem 0 0 1.5rem; /* (past the price's API mark) */
    font-size: 0.85rem;
    color: var(--red-500);
  }
  /* the sale's box in its column: its fields level with the price beside it (half its padding above them) */
  .sale {
    gap: 0.75rem;
    margin-top: -0.5rem;
  }
  .warning {
    --border: 2px solid var(--red-300);
  }

  .labelings {
    grid-column: 2 / -1;
  }
  .actions div {
    display: flex;
    justify-content: flex-end;
  }
  .actions .enabled {
    justify-content: flex-start;
    align-items: center;
  }
</style>
