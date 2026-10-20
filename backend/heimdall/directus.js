// Directus as heimdall: what the admin sends through here (a scan's writes, a recalculation - the frontend's
// `heimdall.api`) is saved as heimdall's (`user_updated`, the activity), not as the admin's who started it - Directus
// takes those from the token, whatever the request says.
// Only for an admin: their own token is checked first, and only then is the body read and sent on with heimdall's.
// Served at /directus and /heimdall/directus: Caddy takes the /heimdall off on prod, locally nothing is in front.

const { API, DIRECTUS_TOKEN } = process.env;

const prefix = /^(\/heimdall)?\/directus(?=\/)/;
const allowed = /^\/(items|files)(\/|$)/; // what heimdall writes (no users, roles or settings)
const BODY_LIMIT = 50 * 1024 * 1024; // the biggest is a scan's snapshot (AXPOL: ~10 MB unpacked, a lot less gzipped)

// the tokens found to be an admin's: a scan sends hundreds of requests, so each is checked once a minute
const CHECK_EVERY = 60 * 1000;
const admins = new Map(); // authorization -> when it was checked

async function isAdmin(authorization) {
  if (!authorization?.startsWith('Bearer ')) return false;
  const now = Date.now();
  if (now - (admins.get(authorization) ?? 0) < CHECK_EVERY) return true;
  for (const [key, checked] of admins) if (now - checked >= CHECK_EVERY) admins.delete(key);
  const res = await fetch(`${API}/users/me?fields=role.admin_access`, { headers: { Authorization: authorization } });
  if (!res.ok) return false;
  const { data } = await res.json();
  if (!data?.role?.admin_access) return false;
  admins.set(authorization, now);
  return true;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > BODY_LIMIT) {
        req.destroy();
        reject(Object.assign(new Error('Za duże zapytanie.'), { status: 413 }));
      } else chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// (as Directus answers: the SDK reads `errors[0].message`)
function fail(res, status, message) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ errors: [{ message }] }));
}

// the admin is on another origin locally (the site's port), on the same one on prod; the token goes in a header, so
// any origin may ask - without an admin's token it gets nowhere
function cors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // (the SDK sends its requests withCredentials)
  res.setHeader('Vary', 'Origin');
}

export async function proxy(req, res, next) {
  const path = req.path.replace(prefix, '');
  if (path === req.path) return next();
  cors(req, res);
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, SEARCH');
    res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '');
    res.setHeader('Access-Control-Max-Age', '600');
    res.statusCode = 204;
    return res.end();
  }
  if (Number(req.headers['content-length']) > BODY_LIMIT) return fail(res, 413, 'Za duże zapytanie.');

  try {
    // (checked as fetch sends it: it resolves "..", "%2e%2e" and "\" -"/items/%2e%2e/users" would go to /users)
    const url = new URL(`${API}${path}${req.search ?? ''}`);
    if (!allowed.test(url.pathname)) return fail(res, 404, 'Heimdall tego nie zapisuje.');
    if (!(await isAdmin(req.headers.authorization))) return fail(res, 401, 'Tylko dla zalogowanego administratora.');
    const body = await readBody(req);
    const headers = { Authorization: `Bearer ${DIRECTUS_TOKEN}` };
    // (a multipart body keeps its boundary in the content type: the bytes go on as they came)
    for (const name of ['content-type', 'accept']) if (req.headers[name]) headers[name] = req.headers[name];
    const answer = await fetch(url, { method: req.method, headers, body: body.length ? body : undefined });
    res.statusCode = answer.status;
    const type = answer.headers.get('content-type');
    if (type) res.setHeader('Content-Type', type);
    res.end(Buffer.from(await answer.arrayBuffer()));
  } catch (err) {
    console.log(`⚠️ Directus proxy (${req.method} ${path}): ${err}`);
    if (!res.headersSent)
      fail(
        res,
        err.status ?? 502,
        err.status ? err.message : `Heimdall nie połączył się z bazą danych (${err.message}).`,
      );
  }
}
