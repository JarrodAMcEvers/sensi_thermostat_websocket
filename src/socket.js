const socketIO = require('socket.io-client');
const config   = require('./config.js');

class Socket {
  constructor(accessToken) {
    this.accessToken      = accessToken;
    this.socketConnection = null;
  }

  get connection() {
    if (!this.socketConnection) {
      this.socketConnection = socketIO(config.socket_endpoint, {
        transports: ['websocket'],
        path: '/thermostat',
        extraHeaders: { Authorization: `Bearer ${this.accessToken}` }
      });
    }

    return this.socketConnection;
  }
}

module.exports = Socket;