//
// Indexes on the foreign keys every product read, save and delete goes through. SQLite indexes only primary keys and
// unique columns, so each o2m read (a product's labelings, a labeling's prices...) and each ON DELETE CASCADE scans
// the whole child table: one product labeling's prices are found among ~270k price_per_amount rows in 13 ms (0.006 ms
// with the index), several times per product in a scan's recalculation.
//
// Applied by `npx directus database migrate:latest` in backend/directus (`directus start` only warns that migrations
// are pending, it never runs them) - with Directus stopped: CREATE INDEX holds the write lock while it builds.
//
// IF NOT EXISTS: Directus records a migration only once up() has finished, so a run that failed halfway is simply run
// again. A field edited in the panel keeps them: knex rebuilds the SQLite table and replays its CREATE INDEX statements
// (knex/lib/dialects/sqlite3/schema/ddl.js: getTableSql, then generateAlterCommands / alter).
//
// CommonJS with plain named exports: Directus 9.26 import()s this file and takes `up`/`down` by name, which Node finds
// in `exports.x =` or `module.exports = { x }` but not in `module.exports = { async x() {} }` (comes back undefined).
//

const indexes = [
  // a product's own prices and its labelings' (o2m custom_prices[_sale], products_labeling.prices[_sale]), a labeling's
  // base prices (labelings.prices, read with every recalculation's globals), and the cascades from all three
  ['price_per_amount', 'products_labeling'],
  ['price_per_amount', 'products_labeling_sale'],
  ['price_per_amount', 'product'],
  ['price_per_amount', 'product_sale'],
  ['price_per_amount', 'labeling'],
  // a product's rows (o2m labelings, storage, gallery, categories, attachments) and the cascades from products
  ['products_labeling', 'product'],
  ['products_storage', 'product'],
  ['products_image', 'product'],
  ['products_categories', 'product'],
  ['products_attachment', 'product'],
  // a variant's photos (o2m products_storage.img)
  ['products_storage_image', 'products_storage'],
];

// knex's own naming, as `table.index(column)` would have it
const name = (table, column) => `${table}_${column}_index`;

async function up(knex) {
  for (const [table, column] of indexes) {
    await knex.raw('CREATE INDEX IF NOT EXISTS ?? ON ?? (??)', [name(table, column), table, column]);
  }
}

async function down(knex) {
  for (const [table, column] of indexes) {
    await knex.raw('DROP INDEX IF EXISTS ??', [name(table, column)]);
  }
}

module.exports = { up, down };
