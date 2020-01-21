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
