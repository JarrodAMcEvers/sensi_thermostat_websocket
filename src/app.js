let socketIO      = require('socket.io-client');
let authorization = require('./authorization.js');
let config        = require('./config.js');

let checkToken = async accessToken => {
  return !accessToken
    ? await authorization.getAccessToken()
    : accessToken;
};

exports.startSocketConnection = accessToken => {
  return checkToken(accessToken)
    .then(actualAccessToken => {
      let socket = socketIO(config.socket_endpoint, {
        transports: ['websocket'],
        path: '/thermostat',
        extraHeaders: { Authorization: `Bearer ${actualAccessToken}` }
      });

      socket.on('connected', this.connectHandler);
      socket.on('disconnect', this.disconnectHandler);
      socket.on('error', this.errorHandler);

      return Promise.resolve(socket);
    });
};

exports.connectHandler = async () => {
  console.log('connected');
};

exports.disconnectHandler = async err => {
  console.error('disconnected', err);
};