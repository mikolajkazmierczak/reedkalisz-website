<script>
  /** @type {'new'|'sale'|'bestseller'|'soon'|'out'} */
  export let tone = 'new';
  export let label;
</script>

<span class="badge badge--{tone}">{label}</span>

<style>
  /* White ring keeps badges readable on any photo. */
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 0.1875rem 0.5rem;
    border: 1.5px solid #fff;
    border-radius: var(--r-pill);
    font-family: var(--font-mono);
    font-size: 0.625rem;
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
    -webkit-user-select: none;
    user-select: none;
  }
  .badge--new {
    background-color: var(--purple);
    color: #fff;
  }
  .badge--sale {
    background-color: var(--orange);
    color: #fff;
  }
  .badge--bestseller {
    background-color: var(--navy);
    color: #fff;
  }
  .badge--soon {
    background-color: #fff;
    color: var(--ink);
    border-color: var(--ink);
  }
  .badge--out {
    background-color: var(--ink-600);
    color: #fff;
  }
</style>
