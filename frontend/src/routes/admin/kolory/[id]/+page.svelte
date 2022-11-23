<script>
  import Color from '@/editors/color/Color.svelte';

  export let data;
  let { id } = data;
</script>

<Color {id} />
