import { PUBLIC_API_URL } from '$env/static/public';
import { Directus } from '@directus/sdk';

export const baseUrl = PUBLIC_API_URL;

const api = new Directus(baseUrl);

// SDK fails every request when refreshing a stale session fails, so public pages showed 500 until a reload.
const refreshIfExpired = api.auth.refreshIfExpired.bind(api.auth);
api.auth.refreshIfExpired = () => refreshIfExpired().catch(() => {});

export default api;
