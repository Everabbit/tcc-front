import { io, Socket } from 'socket.io-client';

const URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://api-production-cb2f.up.railway.app';

const socket: Socket = io(URL, {
  autoConnect: false,
});

export default socket;
