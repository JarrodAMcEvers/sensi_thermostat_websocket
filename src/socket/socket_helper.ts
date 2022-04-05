import { SocketState } from '../types/types';

export class SocketHelper {
  private thermostatState: SocketState;
  public get state() {
    return this.thermostatState;
  }

  stateHandler(data: any): void {
    this.thermostatState = <SocketState>data;
    const datetime = new Date().toLocaleString().replace(',', '');

    console.log('received data at', datetime);
    console.log(JSON.stringify(data));
  }

  disconnectHandler(err): void {
    console.error('disconnected', err);
  }
}
