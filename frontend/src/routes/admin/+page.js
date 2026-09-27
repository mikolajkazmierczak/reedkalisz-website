import { redirect } from '@sveltejs/kit';

// no dashboard: the menu lists everything, the admin opens on the products
export function load() {
  throw redirect(307, '/admin/produkty');
}
