let socketIO      = require('socket.io-client');
let authorization = require('./authorization.js');
let config        = require('./config.js');

exports.startSocketConnection = accessToken => {
  if (!accessToken) {
    authorization.getAccessToken();
  }

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

exports.disconectHandler = async function (err) {
  console.error('disconnected', err);
};