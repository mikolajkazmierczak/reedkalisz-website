// A product's flags, in the order the admin panel shows them (checkboxes in the editor, filters and columns in the list).
// NOWOŚCI, BESTSELLERY and PROMOCJE on the website are made from `new`, `bestseller` and `sale`.
export const productFlags = [
  { key: 'enabled', label: 'Widoczny', icon: 'eye' },
  { key: 'new', label: 'Nowość', icon: 'sparkle' },
  { key: 'bestseller', label: 'Bestseller', icon: 'ribbon' },
  { key: 'coming_soon', label: 'Już wkrótce', icon: 'clock' },
  { key: 'out_of_stock', label: 'Koniec nakładu', icon: 'box_dismiss' },
  { key: 'show_price', label: 'Cennik', icon: 'money' },
  { key: 'sale', label: 'Promocja', icon: 'shopping_bag_percent' },
];
