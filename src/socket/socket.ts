import {Authorization} from '../authorization';
import * as socketHelper from './socket_helper';
import * as config from '../config';
import * as socketIO from 'socket.io-client';

export class Socket {
  private authorization: Authorization;
  socketConnection: any;

  constructor(authorization: Authorization) {
    this.authorization = authorization;
    this.socketConnection = null;
  }

  async connectToSocket() {
    if (!this.socketConnection) {
      await this.authorization.login();
      this.socketConnection = socketIO(
        config.socket_endpoint,
        {
          transports: ['websocket'],
          path: '/thermostat',
          extraHeaders: { Authorization: `Bearer ${this.authorization.accessToken}` }
        }
      );
    }
  }

  async startSocketConnection() {
    await this.connectToSocket();

    this.socketConnection.on('connected', () => {
      console.log('connected');
      this.socketConnection.on('state', socketHelper.stateHandler);
    });
    this.socketConnection.on('disconnect', socketHelper.disconnectHandler);
    this.socketConnection.on('error', socketHelper.errorHandler);

    return this.socketConnection;
  }
}
