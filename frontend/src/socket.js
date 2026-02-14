import { io } from 'socket.io-client';

const getToken = () => localStorage.getItem('token');

export const createSocket = () => io('/', {
  path: '/socket.io',
  autoConnect: false,
  auth: {
    token: getToken(),
  },

  // ВАЖНО: отключаем апгрейд до websocket, чтобы не было ошибки в консоли
  transports: ['polling'],
  upgrade: false,
});