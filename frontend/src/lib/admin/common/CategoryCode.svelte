<script>
  // A category's number in the tree ("4.5.3"), before its name: small and blue, so the two stand apart
  export let code;
</script>

<span class="code">{code}</span>

<style>
  /* doubled: a button's content takes the button's colour, more specific than one class (see Button) */
  .code.code {
    flex: none;
    font-size: 0.85em;
    font-weight: 700;
    white-space: nowrap;
    color: var(--blue-700);
    /* with the space after it, 0.455rem to the name (where a gap stands in for the space, its container says how
       much is left: --code-after) */
    margin-right: var(--code-after, 0.23rem);
  }
</style>
