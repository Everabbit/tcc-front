import { io, Socket } from 'socket.io-client';

const URL = 'https://tcc-api-e9sf.onrender.com';

const socket: Socket = io(URL, {
  autoConnect: false,
});

export default socket;
