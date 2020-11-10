import {Socket} from './socket';
import {Authorization} from '../authorization';
import { SocketState } from '../types';

export class SocketHelper {
  private state: SocketState;

  public setState(state: SocketState) {
    this.state = state;
  }
}

export async function startSocketConnection(): Promise<void> {
  const authorization    = new Authorization();
  const socket           = new Socket(authorization);
  socket.startSocketConnection();
}

export function stateHandler(data: any): void {
  const datetime = new Date().toLocaleString().replace(',', '');

  console.log('received data at', datetime);
  console.log(JSON.stringify(data));
}

export function disconnectHandler(err): void {
  console.error('disconnected', err);
}
