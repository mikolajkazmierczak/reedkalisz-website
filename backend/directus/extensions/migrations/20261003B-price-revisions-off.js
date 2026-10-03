//
// No revisions for price_per_amount: a scan's recalculation rewrites tens of thousands of price rows, and with
// accountability "all" Directus re-reads every written row and stores it as a revision (64.8k for one AXPOL scan) -
// rows nobody looks back at, emptied nightly by scripts/cleanup.sh anyway. "activity" still logs who changed what.
// The panel's "Only Track Activity" (Settings > Data Model > price_per_amount, Activity & Revision Tracking).
//
// Directus caches the schema (accountability included) in memory: a running Directus keeps "all" until restarted.
// Format: see 20261003A-foreign-key-indexes.js.
//

async function up(knex) {
  await knex('directus_collections').where({ collection: 'price_per_amount' }).update({ accountability: 'activity' });
}

async function down(knex) {
  await knex('directus_collections').where({ collection: 'price_per_amount' }).update({ accountability: 'all' });
}

module.exports = { up, down };
