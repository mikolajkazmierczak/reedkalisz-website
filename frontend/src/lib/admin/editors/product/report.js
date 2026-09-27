import { get } from 'svelte/store';
import api from '$/api';
import { globals, categories } from '@/globals';
import { downloadReport } from '#/report/report.js';
import { readProduct } from '#/products/product';

// the saved product's card, read as its page reads it (hidden ones too: the admin's token can)
export async function downloadAdminReport(item) {
  const [product] = await Promise.all([readProduct(api, item.slug, { hidden: true }), globals.update(categories)]);
  if (!product) throw new Error(`Nie ma produktu ${item.slug}`);
  await downloadReport(product, { categories: get(categories), enabled: item.enabled });
}
