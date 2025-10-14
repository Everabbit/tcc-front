import { io, Socket } from 'socket.io-client';

// const URL = 'http://localhost:3000';
const URL = 'https://api-production-cb2f.up.railway.app';

const socket: Socket = io(URL, {
  autoConnect: false,
});

export default socket;
