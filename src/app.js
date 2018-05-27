let socketIO = require('socket.io-client');
let config = require('./config.js');

exports.startSocketConnection = accessToken => {
  let socket = socketIO(config.socket_endpoint, {
    transports: ['websocket'],
    path: '/thermostat',
    extraHeaders: { Authorization: `Bearer ${accessToken}` }
  });

  socket.on('connected', this.connectHandler);
  socket.on('disconnect', this.disconnectHandler);

  return Promise.resolve(socket);
};

exports.connectHandler = data => {
  console.log(data);
};