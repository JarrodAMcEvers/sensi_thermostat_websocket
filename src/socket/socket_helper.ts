import {Socket} from './socket';
import {getTokens} from '../authorization';

export async function startSocketConnection(): Promise<void> {
  const accessToken      = (await getTokens()).access_token;
  const socket           = new Socket(accessToken);
  socket.startSocketConnection();
}

export function stateHandler(data: any): void {
  console.log(JSON.stringify(data));
}

export function disconnectHandler(err): void {
  console.error('disconnected', err);
}

export function errorHandler(err): void {
  console.error('error', err);
}
