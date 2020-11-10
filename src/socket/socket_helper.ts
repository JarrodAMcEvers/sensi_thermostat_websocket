import { SocketState } from '../types';

export class SocketHelper {
  private state: SocketState;

  public setState(state: SocketState) {
    this.state = state;
  }
}

export function stateHandler(data: any): void {
  const datetime = new Date().toLocaleString().replace(',', '');

  console.log('received data at', datetime);
  console.log(JSON.stringify(data));
}

export function disconnectHandler(err): void {
  console.error('disconnected', err);
}
