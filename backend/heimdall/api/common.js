function parseStorage($) {
  const { _incompatible, _storage } = $;
  const { img, amount, available, api_color_code, api_color_id, multicolored } = _storage;
  const { color_first, _color_first_hex, color_second, _color_second_hex } = _storage;
  return {
    _incompatible,
    img,
    amount,
    available: available || false,
    api_color_code,
    api_color_id,
    multicolored: multicolored || false,
    color_first,
    _color_first_hex,
    color_second,
    _color_second_hex,
  };
}

export function addCategories(target, paths) {
  // Union of category paths (arrays of names, root first), e.g. [['Do pisania', 'Długopisy']].
  // Empty names are dropped, and so are paths left empty.
  for (const path of paths ?? []) {
    const clean = (path ?? []).map((name) => String(name ?? '').trim()).filter(Boolean);
    if (!clean.length) continue;
    if (!target.some((p) => p.join('\u0000') === clean.join('\u0000'))) target.push(clean);
  }
  return target;
}

// A print area as suppliers write it: '10 x 5 cm', '5 x 0,5 cm', '75x100', 'ø50 mm', '55x6' (mm unless it says cm).
// -> { width, height, area } in whole mm and mm² (one number is a circle's diameter), nulls when there is none
export function parsePrintSize(text) {
  const t = (typeof text === 'string' ? text : '').toLowerCase().replaceAll(',', '.');
  const scale = /\dcm|\scm/.test(t) ? 10 : 1;
  const [a, b] = (t.match(/\d+(\.\d+)?/g) ?? []).map((n) => Math.round(Number(n) * scale));
  if (a && b) return { width: a, height: b, area: a * b };
  if (a) return { width: a, height: a, area: Math.round(Math.PI * (a / 2) ** 2) };
  return { width: null, height: null, area: null };
}

// One print position of a product, as every adapter gives it: the techniques (the supplier's codes), the place and
// its size. -> { techniques, label, width, height, area }, or null without a technique
export function printPosition(techniques, label, size) {
  // (an empty xml tag comes as {}: not a text)
  const text = (v) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim() : '');
  const codes = [...new Set(techniques.map(text).filter(Boolean))];
  if (!codes.length) return null;
  return { techniques: codes, label: text(label), ...parsePrintSize(size) };
}

// Positions with the same place and size are one, with the techniques of all of them.
export function mergePositions(positions) {
  const merged = new Map();
  for (const p of positions.filter(Boolean)) {
    const key = JSON.stringify([p.label.toLowerCase(), p.width, p.height]);
    if (merged.has(key)) merged.get(key).techniques = [...new Set([...merged.get(key).techniques, ...p.techniques])];
    else merged.set(key, { ...p, techniques: [...p.techniques] });
  }
  return [...merged.values()];
}

function parseMain($) {
  const { _incompatible, _labelings, _categories } = $;
  const { name, code, slug, seo_title, seo_description, description } = $;
  const { size_x, size_y, size_z, materials, price, handling_cost, gallery } = $;
  return {
    _incompatible,
    _labelings, // undefined for apis without labelings
    _categories: addCategories([], _categories), // [['Main', 'Sub'], ...]
    name,
    code,
    slug,
    seo_title,
    seo_description,
    description,
    size_x,
    size_y,
    size_z,
    materials,
    price,
    handling_cost,
    gallery: gallery || [],
    storage: [parseStorage($)],
  };
}

export function parseItems(items) {
  // First create the product and the first storage, then just keep adding storage items.
  // The first encountered item dictates the product's properties.
  const byCode = new Map();
  for (const item of items) {
    const main = byCode.get(item.code);
    if (!main) {
      byCode.set(item.code, parseMain(item));
    } else {
      // a variant listed twice (Promotionway lists some products twice) is one variant with the images of both:
      // the admin tells variants apart by their code only
      const code = item._storage.api_color_code;
      const twin = code != null && main.storage.find((s) => s.api_color_code === code);
      if (twin) twin.img = [...new Set([...(twin.img ?? []), ...(item._storage.img ?? [])])];
      else main.storage.push(parseStorage(item));
      addCategories(main._categories, item._categories); // variants may sit in different categories
      // some variants lack labelings, take them from the first variant that has any
      if (main._labelings?.length === 0 && item._labelings?.length) {
        main._labelings = item._labelings;
      }
    }
  }
  return [...byCode.values()];
}
