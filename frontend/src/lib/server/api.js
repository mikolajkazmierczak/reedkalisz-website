import { env } from '$env/dynamic/private';
import { PUBLIC_API_URL } from '$env/static/public';
import { Directus } from '@directus/sdk';

// The server's own way to Directus: straight to it on the same machine when `API_INTERNAL_URL` says where (prod:
// http://127.0.0.1:8055, see ecosystem.config.cjs), not out through Cloudflare and back in; otherwise the public URL.
// Only for reading what a page shows - what reaches the browser (asset links, its own requests) keeps the public one.
const api = new Directus(env.API_INTERNAL_URL || PUBLIC_API_URL);

export default api;
