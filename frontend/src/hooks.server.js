/**
 * Public pages: Cloudflare may keep the HTML for a minute, so most visitors never reach the server; browsers
 * always revalidate. Full page loads only: `__data.json` (in-site navigation, and the homepage editor's reload
 * after saving) always reaches the server, so an admin sees their own save at once.
 */
const EDGE_CACHE = 'public, max-age=0, s-maxage=60';

export async function handle({ event, resolve }) {
  const response = await resolve(event);
  const publicPage = event.request.method === 'GET' && !event.isDataRequest && event.route.id?.startsWith('/(website)');
  // Never a 404 or an error: a product published a moment later would still show as missing.
  if (publicPage && !response.headers.has('cache-control')) {
    response.headers.set('cache-control', response.status === 200 ? EDGE_CACHE : 'no-store');
  }
  return response;
}
