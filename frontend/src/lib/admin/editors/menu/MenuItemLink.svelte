<script>
  import api from '$/api';
  import Input from '@c/Input.svelte';

  export let item;
  export let categories;

  let url = item.url;
  let last = item.url;

  let errorInvalidURL = false;

  function getPathnameInfo(pathname) {
    // /admin/produkty/slug/...  -> [slug, "product"]
    // /produkty/slug/...        -> [slug, "product"]
    // /admin/kategorie/slug/... -> [slug, "category"]
    // /kategorie/slug/...       -> [slug, "category"]
    // /admin/strony/slug/...    -> [slug, "page"]
    // /slug/...                 -> [slug, "?"]
    if (pathname.startsWith('/admin/produkty/')) {
      return [pathname.split('/')[3], 'product'];
    } else if (pathname.startsWith('/produkty/')) {
      return [pathname.split('/')[2], 'product'];
    } else if (pathname.startsWith('/admin/kategorie/')) {
      return [pathname.split('/')[3], 'category'];
    } else if (pathname.startsWith('/kategorie/')) {
      return [pathname.split('/')[2], 'category'];
    } else if (pathname.startsWith('/admin/strony/')) {
      return [pathname.split('/')[3], 'page'];
    } else {
      return [pathname.split('/')[1], '?'];
    }
  }

  let lookup = true;
  async function parseURL(url) {
    if (!lookup) return;
    if (last == url) return;
    last = url;
    // reset
    item.product = null;
    item.category = null;
    item.page = null;
    item.url = null;
    // parse
    try {
      lookup = false;
      const pathname = new URL(url).pathname;
      const [slug, type] = getPathnameInfo(pathname);

      const options = { fields: ['id', 'slug', 'name'], filter: { slug: { _eq: slug } } };
      if (slug && type == 'product') {
        const products = (await api.items('products').readByQuery(options)).data;
        item.product = products.length ? products[0] : null;
      } else if (slug && type == 'category') {
        const c = categories.find(c => c.slug == slug);
        item.category = c ? { id: c.id, slug: c.slug, name: c.name } : null; // get only needed fields
      } else if (slug && (type == 'page' || type == '?')) {
        const pages = (await api.items('pages').readByQuery(options)).data;
        item.page = pages.length ? pages[0] : null;
      }

      if (item.product == null && item.category == null && item.page == null) {
        item.url = url;
      }

      errorInvalidURL = null;
    } catch (e) {
      if (e.message == `Failed to construct 'URL': Invalid URL`) {
        errorInvalidURL = 'Niepoprawny link';
      } else {
        errorInvalidURL = e.message;
      }
    } finally {
      lookup = true;
    }
  }

  $: categories && parseURL(url);
</script>

<Input bind:value={url} error={errorInvalidURL}>Link</Input>
