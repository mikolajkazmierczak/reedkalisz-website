import polka from 'polka';
import { Server as socketio } from 'socket.io';
import 'dotenv/config';

import apis from './apis.js';

const doLog = true;
function log(string) {
  if (doLog) console.log(string);
}

const { PORT, HOST } = process.env;
const cors = { origin: true };

const app = polka().listen(PORT, HOST, () => console.log(`🚀 Lift off on port ${PORT}!`));
const io = new socketio(app.server, { cors });

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
    log(`   - changes: ${data}`);
    socket.broadcast.emit('changes', data);
    if (data.selfBroadcast) socket.emit('changes', data);
  });

  socket.on('fetch', async ({ companyName, data }) => {
    log(`📡 Fetching data (${socket.id})`);
    log(`   - api: ${companyName}`);
    let output = null;
    try {
      if (companyName == 'PAR') {
        output = await apis.PARAPI.fetch(process.env.API_USERNAME_PAR, process.env.API_PASSWORD_PAR);
      }
      log(`   - success`);
    } catch (err) {
      log(`   - error ${err}`);
    }
    socket.emit('fetch', output);
  });
});
