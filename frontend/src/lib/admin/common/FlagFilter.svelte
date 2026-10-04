<script>
  // A list's filter by a yes/no field, looking like a small checkbox with three states in turn:
  // null (not filtering), true (only those with it: navy, a tick), false (only those without: red, a cross).
  export let value = null;
  export let label;

  const next = { null: true, true: false, false: null };
</script>

<button
  type="button"
  class="flag"
  class:on={value === true}
  class:not={value === false}
  aria-pressed={value !== null}
  aria-label={value === false ? `${label}: bez` : label}
  on:click={() => (value = next[value])}>
  <span class="box" />
  <span class="label">{label}</span>
</button>

<style>
  .flag {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0;
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    font-size: var(--label-size, 0.85rem); /* a surrounding bar can set its own */
    user-select: none;
  }
  /* as Input's small checkbox */
  .box {
    flex: none;
    display: grid;
    place-items: center;
    width: 1rem;
    height: 1rem;
    border: solid 1px var(--edge);
    border-radius: var(--field-radius-compact);
    corner-shape: squircle;
    background-color: var(--paper-field);
    transition:
      background-color 100ms,
      border-color 100ms;
  }
  .box::after {
    content: '';
    width: 75%;
    height: 75%;
    transform: scale(0.4);
    opacity: 0;
    transition:
      transform 100ms,
      opacity 100ms;
  }
  .flag:hover .box {
    border-color: var(--navy-500);
  }
  .flag:focus-visible {
    outline: none;
  }
  .flag:focus-visible .box {
    outline: solid 2px var(--navy-500);
    outline-offset: 1px;
  }

  .on .box {
    border-color: var(--navy-700);
    background-color: var(--navy-700);
  }
  .on:hover .box {
    border-color: var(--navy-500);
    background-color: var(--navy-500);
  }
  .on .box::after {
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 8.5l3.25 3.25L13 5' fill='none' stroke='%23fff' stroke-width='2.25' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
      center / contain no-repeat;
  }

  .not .box {
    border-color: var(--red-500);
    background-color: var(--red-500);
  }
  .not:hover .box {
    border-color: var(--red-400);
    background-color: var(--red-400);
  }
  .not .box::after {
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 4.5l7 7M11.5 4.5l-7 7' fill='none' stroke='%23fff' stroke-width='2.25' stroke-linecap='round'/%3E%3C/svg%3E")
      center / contain no-repeat;
  }
  .not .label {
    color: var(--red-500);
  }

  .on .box::after,
  .not .box::after {
    transform: none;
    opacity: 1;
  }
</style>
