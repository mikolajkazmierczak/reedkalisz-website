<script context="module">
  import api from '$lib/api';

  export async function load() {
    try {
      const colors = await api.items('colors').readByQuery({
        limit: -1
      });
      return { props: { colors: colors.data } };
    } catch (err) {
      console.log('error');
      return { props: { colors: null } };
    }
  }
</script>

<script>
  export let colors;
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
