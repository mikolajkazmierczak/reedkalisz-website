<script>
  const source = 'microsoft';
  const aliases = {
    unicons: {
      ok: 'check',
      add: 'plus',
      close: 'times',
      delete: 'trash-alt',
      edit: 'pen',
      filter: 'filter',
      arrow_left: 'arrow-left',
      arrow_right: 'arrow-right',
      arrow_up: 'arrow-up',
      arrow_down: 'arrow-down',
      chevron_left: 'angle-left',
      chevron_right: 'angle-right',
      chevron_up: 'angle-up',
      chevron_down: 'angle-down',
      lock: 'lock',
      // library
      img: 'image-v',
      file: 'file',
      upload: 'upload',
      // table
      hierarchy: 'list-ui-alt',
      drag: 'drag',
      eye: 'eye',
      new: 'exclamation-circle',
      sale: 'percentage',
      // nav
      dashboard: 'tachometer-fast-alt',
      products: 'box',
      colors: 'swatchbook',
      categories: 'tag-alt',
      commercial_details: 'check',
      calculator: 'calculator',
      menu: 'bars',
      pages: 'browser',
      fragments: 'file-landscape-alt',
      questions: 'envelope',
      library: 'images',
      api: 'bolt-alt',
      notifications: 'bell',
      logout: 'signout'
    },
    google: { TBD: 'TBD' },
    microsoft: {
      ok: 'checkmark',
      add: 'add',
      close: 'dismiss',
      delete: 'delete',
      edit: 'edit',
      filter: 'filter',
      arrow_left: 'arrow_left',
      arrow_right: 'arrow_right',
      arrow_up: 'arrow_up',
      arrow_down: 'arrow_down',
      chevron_left: 'chevron_left',
      chevron_right: 'chevron_right',
      chevron_up: 'chevron_up',
      chevron_down: 'chevron_down',
      lock: 'lock_closed',
      // library
      img: 'image',
      file: 'document',
      upload: 'arrow_upload',
      // table
      hierarchy: 'text_bullet_list_tree',
      order: 'drag',
      drag: 're_order_dots_vertical',
      eye: 'eye',
      new: 'add',
      sale: 'savings',
      // nav
      dashboard: 'data_usage',
      products: 'cube',
      colors: 'color',
      categories: 'tag',
      commercial_details: 'check',
      calculator: 'calculator',
      menu: 'navigation',
      pages: 'document_one_page',
      fragments: 'document_page_number',
      questions: 'chat',
      library: 'library',
      api: 'bot',
      notifications: 'alert',
      logout: 'sign_out'
    }
  };

  export let name;

  $: icon = aliases[source][name] ?? name;

  const colors = {
    dark: '#000',
    light: 'var(--light)'
  };
  const defaultColor = colors.dark;

  export let color = null;
  export let light = false;
  export let dark = false;
  export let strokeWidth = 0.3;
  $: chosenColor = color ? color : light ? colors.light : dark ? colors.dark : defaultColor;

  const defaultSize = 20;
  export let width = 20;
  export let height = 20;

  export let fill = false;

  export let style = '';

  function getSize(size, otherSize) {
    if (fill) return '100%'; // fill overwrites the size
    if (size !== defaultSize) return typeof size === 'string' ? size : size + 'px';
    return otherSize !== defaultSize ? 'auto' : defaultSize + 'px'; // if the other size is set, this one will conform
  }
</script>

{#if icon}
  <svg
    viewBox="0 0 20 20"
    stroke-width={strokeWidth}
    stroke={chosenColor}
    fill={chosenColor}
    style="width:{getSize(width, height)}; height:{getSize(height, width)}; {style}"
  >
    <use href="/icons/{source}/{icon}.svg#svg" />
  </svg>
{/if}
