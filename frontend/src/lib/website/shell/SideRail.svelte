<script>
  import RailContent from './RailContent.svelte';

  export let items;
</script>

<aside class="shell__rail">
  <div class="shell__rail-inner rail-frame">
    <RailContent {items} />
  </div>
</aside>
