// In this file 'variant' is used instead of 'storage' because of future plans.

export function getUid(companyName, product, variant = null) {
  // TODO Right now this only supports color codes.
  // All products should have a `code` unique to all products from a given company.
  // All variants should have an `api_color_code` unique to all colors from a given company.
  // If company does not provide codes, Heimdall should generate them during parsing from an items id, name or similiar.
  // if (!product.code) throw new Error(`No product code!`, product);
  // if (variant && variant.api_color_code === null) throw new Error(`No variant code!`, variant);
  let uid = `${companyName}/${product.code ?? '???'}`;
  return variant ? `${uid}/${variant.api_color_code || '???'}` : uid;
}

export function readUid(uid) {
  const parts = uid.split('/');
  if (parts.lenght < 2) throw new Error(`Invalid uid: ${uid}`);
  const [companyName, productCode] = parts;
  const attributes = {};
  if (parts.length > 2) {
    attributes.colorCode = parts[2];
  }
  return { companyName, productCode, ...attributes };
}
