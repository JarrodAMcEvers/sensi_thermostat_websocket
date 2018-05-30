let socketIO      = require('socket.io-client');
let authorization = require('./authorization.js');
let config        = require('./config.js');

let checkToken = accessToken => !accessToken ? authorization.getAccessToken() : accessToken;

exports.startSocketConnection = accessToken => {
  accessToken = checkToken(accessToken);
  let socket = socketIO(config.socket_endpoint, {
    transports: ['websocket'],
    path: '/thermostat',
    extraHeaders: { Authorization: `Bearer ${accessToken}` }
  });

  socket.on('connected', this.connectHandler);
  socket.on('disconnect', this.disconnectHandler);

  return Promise.resolve(socket);
};

exports.connectHandler = async () => {
  console.log('connected');
};

exports.disconnectHandler = async function (err) {
  console.error('disconnected', err);
};