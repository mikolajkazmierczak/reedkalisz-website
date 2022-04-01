<!-- <script>
  import api from '$lib/api';

  export let uri;

  let files = [];

  async function handleDrop(e) {
    e.preventDefault();
    const transfer = e.dataTransfer.files;
    for (const file of transfer) {
      files = [...files, file];
      let data = new FormData();
      data.append('file', file);
      const res = await api(fetch, 'POST', uri, data, 'form');
      console.log(res);
    }
  }

  async function handleDelete(i) {
    const filename = files[i].name;
    const res = await api(fetch, 'DELETE', uri, { filename });
    console.log(res);
    delete files[i];
  }
</script>

<form on:drop={handleDrop}>
  {#each files as file, i}
    <div class="img">
      {file.name}
      <button on:click={() => handleDelete(i)}>delete</button>
    </div>
  {/each}
  <input
    type="file"
    name="file"
    accept=".png,.jpg,.jpeg,.webp,.svg"
    multiple
    bind:files
  />
</form>

<style>
  input {
    min-height: 100px;
    min-width: 100px;
    background-color: aliceblue;
  }
</style> -->
