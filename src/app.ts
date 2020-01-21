import { Socket } from './socket';
import {getTokens} from './authorization';

export async function startSocketConnection(): Promise<void> {
  const accessToken = (await getTokens()).access_token;
  const socket = new Socket(accessToken);
  const socketConnection = socket.socketConnection;

  socketConnection.on('connected', this.connectHandler);
  socketConnection.on('disconnect', this.disconnectHandler);
  socketConnection.on('error', this.errorHandler);
}

export function connectHandler(): void {
  console.log('connected');
}

export function disconnectHandler(err): void {
  console.error('disconnected', err);
}

export function errorHandler(err): void {
  console.error('error', err);
}
