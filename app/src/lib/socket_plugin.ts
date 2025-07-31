import { Server } from "socket.io";

export const socketioServer = (server: any) => {
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('new connection !');
  });
}

export const socketioPlugin = {
  name: 'webSocketServer',
  configureServer(server) {
    socketioServer(server.httpServer);
  }
}
