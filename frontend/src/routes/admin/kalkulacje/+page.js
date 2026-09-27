import { redirect } from '@sveltejs/kit';

// the calculations are their tabs: the labelings first (an old link with a company lands on its own)
export function load({ url }) {
  throw redirect(307, `/admin/kalkulacje/znakowania${url.search}`);
}
