import { Server } from 'socket.io';

export const webSocketServer = {
  name: 'webSocketServer',
  configureServer(server: any) {
    const io = new Server(server.httpServer, {cors: {origin: '*'}});
    io.on('connection', (socket) => {
      socket.on('translation', (translation: any): void => {
        io.emit('translation', translation);
      });
    });
  }
}
