import {Socket} from './socket';
import {getTokens} from './authorization';

export async function startSocketConnection(): Promise<void> {
  const accessToken      = (await getTokens()).access_token;
  const socket           = new Socket(accessToken);
  const socketConnection = socket.connection;

}
