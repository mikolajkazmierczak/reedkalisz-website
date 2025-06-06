import polka from 'polka';
import bodyParser from 'body-parser';
import { Server as socketio } from 'socket.io';
import 'dotenv/config';

import api from './api/index.js';

const doLog = true;
function log(string) {
  if (doLog) console.log(string);
}

const { PORT, HOST } = process.env;
const cors = { origin: true };

const app = polka()
  .use(bodyParser.text())
  .listen(PORT, HOST, () => console.log(`🚀 Lift off on port ${PORT}!`));
const io = new socketio(app.server, { cors });

function getCompanyEnv(company) {
  // API_<company.name>_<key>: value -> { <key>: value }
  // API_GOOGLE_TOKEN: '123' -> { token: '123' }
  const keys = Object.keys(process.env).filter(arg => arg.startsWith(`API_${company.name.toUpperCase()}`));
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

// function convertBodyToFormData(options) {
//   const formData = new FormData();
//   for (const [key, value] of Object.entries(options.body)) {
//     formData.append(key, value);
//   }
//   options.body = new URLSearchParams(formData);
// }

// app.post('/fetch', async (req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
//   const { url, options, bodyIsFormData } = JSON.parse(req.body);
//   if (bodyIsFormData) convertBodyToFormData(options);
//   const response = await fetch(url, options);
//   // TODO improve this
//   // const data = await response.text();
//   console.log(JSON.stringify(response));

//   const stuff = Object.getOwnPropertySymbols(response)[1];
//   console.log(JSON.stringify(stuff));

//   res.end(JSON.stringify(stuff));
// });

app.get('/', (req, res) => {
  res.end('Greetings. I am a vigilant watcher of this realm. My name is Heimdall Odinson.');
});

io.on('connection', socket => {
  log(`🔌 New connection (${socket.id})`);
  socket.on('disconnect', reason => {
    log(`❌ Socket disconnected (${socket.id})`);
    log(`   - reason: ${reason}`);
  });

  socket.on('changes', data => {
    log(`   - changes: ${JSON.stringify(data, null, 2)}`);
    socket.broadcast.emit('changes', data);
    if (data.selfBroadcast) socket.emit('changes', data);
  });

  socket.on('fetch', async ({ company }) => {
    log(`📡 Fetching data (${socket.id})`);
    log(`   - api: ${company.name}`);
    try {
      const data = await fetchAPI(company);
      socket.emit('fetch', data);
      log(`   - success`);
    } catch (err) {
      log(`   - error ${err}`);
    }
  });
});
