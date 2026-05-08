import { slugify } from 'reedkalisz-shared/utils.js';
import { Api } from '../base.js';
import { parseItems } from '../common.js';
import { fetchSimpleApi, xmlToJson } from '../utils.js';
import { parseSize } from './EasyGifts.js';

function fixXml(xml) {
  return xml.replace(/(<image_url>[^<]*<\/image_url>)([^<]+)(?=<)/g, (_, firstTag, between) => {
    const extras = between
      .split(/\s+/)
      .filter((u) => /^https?:\/\//.test(u))
      .map((u) => `<image_url>${u}</image_url>`)
      .join('');
    return firstTag + extras;
  });
}

function ensureArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

// xmlToJson turns self-closing/empty tags into {} - normalize to null so
// optional chaining and `if (!x)` checks work as expected downstream.
function normalizeEmptyObjects(item) {
  for (const key of Object.keys(item)) {
    const v = item[key];
    if (v != null && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) {
      item[key] = null;
    }
  }
  return item;
}

function splitCsv(value) {
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function getUsbSizes(input) {
  if (typeof input !== 'string') return [];
  const matches = input.match(/\d+(?:\.\d+)?\s*[GT]B/gi) ?? [];
  const normalized = matches.map((m) => m.replace(/\s+/g, '').toUpperCase());
  return [...new Set(normalized)].sort((a, b) => {
    const toGb = (s) => parseFloat(s) * (s.endsWith('TB') ? 1024 : 1);
    return toGb(a) - toGb(b);
  });
}

export const buildProductDescription = (item) => {
  const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

  // trailing "Zdjęcia Szablony znakowania" leaks into description from badly-parsed links
  const cleanDescription = (v) =>
    v.replace(/\s*(?:Zdjęcia(?:\s+Szablony znakowania)?|Szablony znakowania)\s*$/i, '').trim();

  // order matters. `multi: true` - render as bullet list when there are multiple values.
  const FIELDS = [
    { key: 'productAttributeKolor', label: 'Kolor', multi: true },
    { key: 'productAttributePojUsb', label: 'Pojemność USB', multi: true },
    { key: 'productAttributeOtg', label: 'OTG' },
    { key: 'productAttributeTypZlacza', label: 'Typ złącza', multi: true },
    { key: 'productAttributeTypZlaczaUsb', label: 'Typ złącza USB', multi: true },
    { key: 'productAttributeKompatybilne', label: 'Kompatybilność', multi: true },
    { key: 'productAttributePojemnoscBaterii', label: 'Pojemność baterii' },
    { key: 'productAttributeObjetosc', label: 'Pojemność' },
    { key: 'productAttributeRozdzielczosc', label: 'Rozdzielczość' },
    { key: 'productAttributeZasieg', label: 'Zasięg' },
    { key: 'productAttributeWigheight', label: 'Waga' },
    { key: 'productAttributeTypebox', label: 'Opakowanie' },
    { key: 'productAttributeAntybakteryjne', label: 'Antybakteryjne' },
    { key: 'productAttributeDodatkoweFunkcje', label: 'Dodatkowe funkcje', multi: true },
    { key: 'productAttributePowierzchniaLogo', label: 'Powierzchnia logo' },
  ];

  // each block becomes a paragraph, joined by blank lines
  const blocks = [];

  if (isNonEmptyString(item?.description)) {
    const cleaned = cleanDescription(item.description);
    if (cleaned) blocks.push(`${cleaned}\n\n<br/>`);
  }

  for (const { key, label, multi } of FIELDS) {
    const raw = item?.[key];
    if (!isNonEmptyString(raw)) continue;

    const values = multi ? splitCsv(raw) : [raw];
    if (values.length === 0) continue;

    if (values.length === 1) {
      blocks.push(`**${label}:** ${values[0]}`);
    } else {
      blocks.push([`**${label}:**`, ...values.map((v) => `- ${v}`)].join('\n'));
    }
  }

  return blocks.join('\n\n');
};

function parse(company, products) {
  // the xml is malformed (great stuff), so we need to fix it before parsing
  products = xmlToJson(fixXml(products));
  const items = ensureArray(products.root.item);
  for (const item of items) {
    item.imageUrl = ensureArray(item.imageUrl);
    normalizeEmptyObjects(item);
  }

  const slugCounts = new Map();
  const uniqueSlug = (base) => {
    const count = slugCounts.get(base) ?? 0;
    slugCounts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };

  return parseItems(
    items.map(($) => {
      const name = $?.name || '';
      const slug = uniqueSlug(slugify(name));
      const description = buildProductDescription($);
      const size = parseSize($?.productAttributeWymiary);
      const colors = splitCsv($?.productAttributeKolor);
      const multicolored = colors.length > 2;
      const usbSizes = getUsbSizes($?.productAttributePojUsb);
      const fullName = usbSizes.length ? `${name} ${usbSizes.join('/')}` : name;

      return {
        name: fullName,
        code: slug,
        slug,
        seo_title: name,
        seo_description: $?.description || name,
        description,
        size_x: size?.x,
        size_y: size?.y,
        size_z: size?.z,
        materials: splitCsv($?.productAttributeMaterial),
        _storage: {
          img: $?.imageUrl,
          amount: null, // ask for stock
          api_color_code: slug,
          multicolored,
          color_first: multicolored ? null : (colors[0] ?? null),
          color_second: multicolored ? null : (colors[1] ?? null),
        },
      };
    }),
  );
}

export class USBSystem extends Api {
  fetch = async ({ company }) =>
    fetchSimpleApi({
      company,
      routes: ['products'],
      url: (route) => `https://usbsystem.pl/${route}.xml`,
      parse,
    });
}
