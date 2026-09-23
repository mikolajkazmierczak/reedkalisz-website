import { marked } from 'marked';
import striptags from 'striptags';

/** Canonical origin, so beta never gets indexed as a copy. */
export const SITE = 'https://reed.kalisz.pl';

/** JSON-LD script tag for `{@html}`; `<` is escaped so content can't close the tag. */
export const jsonLd = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', String.raw`\u003c`)}</script>`;

/** REED as a local business: only the facts the site already states. */
export const business = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE}/#reed`,
  name: 'REED Kalisz',
  url: SITE,
  logo: `${SITE}/logo.svg`,
  image: `${SITE}/imgs/machine-playful.webp`,
  telephone: '+48 62 753 15 90',
  email: 'info@reed.kalisz.pl',
  foundingDate: '2002',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'ul. Dobrzecka 95',
    postalCode: '62-800',
    addressLocality: 'Kalisz',
    addressCountry: 'PL',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 51.757428, longitude: 18.06191 },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '10:00',
    closes: '14:00',
  },
  areaServed: 'PL',
  sameAs: ['https://www.facebook.com/reed.reklama.kalisz'],
};

/** A BreadcrumbList from `[{ name, path }]`, paths relative to the site. */
export const breadcrumbList = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(({ name, path }, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: SITE + path,
  })),
});

/* Marked escapes these; Svelte escapes attribute values again on output. */
const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" };

/** Plain text of a markdown or HTML field, cut at a word to fit a meta description. */
export function describe(text, max = 158) {
  if (!text) return '';
  const plain = striptags(marked.parse(text))
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, (_, e) => ENTITIES[e])
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;
  return plain.slice(0, plain.lastIndexOf(' ', max - 1)).replace(/[\s,;:—–-]+$/, '') + '…';
}
