import { redirect } from '@sveltejs/kit';

const main = '/gadzety-reklamowe-qx7RyYuE';

export function load() {
  throw redirect(301, '/kategorie' + main);
}
