import { getISODate } from 'reedkalisz-shared/datetime.js';
import convert from 'xml-js';

function camelCase(str) {
  // Transforms a string (snake_case, SNAKE_CASE, kebab-case, PascalCase, camelCase) to camelCase.
  if (/^[A-Z_]+$/.test(str)) str = str.toLowerCase(); // SNAKE_CASE
  return str
    .replace(/[-_](.)/g, (_, char) => char.toUpperCase()) // snake_case and kebab-case
    .replace(/^[A-Z]/, char => char.toLowerCase()) // lowercase first letter for PascalCase
    .replace(/([A-Z]+)/g, (match, p1, offset) => (offset === 0 ? match.toLowerCase() : match));
}

export function arraysToJson(arrays) {
  // Transform a json file that is arrays of arrays where the first row is the header (like a csv), into a json object.
  // All keys are transformed to camelCase.
  const header = arrays[0];
  const data = arrays.slice(1);
  return data.map(row =>
    header.reduce((acc, key, i) => {
      acc[camelCase(key)] = row[i];
      return acc;
    }, {})
  );
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

export async function fetchSimpleApi({ company, routes, url, parse }) {
  const responses = await Promise.all(routes.map(route => fetch(url(route))));

  const isXml = url('test').includes('xml'); // a bit crude, but does the job
  const data = await Promise.all(responses.map(res => (isXml ? res.text() : res.json())));

  const items = parse(company, ...data);
  return { items, lastScan: getISODate() };
}
