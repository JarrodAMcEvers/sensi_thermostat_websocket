import {Socket} from './socket';
import * as authorization from './authorization';

export async function startSocketConnection() {
  const accessToken = (await authorization.getTokens()).access_token;
  const socket      = new Socket(accessToken).socketConnection;

  socket.on('connected', this.connectHandler);
  socket.on('disconnect', this.disconnectHandler);
  socket.on('error', this.errorHandler);

  return socket;
}

export function connectHandler() {
  console.log('connected');
}

export function disconnectHandler(err) {
  console.error('disconnected', err);
}

export function errorHandler(err) {
  console.error('error', err);
}
