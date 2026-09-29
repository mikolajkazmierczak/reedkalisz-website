<script context="module">
  // The companies' favicons, from their websites (REED's is the website's own). Edited to read at text size:
  // EasyGifts' is the "E" of its icon, USBSystem's its "usb" without the stick, Macma's the "M" of its logo and
  // Promotionway's its slash, the last two redrawn as vectors from 16px icons.
  const files = {
    AXPOL: 'AXPOL.png',
    BlueCollection: 'BlueCollection.png',
    DreamPen: 'DreamPen.png',
    EasyGifts: 'EasyGifts.png',
    HappyBrands: 'HappyBrands.png',
    Macma: 'Macma.svg',
    MidOcean: 'MidOcean.png',
    PAR: 'PAR.png',
    Promotionway: 'Promotionway.svg',
    REED: 'REED.png',
    USBSystem: 'USBSystem.png',
    Viva: 'Viva.png',
  };

  // a company's (or its name's) favicon, null for one without
  export const companyIcon = (company) => {
    const name = typeof company === 'string' ? company : company?.name;
    return files[name] ? `/companies/${files[name]}` : null;
  };
</script>

<script>
  // A company's favicon, as big as the text
  export let company; // the company, or its name

  $: src = companyIcon(company);
</script>

{#if src}<img class="company-icon" {src} alt="" />{/if}

<style>
  .company-icon {
    flex: none;
    display: inline-block;
    vertical-align: middle;
    width: 1em;
    height: 1em;
    object-fit: contain;
  }
</style>
