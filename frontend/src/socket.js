import { io } from 'socket.io-client';

const getToken = () => localStorage.getItem('token');

export const createSocket = () => io('/', {
  path: '/socket.io',
  autoConnect: false,
  transports: ['websocket'],
  auth: {
    token: getToken(),
  },
});