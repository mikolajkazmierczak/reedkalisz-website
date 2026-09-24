import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import api from '$/api';
import { readProduct } from './product';

export async function load({ data, params }) {
  if (data.product) return data;
  // Hidden: only an admin's browser (its token) can read it, to check it before publishing. Listings load on the
  // server, so they never show it.
  const product = browser ? await readProduct(api, params.slug, { hidden: true }).catch(() => null) : null;
  if (!product) throw error(404, '404');
  return { ...data, product, hidden: true };
}
