function parseStorage($) {
  const { _incompatible, _storage } = $;
  const { img, amount, api_color_code, api_color_id, multicolored } = _storage;
  const { color_first, _color_first_hex, color_second, _color_second_hex } = _storage;
  return {
    _incompatible,
    img,
    amount,
    api_color_code,
    api_color_id,
    multicolored: multicolored || false,
    color_first,
    _color_first_hex,
    color_second,
    _color_second_hex
  };
}

function parseMain($) {
  const { _incompatible } = $;
  const { name, code, slug, seo_title, seo_description, description } = $;
  const { size_x, size_y, size_z, materials, price, handling_cost, gallery } = $;
  return {
    _incompatible,
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
    storage: [parseStorage($)]
  };
}

export function parseItems(items) {
  // First create the product and the first storage, then just keep adding storage items.
  // The first encountered item dictates the product's properties.
  const parsed = [];
  for (const item of items) {
    const main = parsed.find(p => p.code == item.code);
    if (!main) parsed.push(parseMain(item));
    else main.storage.push(parseStorage(item));
  }
  return parsed;
}
