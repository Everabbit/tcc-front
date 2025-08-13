import { io, Socket } from 'socket.io-client';

const URL = 'http://localhost:3000';

const socket: Socket = io(URL, {
  autoConnect: false,
});

socket.onAny((event, ...args) => {
  console.log('Socket Event:', event, args);
});

export default socket;
