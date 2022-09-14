import polka from 'polka';
import { Server as socketio } from 'socket.io';
import 'dotenv/config';

const { PORT, HOST } = process.env;

const corsConfig = {
  origin: true
};

const app = polka().listen(PORT, HOST, () => console.log(`🚀 Lift off on port ${PORT}!`));
const io = new socketio(app.server, {
  cors: corsConfig
});

io.on('connection', socket => {
  console.log(`🔌 New connection (${socket.id})`);
  socket.on('disconnect', reason => {
    console.log(`❌ Socket disconnected (${socket.id})`);
    console.log(`   - reason: ${reason}`);
  });
  socket.on('changes', data => {
    socket.broadcast.emit('changes', data);
  });
});
