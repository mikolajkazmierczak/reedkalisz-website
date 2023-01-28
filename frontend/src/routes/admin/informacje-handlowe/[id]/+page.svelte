<script>
  import CommercialDetails from '@/editors/commercial_details/CommercialDetails.svelte';

  export let data;
  let { id } = data;
</script>

<CommercialDetails {id} />
