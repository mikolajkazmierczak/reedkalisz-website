import { getISODate } from 'reedkalisz-shared/datetime.js';
import { slugify } from 'reedkalisz-shared/utils.js';
import { Api } from '../base.js';
import { mergePositions, parseItems, printPosition } from '../common.js';
import { TIMEOUT, timeout, xmlToJson } from '../utils.js';
import { parsePrice } from './EasyGifts.js';

// One xml of everything (Lecce Pen, b1pen, thINKme, Enote, BAG&FLY): products with their colours, product photos
// (into the gallery) and print positions. It refuses calls made too often, for far longer than the 10 minutes it
// claims (up to hours); a refused call may restart the wait.

const list = (x) => [x].flat().filter((v) => v != null && v !== '');
const text = (v) => (typeof v === 'string' ? v.trim() : '');

// a bare '&' outside the CDATA ('<brand>BAG&FLY</brand>') makes the xml invalid
const escapeAmpersands = (xml) =>
  xml
    .split(/(<!\[CDATA\[[\s\S]*?\]\]>)/)
    .map((part, i) => (i % 2 ? part : part.replace(/&(?![a-z]+;|#\d+;|#x[0-9a-f]+;)/gi, '&amp;')))
    .join('');

// '120S..', '19700/..' -> '120S', '19700': the dots stand for the colour; inside a code ('191R..01W') they stay, as
// '191R..01W' and '191R01..W' are two products
const productCode = (code) => text(code).replace(/[/._-]*\.\.$/, '');

function parseStock(data) {
  // <dataVariants><amount-stock>101</amount-stock></dataVariants>, or per refill / paper (amount-blue, amount-black,
  // amount-lined, ...): all of them together; none given -> ask
  const amounts = Object.values(data ?? {})
    .map(Number)
    .filter(Number.isFinite);
  return amounts.length ? amounts.reduce((sum, a) => sum + a, 0) : null;
}

function parseCategories(categories) {
  // 'Produkty->długopisy reklamowe->ekologiczne' -> ['długopisy reklamowe', 'ekologiczne'] (every one is in Produkty)
  return list(categories?.category).map((c) => {
    const path = text(c?.pl)
      .split('->')
      .map((name) => name.trim());
    return path[0] === 'Produkty' ? path.slice(1) : path;
  });
}

function parseServices(services) {
  // <service><service>Klips</service><marking>Tampodruk</marking><value>5 x 32</value><unit>mm</unit></service>
  return mergePositions(
    list(services?.service).map((s) =>
      printPosition([text(s?.marking?.pl)], s?.service?.pl, `${text(s?.value)} ${text(s?.unit?.pl)}`),
    ),
  );
}

// their HTML spells letters and marks as entities ('gł&oacute;wnego'), which the meta description and the PDF card
// don't read: those become characters (the ones HTML needs, like &amp;, stay)
const CHARACTERS = {
  oacute: 'ó',
  Oacute: 'Ó',
  ndash: '–',
  mdash: '—',
  bdquo: '„',
  ldquo: '“',
  rdquo: '”',
  lsquo: '‘',
  rsquo: '’',
  hellip: '…',
  deg: '°',
  trade: '™',
  reg: '®',
  copy: '©',
  times: '×',
};
const characters = (html) => html.replace(/&([a-z]+);/gi, (entity, name) => CHARACTERS[name] ?? entity);
// a name is text, not HTML - but some are written as HTML too ('Twin Mix&amp;Match')
const MARKUP = { amp: '&', quot: '"', lt: '<', gt: '>', apos: "'" };
const plain = (v) => characters(text(v)).replace(/&(amp|quot|lt|gt|apos);/g, (_, name) => MARKUP[name]);

function parseDescription($) {
  // the product's, then its specification (what it's made of, its size) when that says something more
  const description = characters(text($?.description?.pl));
  const specification = characters(text($?.descriptionSpecification?.pl));
  const words = (html) =>
    html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  if (!specification || words(description).includes(words(specification))) return description;
  return description ? `${description}\n${specification}` : specification;
}

function parse(company, xml) {
  const products = list(xmlToJson(escapeAmpersands(xml)).import?.products?.product);

  // a colour's code is unique at the supplier - but a few are in more than one product ('605R01W' in FORTE Recycled
  // and FORTE Recycled Monocolor, 'Battery' in three): those get their product's code in front
  const seen = new Map();
  for (const $ of products)
    for (const v of list($?.variants?.variant)) seen.set(text(v?.name), (seen.get(text(v?.name)) ?? 0) + 1);

  return parseItems(
    products.flatMap(($) => {
      const code = productCode($?.code);
      const name = plain($?.name?.pl);
      const description = parseDescription($);
      const price = parsePrice(company, String($?.price ?? ''), true) || null; // 0 is no price
      const product = {
        _incompatible: !code,
        name,
        code,
        slug: slugify([code, name], { key: true }),
        seo_title: name,
        seo_description: description,
        description,
        size_x: null,
        size_y: null,
        size_z: null,
        materials: [],
        price,
        gallery: [...new Set(list([$?.photos?.main, $?.photos?.additional].flat()).map(text).filter(Boolean))],
        _categories: parseCategories($?.categories),
        _labelings: parseServices($?.services),
      };
      const variants = list($?.variants?.variant);
      // a product without colours is one variant, its photos in the gallery
      if (!variants.length) return [{ ...product, _storage: { img: [], amount: null, api_color_code: code } }];
      return variants.map((v) => {
        const variantCode = text(v?.name);
        const color = plain(v?.colorName?.pl);
        return {
          ...product,
          _storage: {
            img: list(text(v?.img?.main)), // (their `small` is a narrow cut-out for picking the colour)
            amount: parseStock(v?.dataVariants),
            api_color_code: seen.get(variantCode) > 1 ? `${code}/${variantCode}` : variantCode,
            api_color_id: null,
            multicolored: color.toLowerCase() === 'multikolor',
            color_first: color || null,
          },
        };
      });
    }),
  );
}

export class HappyBrands extends Api {
  fetch = async ({ company, env: { login, token } }) => {
    const res = await fetch(`https://happybrands.promo/webservice/products/${login}/${token}`, {
      signal: timeout(TIMEOUT.feed),
    });
    const body = await res.text();
    if (!res.ok || !body.trimStart().startsWith('<')) {
      // a refusal comes as json: { status: 21, message: 'Request made too often.' }
      let refusal = null;
      try {
        refusal = JSON.parse(body);
      } catch {}
      if (refusal?.status === 21) {
        const err = new Error(
          'HappyBrands chwilowo nie pozwala skanować. Spróbuj ponownie później, nawet za kilka godzin.',
        );
        err.notice = true;
        throw err;
      }
      throw new Error(`HappyBrands: ${refusal?.message ?? `${res.status} ${body.slice(0, 200)}`}`);
    }
    return { items: parse(company, body), lastScan: getISODate() };
  };
}
