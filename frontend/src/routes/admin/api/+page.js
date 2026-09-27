import { redirect } from '@sveltejs/kit';

// the API page is its tabs; old links land on the first one (keeping the company)
export function load({ url }) {
  throw redirect(307, `/admin/api/produkty${url.search}`);
}
