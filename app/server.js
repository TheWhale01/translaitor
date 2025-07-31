import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { handler } from './build/handler.js';

const port = 3000;
const ws_port = 3001;
const app = express();
const server = createServer(app);

// RUN BEHIND A REVERSE PROXY !!
const io = new Server(server, { cors: {origin: '*'}});

io.on('connection', (socket) => {
  socket.on('translation', (translation) => {
    io.emit('translation', translation);
  });
});

io.listen(ws_port);
app.use(handler);
app.listen(port, () => {console.log(`HTTP Server started at: http://localhost:${port}\nWS Server started at: http://localhost:${ws_port}`)});
