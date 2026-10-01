import { marked } from 'marked';
import qrEnc from 'pdfmake/js/qrEnc.js';
import { makeTree, treeGetItemsFromPath } from '%/utils';
import { parseAmount, AMOUNT, NONE } from '$/storage';
import { NEUTRAL_QUARTERS, NO_COLOR_LINE, WOOD_RINGS } from '$/colors';
import { parseColor, plural } from '#/utils';
import { business, SITE } from '#/seo';
import { deepestCategory } from '#/products/product';

// The product report as a pdfmake document: what the product page shows (its data read the page's way, see
// report.js), laid out for A4 in the website's colours and type. No browser in here, so it can be tried in Node.

// the website's colours (ui-website.css); a PDF has no alpha borders, so --border is its colour over white
const c = {
  ink: '#111110',
  ink600: '#47443f',
  ink500: '#55524d',
  ink400: '#78746d',
  paper2: '#f4f3f0',
  border: '#dededd',
  red: '#bf0417',
  redDeep: '#8c020f',
  redTint: '#fbeff0',
  navy: '#1b2f4e',
  purple: '#5b2a86',
  orange: '#c2560b',
  orangeLight: '#ffa45e',
  green: '#166534',
};

// static instances of Bricolage Grotesque (static/fonts/pdf): a PDF can't be trusted with a variable font's axes
export const fonts = {
  Bricolage: {
    normal: 'BricolageGrotesque-Regular.ttf',
    bold: 'BricolageGrotesque-Bold.ttf',
    italics: 'BricolageGrotesque-Regular.ttf',
    bolditalics: 'BricolageGrotesque-Bold.ttf',
  },
  BricolageSemi: {
    normal: 'BricolageGrotesque-SemiBold.ttf',
    bold: 'BricolageGrotesque-Bold.ttf',
    italics: 'BricolageGrotesque-SemiBold.ttf',
    bolditalics: 'BricolageGrotesque-Bold.ttf',
  },
  // what the card is ("KARTA PRODUKTU"), heavier than bold
  BricolageHeavy: {
    normal: 'BricolageGrotesque-ExtraBold.ttf',
    bold: 'BricolageGrotesque-ExtraBold.ttf',
    italics: 'BricolageGrotesque-ExtraBold.ttf',
    bolditalics: 'BricolageGrotesque-ExtraBold.ttf',
  },
  // the big title: the display cut (opsz 72 at 700, as the page's optical sizing picks it at that size)
  BricolageDisplay: {
    normal: 'BricolageGrotesque-Display.ttf',
    bold: 'BricolageGrotesque-Display.ttf',
    italics: 'BricolageGrotesque-Display.ttf',
    bolditalics: 'BricolageGrotesque-Display.ttf',
  },
};

const PAGE_W = 595.28; // A4, pt
const MARGIN = 40;
const WIDTH = PAGE_W - 2 * MARGIN;
const TOP = 52; // the pages' top margin: room for the header (from the second page) and its rule
const LOGO = 85.04 / 184.252; // the logo's height to its width
const PRICE_COLUMNS = 12; // more quantities than fit across go on in another table, split evenly

/** Everything the report shows, from the product as the page reads it and all categories. */
function derive(product, categories) {
  const storage = product.storage ?? [];
  const variants = storage.filter((s) => s.enabled);
  const shown = (imgs) => (imgs ?? []).filter((i) => i?.img && i.enabled !== false);

  // as the page's gallery (the gallery, then the enabled variants' photos meant for it), a variant's first one only:
  // the four that fit shouldn't be one colour from a few sides
  const gallery = shown([
    ...(product.gallery ?? []),
    ...variants.map((s) => shown(s.img.filter((i) => i.show_in_gallery))[0]),
  ]);

  const customPrices = (product.custom_prices ?? []).some((p) => p.enabled);
  const labelings = (product.labelings ?? []).filter((l) => l.enabled && l.prices.some((p) => p.enabled));
  // the lowest price, and whether it includes marking (labeling prices always do, custom ones when flagged)
  const from = [
    ...[...(product.custom_prices ?? []), ...(product.custom_prices_sale ?? [])].map((p) => [
      p,
      !!product.custom_prices_with_labeling,
    ]),
    ...(product.labelings ?? [])
      .filter((l) => l.enabled)
      .flatMap((l) => [...l.prices, ...l.prices_sale].map((p) => [p, true])),
  ]
    .filter(([p]) => p.enabled && p.price)
    .sort(([a], [b]) => a.price - b.price)[0];

  const tree = makeTree((categories ?? []).filter((c) => c.enabled));
  const deepest = deepestCategory(product.categories, tree);
  const trail = deepest ? treeGetItemsFromPath(tree, deepest._meta.path).map((c) => c.name) : [];

  return {
    photos: gallery.slice(0, 4),
    variants: variants.map((s) => ({ ...s, photo: shown(s.img)[0] ?? null })),
    customPrices,
    labelings,
    from: from ? { price: from[0].price, withLabeling: from[1] } : null,
    trail,
    url: `${SITE}/produkty/${product.slug}`,
  };
}

/** The images the report needs: `large` for a photo shown alone, `small` for the rest. */
export function reportImages(product) {
  const { photos, variants } = derive(product, []);
  // a variant's photo is often a gallery one too: each file once, `large` if it's that
  const sizes = new Map(photos.map((i) => [i.img, photos.length === 1 ? 'large' : 'small']));
  for (const v of variants) if (v.photo && !sizes.has(v.photo.img)) sizes.set(v.photo.img, 'small');
  return [...sizes].map(([id, size]) => ({ id, size }));
}

// --- small drawings (svg: pdfmake draws it as vectors) ------------------------------------------------------------

// A colour dot, as the website's Color: a flat fill, two colours split on the diagonal (the second one below it),
// multicolour's four quarters (neutral's too, in its pastels), wood's end-grain rings, a see-through tint over a
// checkerboard; a ring of a darker shade over it.
let clips = 0; // the clip paths' ids (a page has many swatches)
function swatch(first, second, x, y, d) {
  const { bg, fg, multicolor } = parseColor(first, second);
  const r = d / 2;
  const cx = x + r;
  const cy = y + r;
  const at = (deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
  // a slice from one angle to another, clockwise (0 is right, 90 down)
  const slice = (from, to, fill, opacity = 1) => {
    const [x1, y1] = at(from);
    const [x2, y2] = at(to);
    return `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2} Z" fill="${fill}" fill-opacity="${opacity}"/>`;
  };
  const disc = (color) => {
    if (color.neutral) return NEUTRAL_QUARTERS.map((fill, i) => slice(-45 + i * 90, 45 + i * 90, fill)).join('');
    if (color.wood) {
      // the rings round the middle (the website's are off centre: a clip the card's svg can't be sure of)
      return (
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${WOOD_RINGS.light}"/>` +
        [0.72, 0.42, 0.14]
          .map(
            (f) =>
              `<circle cx="${cx}" cy="${cy}" r="${r * f}" fill="none" stroke="${WOOD_RINGS.dark}" stroke-width="${r * 0.12}"/>`,
          )
          .join('')
      );
    }
    if (color.transparent) {
      const tint = color.color || '#ffffff';
      return (
        [0, 90, 180, 270].map((a, i) => slice(a, a + 90, i % 2 ? '#ffffff' : '#d6d6d6')).join('') +
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${tint}" fill-opacity="0.45"/>`
      );
    }
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color.color || '#ffffff'}"/>`;
  };

  let paint;
  if (multicolor) {
    // the website's conic-gradient from 45deg: magenta right, black below, yellow left, blue on top
    paint = ['#e5097f', '#2b2a29', '#ffed00', '#00a0e3']
      .map((fill, i) => slice(-45 + i * 90, 45 + i * 90, fill))
      .join('');
  } else if (bg) {
    paint = disc(bg);
    // the second colour - its whole disc, wood and neutral too - in the half below the rising diagonal
    if (fg) {
      const id = `half${clips++}`;
      const [x1, y1] = at(-45);
      const [x2, y2] = at(135);
      paint +=
        `<clipPath id="${id}"><path d="M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2} Z"/></clipPath>` +
        `<g clip-path="url(#${id})">${disc(fg)}</g>`;
    }
  } else {
    // no colour: white, crossed out from edge to edge, as on the website
    const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = [45, 225, 135, 315].map(at);
    paint =
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff"/>` +
      `<path d="M${x1},${y1} L${x2},${y2} M${x3},${y3} L${x4},${y4}" stroke="${NO_COLOR_LINE}" stroke-width="0.6"/>`;
  }
  return (
    paint +
    `<circle cx="${cx}" cy="${cy}" r="${r - 0.3}" fill="none" stroke="#000000" stroke-opacity="0.2" stroke-width="0.6"/>`
  );
}

// A QR code exactly `size` wide, as vectors: pdfmake's own `qr` rounds its squares to whole points, so it comes out
// smaller than asked. Its encoder, at a big size (whole numbers), drawn as runs of squares along each row.
function qr(text, size, color) {
  const { measure } = qrEnc.measure ? qrEnc : qrEnc.default;
  const node = measure({ qr: text, fit: 1000 });
  const [, ...squares] = node._canvas; // (the first is the background)
  const runs = [];
  for (const { x, y, w } of squares) {
    const last = runs[runs.length - 1];
    if (last && last.y === y && last.x + last.w === x) last.w += w;
    else runs.push({ x, y, w, h: w });
  }
  const body = runs.map(({ x, y, w, h }) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('');
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${node._width} ${node._width}" fill="${color}">${body}</svg>`,
    width: size,
    height: size,
  };
}

const svgOf = (width, height, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;

// the page's line icons (Prices.svelte, IncludesLabeling.svelte), on a 24 grid
const icons = {
  check: '<path d="m5 12.5 4.5 4.5L19 7.5" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  field:
    '<path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  place:
    '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" stroke-width="1.9" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.4" stroke-width="1.9"/>',
};
const icon = (name, color, size) => ({
  svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}">${icons[name]}</svg>`,
  width: size,
  height: size,
});

const rule = (lineWidth = 2, color = c.ink) => ({
  canvas: [{ type: 'line', x1: 0, y1: 0, x2: WIDTH, y2: 0, lineWidth, lineColor: color }],
});
const hairline = (margin) => ({ ...rule(0.75, c.border), margin });

// --- the description (markdown, sometimes with a little HTML) ----------------------------------------------------

const ENTITIES = { nbsp: '\u00a0', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const decode = (text) =>
  text.replace(/&(#?\w+);/g, (m, e) =>
    e.startsWith('#') ? String.fromCodePoint(Number(e.slice(1).replace(/^x/i, '0x'))) : (ENTITIES[e] ?? m),
  );

// an HTML chunk as text: its breaks and list items kept as lines
const htmlText = (html) =>
  decode(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li[^>]*>/gi, '\n• ')
      .replace(/<\/(p|div|li|ul|ol|h\d)>/gi, '\n')
      .replace(/<[^>]*>/g, ''),
  )
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

const TAGS = { b: 'bold', strong: 'bold', i: 'italics', em: 'italics', small: 'small' };

/** Markdown as pdfmake blocks: paragraphs, lists, headings and rules; bold, links and `<small>` kept. */
function markdown(source) {
  const state = {}; // open inline HTML tags (a <small> can span paragraphs)
  const style = (extra = {}) => {
    const s = { ...extra };
    if (state.bold) s.bold = true;
    if (state.italics) s.italics = true;
    if (state.small) s.fontSize = 7.5;
    return s;
  };
  // a tag toggles its style; -> whether it was one
  const toggle = (html) => {
    const m = html.trim().match(/^<(\/?)(\w+)[^>]*>$/);
    if (!m || !TAGS[m[2].toLowerCase()]) return false;
    state[TAGS[m[2].toLowerCase()]] = !m[1];
    return true;
  };

  const inline = (tokens, extra = {}) =>
    (tokens ?? []).flatMap((t) => {
      switch (t.type) {
        case 'strong':
          return inline(t.tokens, { ...extra, bold: true });
        case 'em':
          return inline(t.tokens, { ...extra, italics: true });
        case 'del':
          return inline(t.tokens, { ...extra, decoration: 'lineThrough' });
        case 'link':
          return inline(t.tokens, { ...extra, link: t.href, color: c.red, decoration: 'underline' });
        case 'br':
          return [{ text: '\n' }];
        case 'html':
          if (/^<br\s*\/?>$/i.test(t.text.trim())) return [{ text: '\n' }];
          if (toggle(t.text)) return [];
          return [{ text: decode(t.text.replace(/<[^>]*>/g, '')), ...style(extra) }];
        default:
          if (t.tokens) return inline(t.tokens, extra);
          // as HTML shows it: a line break in a paragraph and runs of spaces are one space
          return [{ text: decode(t.text ?? t.raw ?? '').replace(/[ \t\r\n]+/g, ' '), ...style(extra) }];
      }
    });

  const block = (t) => {
    switch (t.type) {
      case 'paragraph':
        return { text: inline(t.tokens), margin: [0, 0, 0, 6] };
      case 'text': // a tight list item's
        return { text: inline(t.tokens ?? [{ type: 'text', text: t.text }]) };
      case 'heading':
        return {
          text: inline(t.tokens),
          bold: true,
          color: c.ink,
          fontSize: t.depth <= 2 ? 12 : 10.5,
          margin: [0, 4, 0, 4],
        };
      case 'list': {
        const items = t.items.map((item) => ({ stack: item.tokens.map(block).filter(Boolean), margin: [0, 0, 0, 2] }));
        return { [t.ordered ? 'ol' : 'ul']: items, margin: [0, 0, 0, 6], markerColor: c.ink400 };
      }
      case 'blockquote':
        return { stack: t.tokens.map(block).filter(Boolean), italics: true, margin: [10, 0, 0, 6] };
      case 'hr':
        return hairline([0, 4, 0, 8]);
      case 'html': {
        // a lone <small> / </small> opens or closes; anything else is its text, after which its tags still apply
        const parts = t.text.split(/(<\/?\w+[^>]*>)/).filter((p) => p.trim());
        if (parts.every(toggle)) return null;
        const out = { stack: htmlText(t.text).map((line) => ({ text: line, ...style(), margin: [0, 0, 0, 4] })) };
        parts.forEach(toggle);
        return out;
      }
      case 'table':
        return {
          stack: t.rows.map((row) => ({ text: row.map((cell) => cell.text).join(' · '), ...style() })),
          margin: [0, 0, 0, 6],
        };
      default:
        return null; // space, code
    }
  };

  // a paragraph opened inside <small> stays small (block html toggles between them, and styles its own lines)
  return marked.lexer(source ?? '').flatMap((t) => {
    const b = block(t);
    return b ? [state.small && !b.fontSize && t.type !== 'html' ? { ...b, fontSize: 7.5 } : b] : [];
  });
}

// --- the parts --------------------------------------------------------------------------------------------------

const label = (text) => ({ text: text.toUpperCase(), style: 'label' });

// a section's title over the website's rule, kept on a page with its first block
function section(text, blocks, { margin = [0, 22, 0, 0], id } = {}) {
  const [first, ...rest] = blocks;
  const head = [{ text, style: 'h2', id }, { ...rule(), margin: [0, 4, 0, 10] }, ...(first ? [first] : [])];
  return { stack: [{ stack: head, unbreakable: true }, ...rest], margin };
}

function pill(text, color, fill, border = fill) {
  return {
    table: { body: [[{ text: text.toUpperCase(), color, fillColor: fill }]] },
    layout: {
      hLineWidth: () => 0.75,
      vLineWidth: () => 0.75,
      hLineColor: () => border,
      vLineColor: () => border,
      paddingLeft: () => 4,
      paddingRight: () => 4,
      paddingTop: () => 1.5,
      paddingBottom: () => 0.5,
    },
    fontSize: 6,
    font: 'BricolageSemi',
    characterSpacing: 0.6,
    width: 'auto',
  };
}

function badges(product) {
  // the page's Badges, in its order and colours
  const list = [
    product.out_of_stock && pill('Brak', '#ffffff', c.ink600),
    product.sale && pill('Promocja', '#ffffff', c.orange),
    product.new && pill('Nowość', '#ffffff', c.purple),
    product.bestseller && pill('Bestseller', '#ffffff', c.navy),
    product.coming_soon && pill('Wkrótce', c.ink, '#ffffff', c.ink),
  ].filter(Boolean);
  return list.length ? { columns: list, columnGap: 3, margin: [0, 0, 0, 8] } : null;
}

// the photos a report has, framed, each whole in the middle of its frame (a little in from it); an image that
// didn't load leaves an empty frame
function framed(id, images, width, height) {
  const data = images[id];
  const inset = 6;
  return {
    table: {
      widths: [width],
      heights: [height],
      body: [
        [
          data
            ? {
                image: data,
                fit: [width - 2 * inset, height - 2 * inset],
                alignment: 'center',
                verticalAlignment: 'middle',
              }
            : { text: '' },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0.75,
      vLineWidth: () => 0.75,
      hLineColor: () => c.border,
      vLineColor: () => c.border,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
  };
}

// the gallery: one photo alone, more two to a row - four at most
function media(d, images) {
  const W = 236;
  const gap = 6;
  if (d.photos.length === 1) return { width: W + 1.5, stack: [framed(d.photos[0].img, images, W, W)] };
  const tile = (W + 1.5 - gap) / 2 - 1.5; // two frames (and their borders) as wide as one
  const rows = [];
  for (let i = 0; i < d.photos.length; i += 2) {
    rows.push({
      columns: d.photos.slice(i, i + 2).map((p) => ({ width: tile + 1.5, stack: [framed(p.img, images, tile, tile)] })),
      columnGap: gap,
      margin: [0, i ? gap : 0, 0, 0],
    });
  }
  return { width: W + 1.5, stack: rows };
}

function colorsRow(variants, width) {
  const d = 10;
  const gap = 4;
  const perRow = Math.max(1, Math.floor((width + gap) / (d + gap)));
  const rows = Math.ceil(variants.length / perRow);
  const w = Math.min(variants.length, perRow) * (d + gap) - gap;
  const h = rows * (d + gap) - gap;
  const body = variants
    .map((v, i) =>
      swatch(v.color_first, v.color_second, (i % perRow) * (d + gap), Math.floor(i / perRow) * (d + gap), d),
    )
    .join('');
  return { svg: svgOf(w, h, body), width: w, height: h };
}

function summary(product, d) {
  const size = [product.size_x, product.size_y, product.size_z].filter((s) => s).join(' x ') + 'mm';
  const specs = [
    (product.size_x || product.size_y || product.size_z) && ['Rozmiar', size],
    product.materials?.length && ['Materiał', product.materials.join(', ')],
  ].filter(Boolean);

  const n = d.variants.length;
  return [
    badges(product),
    { text: product.name.replace(/[ \t\r\n]+/g, ' '), style: 'h1' },
    { text: product.code, style: 'code', margin: [0, 5, 0, 0] },
    d.from && {
      text: [
        { text: 'od  ', color: c.ink400, fontSize: 9 },
        {
          text: `${d.from.price.toFixed(2)} zł`,
          font: 'BricolageDisplay',
          color: c.red,
          fontSize: 22,
          characterSpacing: -0.6,
        },
        { text: '  / szt', color: c.ink400, fontSize: 9 },
        d.from.withLabeling ? { text: '  ze znakowaniem', color: c.red, bold: true, fontSize: 9 } : '',
      ],
      margin: [0, 10, 0, 0],
    },
    // as the page's: a link to the Cennik
    d.from &&
      (d.customPrices || d.labelings.length) && {
        text: 'Pełny cennik według nakładu ↓',
        linkToDestination: 'cennik',
        color: c.ink500,
        font: 'BricolageSemi',
        fontSize: 7.5,
        decoration: 'underline',
        margin: [0, 2, 0, 0],
      },
    n && {
      columns: [
        colorsRow(d.variants, 180),
        { text: `${n} ${plural(n, ['kolor', 'kolory', 'kolorów'])}`, color: c.ink400, fontSize: 7.5, width: '*' },
      ],
      columnGap: 8,
      margin: [0, 10, 0, 0],
    },
    specs.length && {
      table: {
        widths: [62, '*'],
        body: specs.map(([k, v]) => [
          { text: k, color: c.ink400 },
          { text: v, font: 'BricolageSemi' },
        ]),
      },
      layout: {
        hLineWidth: () => 0.75,
        vLineWidth: () => 0,
        hLineColor: () => c.border,
        paddingLeft: () => 0,
        paddingRight: () => 8,
        paddingTop: () => 4,
        paddingBottom: () => 4,
      },
      fontSize: 8.5,
      margin: [0, 12, 0, 0],
    },
    product.enabled === false && {
      text: 'Produkt jest ukryty: jego strona nie jest jeszcze publiczna.',
      color: c.ink500,
      fontSize: 7,
      margin: [0, 12, 0, 0],
    },
  ].filter(Boolean);
}

// (a new one each time: pdfmake writes its layout into the nodes it's given)
const includesLabeling = () => ({
  table: {
    body: [
      [
        {
          columns: [
            { ...icon('check', c.red, 7), margin: [0, 1, 0, 0] },
            { text: 'Ceny zawierają znakowanie', width: 'auto' },
          ],
          columnGap: 3,
          fillColor: c.redTint,
        },
      ],
    ],
  },
  layout: {
    hLineWidth: () => 0,
    vLineWidth: () => 0,
    paddingLeft: () => 6,
    paddingRight: () => 6,
    paddingTop: () => 2,
    paddingBottom: () => 1.5,
  },
  color: c.redDeep,
  bold: true,
  fontSize: 7.5,
  width: 'auto',
});

// "Pole znakowania" and "Miejsce znakowania" (Prices.svelte)
function labelingMeta(field, place) {
  const items = [
    field[0] && field[1] && ['field', 'Pole znakowania: ', `${field[0]}×${field[1]} mm`],
    place && ['place', 'Miejsce znakowania: ', place],
  ].filter(Boolean);
  if (!items.length) return null;
  return {
    columns: items.map(([name, text, value]) => ({
      width: 'auto',
      columns: [
        icon(name, c.ink400, 9),
        {
          text: [
            { text, color: c.ink500 },
            { text: value, font: 'BricolageSemi', color: c.ink },
          ],
          width: 'auto',
        },
      ],
      columnGap: 3,
    })),
    columnGap: 14,
    fontSize: 8,
    margin: [0, 0, 0, 5],
  };
}

// The price ladder as PricesTable lays it across: quantities over prices, a sale price over the struck-out one.
// A long one continues in another table below.
function priceTable(prices, pricesSale, withLabeling) {
  const tables = [];
  const per = Math.ceil(prices.length / Math.ceil(prices.length / PRICE_COLUMNS));
  for (let start = 0; start < prices.length; start += per) {
    const part = prices.slice(start, start + per);
    const head = { text: 'PLN / szt.', color: c.ink400, font: 'BricolageSemi', fontSize: 7 };
    tables.push({
      table: {
        widths: [60, ...part.map(() => '*')],
        body: [
          [
            { text: 'Ilość', color: c.ink400, font: 'BricolageSemi', fontSize: 7 },
            ...part.map((p) => ({ text: String(p.amount ?? '-'), font: 'BricolageSemi' })),
          ],
          [
            withLabeling ? { stack: [head, { text: 'ze znakowaniem', color: c.red, bold: true, fontSize: 6 }] } : head,
            ...part.map(({ price }, i) => {
              const sale = pricesSale[start + i]?.price;
              if (!sale) return { text: price?.toFixed(2) ?? '-', bold: true };
              return {
                stack: [
                  { text: sale.toFixed(2), bold: true, color: c.red },
                  { text: price?.toFixed(2) ?? '-', decoration: 'lineThrough', color: c.ink400, fontSize: 7 },
                ],
              };
            }),
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0.75,
        vLineWidth: () => 0.75,
        hLineColor: () => c.border,
        vLineColor: () => c.border,
        fillColor: (row, node, col) => (row === 0 || col === 0 ? c.paper2 : null),
        paddingLeft: (col) => (col === 0 ? 6 : 4),
        paddingRight: (col) => (col === 0 ? 6 : 5),
        paddingTop: (row) => (row === 0 ? 3 : 5),
        paddingBottom: (row) => (row === 0 ? 2 : 4),
      },
      alignment: 'right',
      fontSize: 8.5,
      margin: [0, 0, 0, 4],
    });
  }
  // the label column reads from the left
  for (const t of tables) for (const row of t.table.body) row[0] = { ...row[0], alignment: 'left' };
  return tables;
}

function pricing(product, d) {
  const blocks = [];
  if (d.customPrices) {
    blocks.push({
      stack: [
        product.custom_prices_with_labeling ? { columns: [includesLabeling()], margin: [0, 0, 0, 6] } : null,
        labelingMeta([product.labeling_field_x, product.labeling_field_y], product.labeling_place),
        ...priceTable(
          product.custom_prices.filter((p) => p.enabled),
          (product.custom_prices_sale ?? []).filter((p) => p.enabled),
          !!product.custom_prices_with_labeling,
        ),
      ].filter(Boolean),
      unbreakable: true,
    });
  }
  for (const l of d.labelings) {
    const { code, type, name } = l.labeling ?? {};
    blocks.push({
      stack: [
        {
          columns: [
            {
              text: [
                { text: name ?? '', bold: true, fontSize: 11 },
                code ? { text: `   ${code}`, style: 'code', fontSize: 7.5 } : '',
                type
                  ? {
                      text: `   ${type.toUpperCase()}`,
                      color: c.ink400,
                      bold: true,
                      fontSize: 7,
                      characterSpacing: 0.4,
                    }
                  : '',
              ],
              width: '*',
            },
            includesLabeling(),
          ],
          columnGap: 10,
          margin: [0, 0, 0, 5],
        },
        labelingMeta([l.labeling_field_x, l.labeling_field_y], l.labeling_place),
        ...priceTable(
          l.prices.filter((p) => p.enabled),
          l.prices_sale.filter((p) => p.enabled),
          true,
        ),
      ].filter(Boolean),
      unbreakable: true,
    });
  }
  // (apart by a margin above: one below the last can push an empty page)
  blocks.forEach((b, i) => (b.margin = [0, i ? 14 : 0, 0, 0]));
  return blocks;
}

// a card per colour (Storage.svelte): swatch, code and colour on two lines, availability, a photo
function variantCard(v, code, images, width, withPhotos) {
  const state = parseAmount({ available: v.available, amount: v.amount });
  const first = (v.color_first ?? v.color_second)?.name ?? '';
  const second = v.color_first && v.color_second ? `/\u00a0${v.color_second.name}` : ' ';
  const photoH = 58;
  const photo = v.photo && images[v.photo.img];
  return {
    width,
    table: {
      widths: [width - 1.5 - 12], // less its borders and padding
      heights: [0, 0, withPhotos ? photoH + 8 : 0],
      body: [
        [
          {
            columns: [
              { svg: svgOf(11, 11, swatch(v.color_first, v.color_second, 0, 0, 11)), width: 11, margin: [0, 4, 0, 0] },
              {
                stack: [
                  { text: v.api_color_code || code, color: c.ink400, fontSize: 6.5 },
                  { text: first, bold: true, fontSize: 7.5, lineHeight: 1.1 },
                  { text: second, bold: true, fontSize: 7.5, lineHeight: 1.1 },
                ],
              },
            ],
            columnGap: 5,
          },
        ],
        [
          {
            text: [
              { text: 'Dostępność:  ', color: c.ink400 },
              state.state === AMOUNT
                ? { text: state.label }
                : { text: state.label, bold: true, fontSize: 6.5, color: state.state === NONE ? c.ink400 : c.green },
            ],
            fontSize: 7.5,
          },
        ],
        ...(withPhotos
          ? [[photo ? { image: photo, fit: [width - 12, photoH], alignment: 'center' } : { text: '' }]]
          : []),
      ],
    },
    layout: {
      hLineWidth: (i, node) => (i === 0 || i === node.table.body.length || i === 2 ? 0.75 : 0),
      vLineWidth: () => 0.75,
      hLineColor: () => c.border,
      vLineColor: () => c.border,
      paddingLeft: () => 6,
      paddingRight: () => 6,
      paddingTop: (i) => (i === 0 ? 5 : i === 2 ? 4 : 1),
      paddingBottom: (i) => (i === 1 ? 5 : i === 2 ? 4 : 0),
    },
  };
}

function variants(product, d, images) {
  const perRow = 5;
  const gap = 6;
  const width = (WIDTH - (perRow - 1) * gap) / perRow;
  // a row of photos only when there's one: no empty frames
  const withPhotos = d.variants.some((v) => v.photo && images[v.photo.img]);
  const rows = [];
  for (let i = 0; i < d.variants.length; i += perRow) {
    const row = d.variants.slice(i, i + perRow).map((v) => variantCard(v, product.code, images, width, withPhotos));
    while (row.length < perRow) row.push({ width, text: '' });
    // (the gap above, not below: a margin after the last row can push an empty page)
    rows.push({ columns: row, columnGap: gap, margin: [0, i ? gap : 0, 0, 0], unbreakable: true });
  }
  return rows;
}

// --- the document ------------------------------------------------------------------------------------------------

/**
 * The pdfmake document of a product.
 * `product`: as the product page reads it; `categories`: all of them (the trail is made of the enabled ones);
 * `images`: data URLs (JPEG/PNG) by file id; `logo`: the logo's svg; `date`: when it's made.
 */
export function reportDocument(product, { categories, images = {}, logo, date = new Date() }) {
  const d = derive(product, categories);
  const post = product.commercial_details?.content;

  const content = [
    {
      text: [...d.trail, product.code].join('  /  ').toUpperCase(),
      style: 'label',
      margin: [0, 14, 0, 12],
    },
    {
      // no photos, no empty frame: the summary takes the width
      columns: [d.photos.length ? media(d, images) : null, { width: '*', stack: summary(product, d) }].filter(Boolean),
      columnGap: 22,
    },
  ];

  if (product.description) {
    // the page's prose: muted, airy
    const prose = markdown(product.description).map((b) => ({ color: c.ink500, lineHeight: 1.45, ...b }));
    content.push(section('Opis', prose, { margin: [0, 24, 0, 0] }));
  }
  // the paragraph (prices net or gross, what's binding), as the page has it: first in the prices, a line under it;
  // without prices, under the description, a line over it
  const note = post && { stack: markdown(post), color: c.ink500, fontSize: 7.5 };
  const prices = pricing(product, d);
  if (prices.length) {
    content.push(section('Cennik', note ? [note, hairline([0, 4, 0, 10]), ...prices] : prices, { id: 'cennik' }));
  } else if (note && product.description) {
    content.push({ stack: [hairline([0, 4, 0, 10]), note], margin: [0, 8, 0, 0] });
  }
  if (d.variants.length) content.push(section('Warianty i dostępność', variants(product, d, images)));

  const { address } = business;
  const site = SITE.replace(/^https?:\/\//, '');
  const when = date.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const logoOf = (width) => (logo ? { svg: logo, width, height: width * LOGO } : { text: '' });

  // the first page's head: logo and contact | QR and link | what this is and when; a thick rule under it
  const L = 88; // the logo's width
  const Q = L * LOGO; // the QR code: the logo's height
  const H = 58; // the row: the logo, and the contact under it
  const breakable = (text) => text.replace(/([/-])/g, '$1\u200b'); // a long url wraps after its slashes and dashes
  const head = {
    stack: [
      {
        columns: [
          {
            width: 150,
            stack: [
              logoOf(L),
              {
                // as the website's: the phone (with +48) in bold, then the email
                text: [
                  {
                    text: business.telephone,
                    link: `tel:${business.telephone.replace(/\s/g, '')}`,
                    bold: true,
                    decoration: 'underline',
                  },
                  { text: '  /  ', color: c.ink400 },
                  { text: business.email, link: `mailto:${business.email}`, decoration: 'underline' },
                ],
                color: c.orange,
                fontSize: 7.5,
                margin: [0, H - Q - 9, 0, 0],
              },
            ],
          },
          {
            width: '*',
            columns: [
              { ...qr(d.url, Q, c.ink), width: Q },
              {
                width: '*',
                stack: [
                  label('Na stronie'),
                  {
                    text: breakable(d.url.replace(/^https?:\/\//, '')),
                    link: d.url,
                    color: c.red,
                    decoration: 'underline',
                    margin: [0, 3, 0, 0],
                  },
                ],
                fontSize: 7.5,
                lineHeight: 1.25,
              },
            ],
            columnGap: 7,
          },
          {
            width: 124,
            stack: [
              { text: 'KARTA PRODUKTU', color: c.navy, font: 'BricolageHeavy', fontSize: 8.5, characterSpacing: 1 },
              { text: when, color: c.ink, fontSize: 9, margin: [0, 3, 0, 0] },
              {
                text: 'Ceny i nakład mogły ulec zmianie\nod chwili utworzenia karty',
                color: c.ink400,
                fontSize: 6.5,
                lineHeight: 1.2,
                margin: [0, 4, 0, 0],
              },
            ],
            alignment: 'right',
          },
        ],
        columnGap: 12,
      },
      { ...rule(), margin: [0, 14, 0, 0] },
    ],
    margin: [0, -12, 0, 0], // (a little higher than the next pages' text: they have a header over it)
  };
  content.unshift(head);

  // the footer: the logo, then the site, email and phone (orange, as on the website) and the address
  const contact = [
    { text: site, link: SITE, color: c.red, decoration: 'underline' },
    { text: '   ·   ' },
    { text: business.email, link: `mailto:${business.email}`, color: c.orange, decoration: 'underline' },
    { text: '   ·   ' },
    { text: 'tel. ' },
    {
      text: business.telephone,
      link: `tel:${business.telephone.replace(/\s/g, '')}`,
      color: c.orange,
      decoration: 'underline',
    },
    { text: '   ·   ' },
    { text: `${address.streetAddress}, ${address.postalCode} ${address.addressLocality}` },
  ];

  return {
    pageSize: 'A4',
    pageMargins: [MARGIN, TOP, MARGIN, 52],
    info: {
      title: `${product.code} ${product.name}`,
      author: business.name,
      subject: d.url,
      creator: business.name,
    },
    // the next ones with the product's name and the logo, over a rule
    header: (page) =>
      page === 1
        ? null
        : {
            stack: [
              {
                columns: [
                  {
                    text: [{ text: product.name, bold: true, color: c.ink }, `   ${product.code}`],
                    width: '*',
                    margin: [0, 3, 0, 0],
                  },
                  logoOf(30),
                ],
                columnGap: 10,
              },
              hairline([0, 7, 0, 0]),
            ],
            color: c.ink400,
            fontSize: 7.5,
            margin: [MARGIN, 18, MARGIN, 0],
          },
    footer: (page, pages) => ({
      stack: [
        hairline(),
        {
          columns: [
            logoOf(22),
            { text: contact, width: '*', margin: [0, 1.5, 0, 0] },
            { text: `${page} / ${pages}`, width: 'auto', font: 'BricolageSemi', color: c.ink, margin: [0, 1.5, 0, 0] },
          ],
          columnGap: 10,
          margin: [0, 6, 0, 0],
        },
      ],
      color: c.ink400,
      fontSize: 7,
      margin: [MARGIN, 16, MARGIN, 0],
    }),
    content,
    styles: {
      h1: { font: 'BricolageDisplay', fontSize: 21, lineHeight: 1.02, characterSpacing: -0.4, color: c.ink },
      h2: { bold: true, fontSize: 14, characterSpacing: -0.3, color: c.ink },
      label: { font: 'BricolageSemi', fontSize: 6.5, characterSpacing: 1, color: c.ink400 },
      code: { font: 'BricolageSemi', fontSize: 8, characterSpacing: 0.5, color: c.ink400 },
    },
    defaultStyle: { font: 'Bricolage', fontSize: 9, lineHeight: 1.3, color: c.ink },
  };
}
