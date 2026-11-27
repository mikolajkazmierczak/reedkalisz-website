// What a product's prices are, said beside each of them: "netto", unless its commercial paragraph (the one over its
// price lists) says they're gross, "Ceny brutto ...". The paragraph is what the client reads, so the label follows it,
// not its name in the panel. No paragraph: net, as the home page says of every price.
export const taxOf = (commercial_details) =>
  /\bceny\s+brutto\b/i.test(commercial_details?.content ?? '') ? 'brutto' : 'netto';
