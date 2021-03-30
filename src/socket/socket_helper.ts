import { SocketState } from '../types/types';

export class SocketHelper {
  private _state: SocketState;
  public get state() {
    return this._state;
  }
  public set state(data: SocketState) {
    this._state = data;
  }

  stateHandler(data: any): void {
    this._state = <SocketState>data;
    const datetime = new Date().toLocaleString().replace(',', '');

    console.log('received data at', datetime);
    console.log(JSON.stringify(data));
  }

  disconnectHandler(err): void {
    console.error('disconnected', err);
  }
}
