import * as socketIO from 'socket.io-client';
import { Authorization } from '../authorization';
import { SocketHelper } from './socket_helper';
import * as config from '../config';

export class Socket {
  private authorization: Authorization;
  socketConnection: any = null;

  constructor(authorization: Authorization) {
    this.authorization = authorization;
  }

  async connectToSocket() {
    if (this.socketConnection && this.socketConnection.connected === true) {
      return;
    }

    if (this.authorization.isRefreshTokenAvailable()) {
      await this.authorization.refreshAccessToken();
    } else {
      await this.authorization.login();
    }

    this.socketConnection = socketIO(config.SOCKET_ENDPOINT,
      {
        transports: ['websocket'],
        path: '/thermostat',
        extraHeaders: { Authorization: `Bearer ${this.authorization.accessToken}` }
      });
  }

  async startSocketConnection() {
    await this.connectToSocket();
    const socketHelper = new SocketHelper();

    this.socketConnection.on('connect', () => {
      console.log('connected');
      /*
        Even if the access token is expired (it's valid for four hours),
        you will still get updates from the server about your thermostats.
        If you try to emit an event (get_weather, etc.), it will get rejected
        with an unauthorized error.
      */
      this.socketConnection.on('state', (data: any) => {
        socketHelper.stateHandler(data);
      });
    });

    // TODO: add reconnect logic
    this.socketConnection.on('disconnect', socketHelper.disconnectHandler);

    this.socketConnection.on('error', async (error: Error) => {
      console.error('socket error', error);
      if (error.message && error.message.indexOf('jwt expired') >= 0) {
        console.log('access token is expired, reauthorizing');
        this.socketConnection.close();
        await this.startSocketConnection();
      }
    });

    return this.socketConnection;
  }
}
