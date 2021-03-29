import { SocketState } from '../types/types';

export class SocketHelper {
  private state: SocketState;
  get socketState() {
    return this.state;
  }

  stateHandler(data: any): void {
    this.state = <SocketState>data;
    const datetime = new Date().toLocaleString().replace(',', '');

  console.log('received data at', datetime);
  console.log(JSON.stringify(data));
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
