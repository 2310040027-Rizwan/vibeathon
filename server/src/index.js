import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Basic socket wiring
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
});

// Make io available to routes/controllers when needed
app.set('io', io);

const start = async () => {
  await connectDB();
  server.on('error', (err) => {
    console.error('HTTP server error:', err && (err.code || err.message) || err);
  });
  server.on('listening', () => {
    const addr = server.address();
    console.log('HTTP server listening on', addr);
    console.log(`API running on http://localhost:${PORT}`);
  });
  server.listen(PORT);
};

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
