<script>
  export let data;
  let { colors } = data;
</script>

<h1>Welcome to the jungle</h1>
<p>index</p>

<br />
<br />
<br />
<h2>Kolory</h2>
{#if colors}
  {#each colors as color}
    <div>
      {color.color}
      <b>{color.name}</b>
    </div>
  {/each}
{/if}
