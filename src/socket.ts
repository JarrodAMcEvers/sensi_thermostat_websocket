import * as socketIO from 'socket.io-client';
import * as config from './config';

export class Socket {
  accessToken: string;
  socketConnection: any;

  constructor(accessToken) {
    this.accessToken = accessToken;
    this.socketConnection = null;
  }

  get connection() {
    if (!this.socketConnection) {
      this.socketConnection = socketIO(
        config.socket_endpoint,
        {
          transports: ['websocket'],
          path: '/thermostat',
          extraHeaders: { Authorization: `Bearer ${this.accessToken}` }
        }
      );
    }

    return this.socketConnection;
  }
}
