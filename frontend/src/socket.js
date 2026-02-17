import { io } from 'socket.io-client';

export const createSocket = () => io('/', {
  path: '/socket.io',
  autoConnect: false,
  transports: ['polling'],
  upgrade: false,
});