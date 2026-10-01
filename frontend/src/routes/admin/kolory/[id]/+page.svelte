<script>
  import Color from '@/editors/color/Color.svelte';

  export let data;
  // TODO: read once (see produkty/[slug])
  let { id } = data;
</script>

<Color {id} />
