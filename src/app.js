const socketIO = require('socket.io-client');
const authorization = require('./authorization.js');
const config = require('./config.js');

let checkToken = async accessToken => {
  return !accessToken
    ? (await authorization.getTokens()).access_token
    : accessToken;
};

exports.startSocketConnection = async accessToken => {
  const actualAccessToken = await checkToken(accessToken);
  const socket = socketIO(config.socket_endpoint, {
    transports: ['websocket'],
    path: '/thermostat',
    extraHeaders: { Authorization: `Bearer ${actualAccessToken}` }
  });

  socket.on('connected', this.connectHandler);
  socket.on('disconnect', this.disconnectHandler);
  socket.on('error', this.errorHandler);

  return socket;
};

exports.connectHandler = async () => {
  console.log('connected');
};

exports.disconnectHandler = async err => {
  console.error('disconnected', err);
};

exports.errorHandler = async err => {
  console.error('error', err);
};
