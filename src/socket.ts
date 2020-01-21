import * as socketHelper from './socket_helper';
import * as config from './config';
import * as socketIO from 'socket.io-client';

export class Socket {
  accessToken: string;
  socketConnection: any;

  constructor(accessToken) {
    this.accessToken = accessToken;
    this.socketConnection = null;
  }

  start() {
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

    this.socketConnection.on('connected', socketHelper.connectHandler);
    this.socketConnection.on('disconnect', socketHelper.disconnectHandler);
    this.socketConnection.on('error', socketHelper.errorHandler);

    return this.socketConnection;
  }
}
