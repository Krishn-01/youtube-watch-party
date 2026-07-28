import { Server } from 'socket.io';
import { registerRoomHandlers } from './handlers/roomHandlers.js';

export const initSocket = (httpServer) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  const io = new Server(httpServer, {
    cors: {
      origin: clientUrl.split(',').map((url) => url.trim()),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    registerRoomHandlers(io, socket);
  });

  return io;
};
