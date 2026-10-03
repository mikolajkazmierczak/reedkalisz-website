import bodyParser from 'body-parser';
import 'dotenv/config';
import polka from 'polka';
import { Server as socketio } from 'socket.io';
import api from './api/index.js';
import { timedOut } from './api/utils.js';

const doLog = true;
function log(string) {
  if (doLog) console.log(string);
}

const { PORT, HOST } = process.env;
const cors = { origin: true };

const app = polka()
  .use(bodyParser.text())
  .listen(PORT, HOST, () => console.log(`🚀 Lift off on port ${PORT}!`));
const io = new socketio(app.server, {
  cors,
  // a scan's reply (~10 MB of JSON for AXPOL) compressed, the small messages as they are (ws skips the ones under the
  // threshold only without context takeover)
  perMessageDeflate: { threshold: 64 * 1024, serverNoContextTakeover: true },
});

function getCompanyEnv(company) {
  // API_<company.name>_<key>: value -> { <key>: value }
  // API_GOOGLE_TOKEN: '123' -> { token: '123' }
  const keys = Object.keys(process.env).filter((arg) => arg.startsWith(`API_${company.name.toUpperCase()}`));
  return keys.reduce((acc, arg) => {
    const key = arg.split('_').pop().toLowerCase();
    const value = process.env[arg];
    acc[key] = value;
    return acc;
  }, {});
}

async function fetchAPI(company) {
  if (!api[company.name]) throw new Error(`Api class for ${company.name} not found`);
  return await api[company.name].fetch({ company, env: getCompanyEnv(company) });
}

// a whole scan's time limit (each request has its own, see api/utils.js): under the admin's 10 minutes (frontend's
// heimdall.js), so the reply naming the supplier comes first
const FETCH_LIMIT = 8 * 60 * 1000;
function withinLimit(promise) {
  let timer;
  const limit = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('dostawca nie odpowiedział w ciągu 8 minut')), FETCH_LIMIT);
  });
  return Promise.race([promise, limit]).finally(() => clearTimeout(timer));
}

// the companies being scanned: one scan of each at a time (a second would double a big feed's memory)
const fetching = new Set();

app.get('/', (req, res) => {
  res.end('Greetings. I am a vigilant watcher of this realm. My name is Heimdall Odinson.');
});

io.on('connection', (socket) => {
  log(`🔌 New connection (${socket.id})`);
  socket.on('disconnect', (reason) => {
    log(`❌ Socket disconnected (${socket.id})`);
    log(`   - reason: ${reason}`);
  });

  socket.on('changes', (data) => {
    log(`   - changes: ${JSON.stringify(data, null, 2)}`);
    socket.broadcast.emit('changes', data);
    if (data.selfBroadcast) socket.emit('changes', data);
  });

  // every scan gets a reply: the items, { error } or { notice }
  socket.on('fetch', async ({ company }) => {
    log(`📡 Fetching data (${socket.id})`);
    log(`   - api: ${company.name}`);
    if (fetching.has(company.id)) {
      log('   - refused: already being fetched');
      socket.emit('fetch', { notice: `Skanowanie ${company.name} już trwa - spróbuj za chwilę.`, company: company.id });
      return;
    }
    const start = Date.now();
    const took = () => `${Math.round((Date.now() - start) / 1000)} s`;
    fetching.add(company.id);
    const run = fetchAPI(company);
    // (free again once the scan really ends, not when its time runs out: it keeps fetching till then)
    run.catch(() => {}).finally(() => fetching.delete(company.id));
    try {
      const data = await withinLimit(run);
      socket.emit('fetch', { ...data, company: company.id });
      log(`   - success (${took()})`);
    } catch (err) {
      log(`   - error (${took()}) ${err}`);
      // (node-fetch's error for a request out of time is just "The operation was aborted.")
      const error = timedOut(err) ? 'dostawca nie odpowiedział na czas' : err?.message || String(err);
      // a supplier's own refusal (HappyBrands: one scan per 10 minutes): its bare message, not an error
      socket.emit('fetch', err.notice ? { notice: err.message, company: company.id } : { error, company: company.id });
    }
  });
});
