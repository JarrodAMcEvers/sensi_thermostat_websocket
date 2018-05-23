let socketIO = require('socket.io-client');
let config = require('./config.js');

exports.start = accessToken => {
  let socket = socketIO(config.socket_endpoint, {
    transports: ['websocket'],
    path: '/thermostat',
    extraHeaders: { Authorization: `Bearer ${accessToken}` }
  });

  return Promise.resolve(socket);
};