import { io } from 'socket.io-client';

export const createSocket = () => io('/', {
  path: '/socket.io',
  autoConnect: false,

  // чтобы в консоли не было websocket-ошибок под vite/прокси
  transports: ['polling'],
  upgrade: false,
});