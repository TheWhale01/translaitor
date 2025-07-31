import { Server } from 'socket.io';

export const webSocketServer = {
  name: 'webSocketServer',
  configureServer(server: any) {
    const io = new Server(server.httpServer);
    io.on('connection', (socket) => {
      console.log('new user connected');
      socket.on('translation', (translation: any): void => {
        io.emit('translation', translation);
      });
    });
  }
}
