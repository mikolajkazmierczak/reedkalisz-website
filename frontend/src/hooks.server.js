/**
 * Public pages: Cloudflare may keep the HTML for 30 s (the server's own cache has the other half of the minute a
 * change may take to show), so most visitors never reach the server; browsers always revalidate. Full page loads
 * only: `__data.json` (in-site navigation, and the homepage editor's reload after saving) always reaches the
 * server, so an admin sees their own save at once.
 *
 * Cloudflare reads only its own header when present (and strips it); it would skip caching on the
 * `max-age=0` meant for browsers.
 */
const BROWSER_CACHE = 'public, max-age=0, s-maxage=30';
const EDGE_CACHE = 'max-age=30';

export async function handle({ event, resolve }) {
  const response = await resolve(event);
  const publicPage = event.request.method === 'GET' && !event.isDataRequest && event.route.id?.startsWith('/(website)');
  if (!publicPage || response.headers.has('cache-control')) return response;
  // Never a 404 or an error: a product published a moment later would still show as missing.
  if (response.status === 200) {
    response.headers.set('cache-control', BROWSER_CACHE);
    response.headers.set('cloudflare-cdn-cache-control', EDGE_CACHE);
  } else {
    response.headers.set('cache-control', 'no-store');
  }
  return response;
}
