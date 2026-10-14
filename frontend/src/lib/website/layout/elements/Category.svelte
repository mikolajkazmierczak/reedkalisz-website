<script>
  import { page } from '$app/stores';
  import CategorySlider from '#c/CategorySlider.svelte';

  export let element;

  // this block's first page: from the server's render, or - arriving from another page - from the promise of them all
  // (streamed, see the homepage's load); worked out again only when that or the category changes, so the slider
  // isn't sent a new promise on every update
  let from = null;
  let slug = null;
  let preloaded = null;
  $: if ($page.data.sliders !== from || element.slug !== slug) pick($page.data.sliders, element.slug);
  function pick(sliders, s) {
    from = sliders;
    slug = s;
    preloaded = typeof sliders?.then === 'function' ? sliders.then((all) => all?.[s] ?? null) : (sliders?.[s] ?? null);
  }
</script>

<CategorySlider limit={4} slug={element.slug} {preloaded} />
