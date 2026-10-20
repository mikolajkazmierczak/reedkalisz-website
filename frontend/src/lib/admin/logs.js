import api from '$/api';

// The scans and the recalculations, kept: api_logs and calculations_logs (the activity is wiped every night).
// A row is made when the work starts, with the admin's own session - `user_created` is who started it, whatever
// heimdall wrote for them (see heimdall.api) - and finished when it ends: one still `running` was cut off (the page
// closed, the browser gone). A log that fails to save never stops the work: it goes on unlogged.

class Log {
  constructor(collection, id) {
    this.collection = collection;
    this.id = id; // (null: the row couldn't be made)
    this.data = {}; // saved when it finishes
    this.finished = false;
  }

  static async start(collection, data) {
    try {
      await api.auth.refreshIfExpired(); // (the SDK refreshes before every request but a POST: this one, often the first)
      const { id } = await api.items(collection).createOne({ ...data, status: 'running' }, { fields: ['id'] });
      return new this(collection, id);
    } catch (e) {
      console.warn(`Log not created in ${collection}:`, e);
      return new this(collection, null);
    }
  }

  set(data) {
    Object.assign(this.data, data);
  }

  // once: the first end is the one that happened
  async finish(status, data = {}) {
    if (this.finished) return;
    this.finished = true;
    if (this.id == null) return;
    const update = { ...this.data, ...data, status, date_finished: new Date().toISOString() };
    try {
      await api.items(this.collection).updateOne(this.id, update, { fields: ['id'] });
    } catch (e) {
      console.warn(`Log not finished in ${this.collection} (${this.id}):`, e);
    }
  }

  // an Error, or the reason given
  fail(e) {
    return this.finish('error', { error: e?.message || String(e) });
  }
}

// a scan of a company's api: running, then done, error (heimdall's or the supplier's, or a write failing), refused
// (heimdall's notice: one already running, the supplier's own limit) or skipped (looked like an outage and the admin
// didn't write it, see `warnings`)
export const startScan = (company) => Log.start('api_logs', { company });

// a recalculation of products' prices: running, then done or error. `trigger` says what started it:
// scan, import, duplicate, global_margins, price_view, labeling, super, other (a caller that didn't say)
class CalculationLog extends Log {
  data = { products: 0, changed: [] }; // how many it went through, the ones whose prices came out different (written)

  add({ ids, changed }) {
    this.data.products += ids.length;
    this.data.changed.push(...changed);
  }
}

export function startCalculation(trigger, { filter = null, newPriceView = null, swapLabelings = null, scan = null }) {
  const options = {
    ...(newPriceView != null && { newPriceView }),
    ...(swapLabelings && { swapLabelings: Object.fromEntries(swapLabelings) }),
  };
  return CalculationLog.start('calculations_logs', {
    trigger,
    filter,
    options: Object.keys(options).length ? options : null,
    scan: scan?.id ?? null,
  });
}
