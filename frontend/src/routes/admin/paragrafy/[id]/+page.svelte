<script>
  import CommercialDetails from '@/editors/commercial_details/CommercialDetails.svelte';

  export let data;
  // TODO: read once (see produkty/[slug])
  let { id } = data;
</script>

<CommercialDetails {id} />
