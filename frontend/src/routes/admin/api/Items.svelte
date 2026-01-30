<script>
  import api from "$/api";
  import heimdall from "$/heimdall";
  import { readUid } from "%/uid";
  import { colors } from "@/globals";
  import { selected, toggleItemSelected, toggleStorageSelected } from "./selected.js";
  import { getFlag, parseColors } from "./utils.js";

  import Icon from "$c/Icon.svelte";
  import Tooltip from "$c/Tooltip.svelte";

  export let items;
  export let company;

  let expanded = new Set();
  $: flags = (() => {
    const { rejected, cut, check, todo, edit, inprogress, done } = company.api_flags;
    return {
      _default: { text: "" },
      rejected: { text: "❌ Odrzucony", items: rejected || [] },
      cut: { text: "♻️ Ma zamiennik", items: cut || [] },
      check: { text: "🔍 Hmm", items: check || [] },
      todo: { text: "💼 Do dodania", items: todo || [] },
      edit: { text: "✏️ Do edycji", items: edit || [] },
      inprogress: { text: "🔧 W budowie", items: inprogress || [] },
      done: { text: "✅ Gotowy", items: done || [] },
    };
  })();

  async function handleStatusChange(e, item) {
    // get previous flag
    const flag = getFlag(flags, item._uid);
    // get selected flag
    const options = Array.from(e.target.children);
    const newFlag = options.find((o) => o.selected).value;
    // move uid to the selected flag
    if (flag != "_default") flags[flag].items = flags[flag].items.filter((uid) => uid != item._uid); // remove from previous flag
    if (newFlag != "_default") flags[newFlag].items.push(item._uid); // add to new flag
    // update company data, only upload flags that have items, { flag: [uid, uid, ...] }
    const api_flags = Object.fromEntries(
      Object.entries(flags)
        .filter(([key, { items }]) => items?.length)
        .map(([key, { items }]) => [key, items]),
    );
    // update company
    await api.items("companies").updateOne(company.id, { api_flags });
    heimdall.emit("companies", company.id);
  }

  function toggleExpanded(uid) {
    expanded.has(uid) ? expanded.delete(uid) : expanded.add(uid);
    expanded = expanded;
  }

  async function removeItem(item) {
    if (confirm(`OPERACJA NIEODWRACALNA!\nUsunąć produkt ${item._uid}?`)) {
      await api.items("products").deleteOne(item.id);
      heimdall.emit("products", item.id);
    }
  }
  async function removeStorage(item, storage) {
    if (confirm(`OPERACJA NIEODWRACALNA!\nUsunąć kolor ${storage._uid}?`)) {
      await api.items("products").updateOne(item.id, {
        // filter out 1) the storage being deleted 2) all storages not in db
        // and reindex the storages
        storage: item.storage.filter((s) => s.id && s.id != storage.id).map((s, i) => ({ ...s, index: i })),
      });
      heimdall.emit("products", item.id);
    }
  }

  function getCompanySpecificCode(uid) {
    const { productCode, colorCode } = readUid(uid);
    switch (company.name) {
      case "PAR":
        return `${productCode}${colorCode ? `.${colorCode}` : ""}`;
      case "MidOcean":
      case "BlueCollection":
        return `${productCode}${colorCode ? `-${colorCode}` : ""}`;
      case "EasyGifts":
      case "Macma":
      case "Promotionway":
      case "AXPOL":
        return `${productCode}${colorCode ? colorCode : ""}`;
      default:
        throw new Error("Company code not supported");
    }
  }

  function getApiUrl(uid) {
    const code = getCompanySpecificCode(uid);
    switch (company.name) {
      case "PAR":
        return `https://www.par.com.pl/products?search=${code}`;
      case "MidOcean":
        return `https://www.midocean.com/INTERSHOP/web/WFS/midocean-PL-Site/pl_PL/-/PLN/ViewParametricSearchBySearchIndex-Browse?SearchTerm=${code}`;
      case "BlueCollection":
        const productCode = code.split("-")[0];
        return `https://bluecollection.gifts/pl/${productCode}.html`;
      case "EasyGifts":
        return `https://www.easygifts.com.pl/search.php?dosearch=1&query=${code}`;
      case "Macma":
        return `https://macma.pl/search.php?dosearch=1&query=${code}`;
      case "Promotionway":
        return `https://promotionway.pl/search.php?query=${code}`;
      case "AXPOL":
        return `https://axpol.com.pl/pl/search/?search=product&string=${code}`;
      default:
        throw new Error("Company code not supported");
    }
  }
</script>

<table>
  {#each items as item}
    {@const getDbUrl = (slug) => `/admin/produkty/${slug}`}
    {@const itemNotAllInApi = item.storage.some((s) => !s._api)}
    {@const itemNotInApi = item.storage.every((s) => !s._api) || !item._api}
    {@const itemSelected = $selected.has(item._uid)}
    {@const itemExpanded = expanded.has(item._uid)}
    {@const itemCompatible = !item?._incompatible}
    {@const flag = flags && getFlag(flags, item._uid)}
    <tr class:selected={itemSelected}>
      <td class="flag">
        {#if flags}
          <select class={flag} on:change={(e) => handleStatusChange(e, item)}>
            {#each Object.entries(flags) as [key, { text }]}
              <option value={key} selected={flag == key}>{text}</option>
            {/each}
          </select>
        {/if}
      </td>
      <td class="mono index">
        <b>{item._index + 1}</b>
      </td>
      <td class="mono expand">
        {#if item.storage.length}
          <button on:click={() => toggleExpanded(item._uid)}>
            {itemExpanded ? "-" : `+${item.storage.length}`}
          </button>
        {/if}
      </td>
      <td class="code">
        {getCompanySpecificCode(item._uid)}
      </td>
      <td class="mono selection">
        {#if itemCompatible && !item.storage.every((s) => s._db)}
          {@const all = item.storage.every((s) => $selected.has(s._uid))}
          {@const some = item.storage.some((s) => $selected.has(s._uid))}
          <button on:click={() => toggleItemSelected(item)}>{all ? "-" : some ? "/" : "+"}</button>
        {/if}
      </td>
      <td class="name">
        {item.name}
        {#if item._db && !item.enabled}
          <div class="icon">
            <Icon height="15px" name="eye_off" />
            <Tooltip><small>Ukryty</small></Tooltip>
          </div>
        {/if}
      </td>
      <td class="remove">
        {#if item._db}
          <button class="remove" on:click={() => removeItem(item)}>
            <Icon height="16px" name="delete" color="var(--main)" />
          </button>
        {/if}
      </td>
      <td class="tags db">
        {#if item._db}
          <a class="tag in-db" href={getDbUrl(item.slug)} target="_blank" rel="noreferrer">
            <Icon height="15px" name="products" />Zaimportowany
          </a>
        {/if}
      </td>
      <td class="tags api">
        {#if itemNotInApi}
          <div class="tag not-in-api"><Icon height="18px" name="cloud_off" />Wycofany</div>
        {:else if itemNotAllInApi}
          <a class="tag not-all-in-api" href={getApiUrl(item._uid)} target="_blank" rel="noreferrer">
            <Icon height="18px" name="cloud" />Wycofane kolory
          </a>
        {:else}
          <a class="tag in-api" href={getApiUrl(item._uid)} target="_blank" rel="noreferrer">
            <Icon height="18px" name="cloud" />Dostępny
          </a>
        {/if}
        {#if !itemCompatible}
          <div class="tag not-in-api"><Icon height="18px" name="cloud_dismiss" />Niekompatybilny</div>
        {/if}
      </td>
    </tr>

    {#if $colors && itemExpanded}
      {#each item.storage as storage}
        {@const storageSelected = $selected.has(storage._uid)}
        {@const storageCompatible = !storage?._incompatible}
        <tr class:selected={storageSelected}>
          <td class="flag" />
          <td class="index">
            <span style:opacity={0.65}>{storage._index + 1}</span>
          </td>
          <td class="expand" />
          <td class="code">
            {getCompanySpecificCode(storage._uid)}
          </td>
          <td class="selection">
            {#if storageCompatible && !storage._db}
              <button on:click={() => toggleStorageSelected(item, storage)}>
                {storageSelected ? "-" : "+"}
              </button>
            {/if}
          </td>
          <td class="name">
            {$colors && parseColors(storage.color_first, storage.color_second)}
            {#if storage._db && !storage.enabled}
              <div class="icon">
                <Icon height="15px" name="eye_off" />
                <Tooltip><small>Ukryty</small></Tooltip>
              </div>
            {/if}
          </td>
          <td class="remove">
            {#if storage._db}
              <button class="remove" on:click={() => removeStorage(item, storage)}>
                <Icon height="16px" name="delete" color="var(--main)" />
              </button>
            {/if}
          </td>
          <td class="tags db">
            {#if storage._db}
              <a class="tag in-db" href={getDbUrl(item.slug)} target="_blank" rel="noreferrer">
                <Icon height="15px" name="products" />Zaimportowany
              </a>
            {/if}
          </td>
          <td class="tags api">
            {#if storage._api}
              <a class="tag in-api" href={getApiUrl(storage._uid)} target="_blank" rel="noreferrer">
                <Icon height="18px" name="cloud" />Dostępny
              </a>
            {:else}
              <div class="tag not-in-api"><Icon height="18px" name="cloud_off" />Wycofany</div>
            {/if}
            {#if !storageCompatible}
              <div class="tag not-in-api"><Icon height="18px" name="cloud_dismiss" />Niekompatybilny</div>
            {/if}
          </td>
        </tr>
      {/each}
    {/if}
  {/each}
</table>

<style>
  :root {
    --row-height: 26px;
    --blue: var(--accent-light);
    --blue-dark: #cee1e9;
    --green: #ddffdd;
    --green-dark: #c9e7c9;
    --yellow: #ffe9c2;
    --yellow-dark: #f0d9ba;
    --orange: #ffddc2;
    --red: var(--main-1);
    --purple: #e9d8ff;
    --purple-dark: #d1b1ff;
  }
  * {
    font-size: 0.9rem;
  }
  .mono,
  .mono * {
    font-family: monospace;
  }

  a:hover {
    text-decoration: none;
  }
  /* input[type='checkbox'] {
    cursor: pointer;
    width: calc(var(--row-height) - 11px);
    height: calc(var(--row-height) - 11px);
  } */
  button {
    cursor: pointer;
    margin: 0;
    padding: 0;
    height: calc(var(--row-height) - 2px);
    width: 100%;
  }
  button.remove {
    height: calc(var(--row-height) - 6px);
    color: var(--main);
    font-weight: bold;
  }

  table {
    border-collapse: collapse;
  }

  tr {
    border: var(--border-light);
    background-color: var(--light);
  }
  tr:hover {
    background-color: var(--accent-light);
  }
  tr.selected {
    background-color: var(--primary-white);
  }
  tr.selected:hover {
    /* gradient of hover and selected */
    background: linear-gradient(90deg, var(--primary-white), var(--accent-light));
  }

  td {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    margin: 0;
    padding: 0 0.25rem;
    height: var(--row-height);
    white-space: nowrap;
  }
  td.flag {
    display: table-cell;
  }
  td.index {
    justify-content: flex-end;
    width: 2.5rem;
  }
  td.expand {
    width: 3rem;
  }
  td.code {
    width: 6rem;
  }
  td.selection {
    width: 2rem;
  }
  td.name {
    display: table-cell;
    min-width: 60ch;
  }
  td.remove {
    width: 2rem;
  }

  td.tags.db {
    width: 8rem;
  }
  td.tags.api {
    margin-right: 0.25rem;
  }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    border-radius: var(--border-radius);
    border: var(--border);
    padding: 0 0.25rem;
    height: calc(var(--row-height) - 4px);
    width: 100%;
    white-space: nowrap;
    font-size: 0.8rem;
    text-decoration: none;
  }
  .in-db {
    background-color: var(--blue);
  }
  .in-db:hover {
    background-color: var(--blue-dark);
  }
  .in-api {
    background-color: var(--green);
  }
  .in-api:hover {
    background-color: var(--green-dark);
  }
  .not-all-in-api {
    background-color: var(--yellow);
  }
  .not-all-in-api:hover {
    background-color: var(--yellow-dark);
  }
  .not-in-api {
    cursor: not-allowed;
    background-color: var(--red);
  }

  .icon {
    display: inline-flex;
    align-items: center;
  }
  select._default {
    background-color: var(--white);
  }
  select.rejected {
    background-color: var(--red);
  }
  select.cut {
    background-color: var(--red);
  }
  select.check {
    background-color: var(--purple);
  }
  select.todo {
    background-color: var(--yellow);
  }
  select.edit {
    background-color: var(--orange);
  }
  select.inprogress {
    background-color: var(--blue);
  }
  select.done {
    background-color: var(--green);
  }
</style>
