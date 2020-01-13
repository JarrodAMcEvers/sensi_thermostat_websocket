import * as socketIO from 'socket.io-client';
import * as authorization from './authorization';
import * as config from './config';

let checkToken = async accessToken => {
  return !accessToken
    ? (await authorization.getTokens()).access_token
    : accessToken;
};

export async function startSocketConnection(accessToken) {
  const actualAccessToken = await checkToken(accessToken);
  const socket            = socketIO(config.socket_endpoint, {
    transports: ['websocket'],
    path: '/thermostat',
    extraHeaders: {Authorization: `Bearer ${actualAccessToken}`}
  });

  socket.on('connected', this.connectHandler);
  socket.on('disconnect', this.disconnectHandler);
  socket.on('error', this.errorHandler);

  return socket;
};

export async function connectHandler() {
  console.log('connected');
};

export async function disconnectHandler(err) {
  console.error('disconnected', err);
};

export async function errorHandler(err) {
  console.error('error', err);
};
