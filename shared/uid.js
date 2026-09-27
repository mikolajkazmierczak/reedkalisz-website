export function getUid(companyName, product, variant = null) {
  // The API page's key of a product ('MidOcean/MO9469', its statuses are kept by it) or a variant
  // ('MidOcean/MO9469/MO9469-03'). A variant's code is its whole code, unique at the supplier; a product's code may
  // repeat (the list tells those apart itself, see admin/api/items.js).
  let uid = `${companyName}/${product.code ?? '???'}`;
  return variant ? `${uid}/${variant.api_color_code || '???'}` : uid;
}
