/**
 * The pages that change least - the homepage, Kontakt, the policies: Cloudflare may keep their HTML for 2.5 minutes
 * (the server's own cache has the other half of the 5 a change may take to show), so most visitors never reach the
 * server; browsers always revalidate. Full page loads only: `__data.json` (in-site navigation, and the homepage
 * editor's reload after saving) always reaches the server, so an admin sees their own save at once.
 *
 * Every other public page (a category, a product: fast, and what's edited most) is never kept by Cloudflare - said
 * outright, since a cache rule on the zone could otherwise keep it for its own default time.
 *
 * Cloudflare reads only its own header when present (and strips it); it would skip caching on the
 * `max-age=0` meant for browsers.
 */
const CACHED = [
  '/(website)',
  '/(website)/kontakt',
  '/(website)/polityka-prywatnosci',
  '/(website)/obowiazek-informacyjny',
];
const BROWSER_CACHE = 'public, max-age=0, s-maxage=150';
const EDGE_CACHE = 'max-age=150';

export async function handle({ event, resolve }) {
  const response = await resolve(event);
  const publicPage = event.request.method === 'GET' && !event.isDataRequest && event.route.id?.startsWith('/(website)');
  if (!publicPage || response.headers.has('cache-control')) return response;
  if (response.status !== 200) {
    // Never a 404 or an error: a product published a moment later would still show as missing.
    response.headers.set('cache-control', 'no-store');
  } else if (CACHED.includes(event.route.id)) {
    response.headers.set('cache-control', BROWSER_CACHE);
    response.headers.set('cloudflare-cdn-cache-control', EDGE_CACHE);
  } else {
    response.headers.set('cache-control', 'public, max-age=0, must-revalidate');
    response.headers.set('cloudflare-cdn-cache-control', 'no-store');
  }
  return response;
}
