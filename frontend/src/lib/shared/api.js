import { PUBLIC_API_URL } from '$env/static/public';
import { Directus } from '@directus/sdk';

export const baseUrl = PUBLIC_API_URL;

const api = new Directus(baseUrl);

// The SDK refreshes an expired session before every request and fails the request when that refresh fails
// (a stale refresh cookie), so public pages 500 until a reload. The failed refresh has already cleared the
// session, so carry on logged out: the request goes out without a token and readme() shows the login form.
const refreshIfExpired = api.auth.refreshIfExpired.bind(api.auth);
api.auth.refreshIfExpired = () => refreshIfExpired().catch(() => {});

export default api;
