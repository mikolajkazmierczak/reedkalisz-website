<script>
  import api from '$/api';
  import heimdall from '$/heimdall';
  import { deep, diffSync, uid } from '%/utils';
  import Button from '@c/Button.svelte';
  import Input from '@c/Input.svelte';
  import Arrow from '../mappings/Arrow.svelte';
  import HeadIcon from '@c/table/HeadIcon.svelte';
  import Panel from '../mappings/Panel.svelte';
  import Grid from '@c/table/Grid.svelte';
  import { countHits, matchRule, normal, placeCounts, placeWins, translatePlace, uselessRules } from '../places.js';

  export let apiCompany;
  export let apiItems = null; // the api snapshot

  const SHOWN_PLACES = 40; // the rest behind "Pokaż wszystkie" (the rules are always all shown)

  let rulesOriginal = [];
  let rules = [];
  let query = '';
  let allPlaces = false; // every place the api has, or the most frequent ones

  $: unsaved = diffSync(rules, rulesOriginal).changed;

  $: places = placeCounts(apiItems);
  // once per company, after `places` (the rules are sorted by what they translate): a store update (even the echo of
  // a save) mustn't wipe the edits (a new scan remounts this)
  let loadedId;
  $: if (apiCompany.id !== loadedId) {
    loadedId = apiCompany.id;
    load(places);
  }

  function load(places) {
    // the rules translating the most places first; the order doesn't change what they do
    const loaded = (apiCompany.api_places_mappings ?? []).map(({ pattern, to }) => ({ _uid: uid(10), pattern, to }));
    const hits = countHits(placeWins(loaded, places));
    loaded.sort((a, b) => (hits.get(b) ?? 0) - (hits.get(a) ?? 0));
    rulesOriginal = loaded;
    rules = deep.copy(loaded);
  }

  $: results = places.map(({ place, count }) => {
    const rule = matchRule(rules, place);
    return { place, count, rule, translated: rule ? normal(rule.to) : place.trim() };
  });
  $: wins = placeWins(rules, places);
  $: hits = countHits(wins);
  $: useless = uselessRules(rules, wins);
  $: untranslated = results.filter((r) => !r.rule);
  $: patterns = rules.map((r) => r.pattern?.trim().toLowerCase()).filter(Boolean);
  $: repeated = [...new Set(patterns.filter((p, i) => patterns.indexOf(p) !== i))];

  $: shownPlaces = allPlaces ? results : results.slice(0, SHOWN_PLACES);

  $: q = query?.trim().toLowerCase();
  // the place typed (whether the api has it or not), then the api's that contain it
  $: typed = query?.trim();
  $: preview = q
    ? [
        ...(results.some((r) => r.place.toLowerCase() === q)
          ? []
          : [{ place: typed, count: null, rule: matchRule(rules, typed), translated: translatePlace(rules, typed) }]),
        ...results
          .filter((r) => r.place.toLowerCase().includes(q) || r.translated.toLowerCase().includes(q))
          .slice(0, 50),
      ]
    : [];

  function add(pattern = '') {
    rules = [{ _uid: uid(10), pattern, to: '' }, ...rules]; // first, so it's never hidden
  }
  function remove(ruleUid) {
    rules = rules.filter((r) => r._uid !== ruleUid);
  }

  async function save() {
    const kept = rules.filter((r) => r.pattern?.trim());
    const data = kept.map(({ _uid, ...rule }) => rule);
    await api.items('companies').updateOne(apiCompany.id, { api_places_mappings: data.length ? data : null });
    heimdall.emit('companies', apiCompany.id);
    rules = kept;
    rulesOriginal = deep.copy(kept);
  }

  function cancel() {
    rules = deep.copy(rulesOriginal);
  }
</script>

<Panel title="Mapowanie miejsc znakowań" {unsaved} on:save={save} on:cancel={cancel}>
  <svelte:fragment slot="summary">
    {#if places.length}
      <small>Przetłumaczono <b>{results.length - untranslated.length}</b> / {results.length}</small>
    {/if}
  </svelte:fragment>

  <!-- the hints as one block, the places under their label (see Panel) -->
  <div class="legend">
    <small class="muted"
      >Wielkość liter jest ignorowana. Wygrywa zawsze najdłuższa reguła (np. prawy bok &gt; bok).</small>
    {#if results.length}
      <small>
        <span class="key key--grey">Wyszarzone</span> są przetłumaczone bezpośrednio.
        <span class="key">Niebieskie</span> są przetłumaczone, bo jakaś reguła zawiera część ich tekstu.
      </small>
      <small
        ><span class="key key--orange">Pomarańczowe</span> nie są przetłumaczone, więc zostaną dodane w oryginale.</small>
    {/if}
  </div>

  {#if !places.length}
    <p class="muted">Zeskanuj API, aby zobaczyć miejsca znakowań.</p>
  {/if}

  <div class="codes">
    {#if results.length}
      <small><b>Miejsca</b> · <span class="muted">Kliknij, by dodać regułę</span></small>
      <div class="chips">
        {#each shownPlaces as { place, count, rule } (place)}
          {@const exact = patterns.includes(place.toLowerCase())}
          <Button size="sm" disabled={exact} tone={!rule && !exact ? 'warning' : null} on:click={() => add(place)}>
            {place} <span class="count">({count})</span>
          </Button>
        {/each}
      </div>
    {/if}
    <div class="tools">
      <Button size="sm" icon="add" on:click={() => add()}>Reguła</Button>
      {#if results.length > SHOWN_PLACES}
        <Button size="sm" dashed on:click={() => (allPlaces = !allPlaces)}>
          {allPlaces ? 'Zwiń' : `Pokaż wszystkie (${results.length})`}
        </Button>
      {/if}
    </div>
  </div>

  {#if repeated.length}
    <small class="error">Powtórzone reguły: {repeated.join(', ')}. Działa tylko pierwsza.</small>
  {/if}

  <!-- the test beside the rules when there's room for both, under them when not -->
  <svelte:fragment slot="after">
    <div class="beside">
      <div class="columns">
        <Grid
          columns="1.5rem minmax(8rem, 16rem) 3.5rem 1.5rem minmax(8rem, 16rem)"
          empty={rules.length ? null : 'Brak reguł. Miejsca zaimportują się tak, jak podaje je API.'}>
          <svelte:fragment slot="head">
            <HeadIcon icon="delete" label="Usuwanie" />
            <span>Miejsce (zawiera)</span>
            <span class="hits">Dopasowania</span>
            <span />
            <span>U nas</span>
          </svelte:fragment>
          {#each rules as rule (rule._uid)}
            {@const count = hits.get(rule) ?? 0}
            <div class="row">
              {#if useless.has(rule)}
                {@const instead = useless.get(rule)}
                <small class="useless">
                  Zbędna reguła: {#if instead?.length}reguła „{instead[0].pattern}” → „{instead[0].to}” osiąga to samo.{:else if instead}bez
                    niej te miejsca zostaną takie same.{:else}bez niej te miejsca przetłumaczą się tak samo.{/if}
                </small>
              {/if}
              <Button size="sm" dangerous icon="delete" on:click={() => remove(rule._uid)} />
              <Input size="small" bind:value={rule.pattern} placeholder="z API" />
              <span class="hits" class:zero={!count} title="Dopasowania">{count}</span>
              <Arrow />
              <Input size="small" bind:value={rule.to} placeholder="tłumaczenie" />
            </div>
          {/each}
        </Grid>
        {#if places.length}
          <div class="ui-box preview">
            <div class="preview-head">
              <h3>Przetestuj</h3>
              <small class="muted">Wpisz miejsce, jak podałoby je API</small>
            </div>
            <div class="search"><Input size="small" bind:value={query} placeholder="np. FRONT" /></div>
            {#each preview as r (r.place)}
              <div class="preview-row">
                <span>{r.place}</span>
                <Arrow />
                <span class:same={!r.rule}>{r.translated}</span>
                <small class="muted">{r.count ?? ''}</small>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </svelte:fragment>
</Panel>

<style>
  .count {
    opacity: 0.8;
    font-weight: normal;
  }

  .hits {
    font-size: 0.85rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: var(--grey-500);
  }
  .hits.zero {
    color: var(--red-500);
  }
  /* over its rule, the whole row (as the labelings' mappings) */
  .useless {
    grid-column: 1 / -1;
    color: var(--orange-700);
  }

  /* one column, or the rules and the test side by side: the test as wide as its rows need, in whole half cells, the
     rules the rest - so both reach the mat's frame */
  .beside {
    container-type: inline-size;
  }
  .columns {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: start;
    gap: var(--page-pad);
  }
  @container (min-width: 64rem) {
    .columns {
      grid-template-columns: minmax(0, 1fr) round(up, 31rem, var(--half));
    }
  }
  .preview {
    gap: 0.25rem;
  }
  .preview-head {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }
  .preview-head h3 {
    margin: 0;
  }
  .search {
    width: 20rem;
  }
  .preview-row {
    display: grid;
    grid-template-columns: minmax(12rem, 20rem) 1.5rem minmax(12rem, 20rem) 3rem;
    align-items: center;
    font-size: 0.9rem;
  }
  .same {
    color: var(--red-500);
  }
</style>
