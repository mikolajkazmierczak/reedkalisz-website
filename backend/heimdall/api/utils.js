import { getISODate } from 'reedkalisz-shared/datetime.js';
import convert from 'xml-js';

function camelCase(str) {
  // Transforms a string (snake_case, SNAKE_CASE, kebab-case, PascalCase, camelCase) to camelCase.
  if (/^[A-Z_]+$/.test(str)) str = str.toLowerCase(); // SNAKE_CASE
  return str
    .replace(/[-_](.)/g, (_, char) => char.toUpperCase()) // snake_case and kebab-case
    .replace(/^[A-Z]/, (char) => char.toLowerCase()) // lowercase first letter for PascalCase
    .replace(/([A-Z]+)/g, (match, p1, offset) => (offset === 0 ? match.toLowerCase() : match));
}

function replaceTextKeyObjects(obj) {
  // Recursively find all objects with "_text" key and replace them with the value of that key.
  // Other keys of the node with "_text" key will be discarded.
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (obj.hasOwnProperty('_text')) {
    return obj._text;
  }
  if (obj.hasOwnProperty('_cdata')) {
    return obj._cdata;
  }
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      obj[key] = replaceTextKeyObjects(obj[key]);
    }
  }
  return obj;
}

function transformKeysToCamelCase(obj) {
  // Recursively transform all keys of an object to camelCase.
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  const newObj = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[camelCase(key)] = transformKeysToCamelCase(obj[key]);
    }
  }
  return newObj;
}

export function xmlToJson(xml) {
  // Transform an xml file into a json object.
  // All keys are transformed to camelCase.
  // https://www.npmjs.com/package/xml-js
  const data = convert.xml2js(xml, { compact: true, trim: true });
  const textKeysReplaced = replaceTextKeyObjects(data);
  const camelCased = transformKeysToCamelCase(textKeysReplaced);
  return camelCased;
}

export function parseSearchParams(params) {
  // Parse an object with the specified search params and return a string.
  // `params`: { number: 42, string: 'excalibur' } -> '?number=42&string=excalibur'
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, value);
  }
  return '?' + searchParams.toString();
}

export function parseFormData(data) {
  // Parse an object with the specified form data and return a FormData object.
  // `data`: { number: 42, string: 'excalibur' } -> FormData { 'number' => '42', 'string' => 'excalibur' }
  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(data)) {
    formData.append(key, value);
  }
  return formData;
}

// How long one request to a supplier may take, in seconds, its body included (one that stops answering would hold the
// scan forever): a whole catalogue in one file (MidOcean's products: 26 MB) the most, a page or a login far less.
export const TIMEOUT = { feed: 180, page: 60, call: 30 };
export const timeout = (seconds) => AbortSignal.timeout(seconds * 1000);
// a request stopped by its time limit (the built-in fetch throws a TimeoutError, node-fetch an AbortError)
export const timedOut = (err) => err?.name === 'TimeoutError' || err?.name === 'AbortError';

export async function fetchSimpleApi({ company, routes, optional = [], url, parse }) {
  // `optional` routes are not essential (e.g. print data): one that fails reaches `parse` as null
  const isXml = url('test').includes('xml'); // a bit crude, but does the job
  const read = (res) => (isXml ? res.text() : res.json());
  const get = (route) => fetch(url(route), { signal: timeout(TIMEOUT.feed) });
  // all side by side: one after the other, the time limits would add up
  const [data, extra] = await Promise.all([
    Promise.all(routes.map(async (route) => read(await get(route)))),
    Promise.all(
      optional.map(async (route) => {
        try {
          const res = await get(route);
          return res.ok ? await read(res) : null;
        } catch (e) {
          console.log(`   - ${route} not fetched: ${e}`);
          return null;
        }
      }),
    ),
  ]);

  const items = parse(company, ...data, ...extra);
  return { items, lastScan: getISODate() };
}
