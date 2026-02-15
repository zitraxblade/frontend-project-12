import { io } from 'socket.io-client';

export const createSocket = () => io('/', {
  path: '/socket.io',
  autoConnect: false,

  // токен будем ставить в HomePage перед socket.connect()
  auth: {},

  // чтобы не ругался websocket в консоли (оставляем как у тебя)
  transports: ['polling'],
  upgrade: false,
});