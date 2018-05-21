let socket = require('socket.io-client');
let config = require('./config.js');

exports.start = accessToken => {
  socket(config.endpoint, {
    transports: ['websocket'],
    path: '/thermostat',
    extraHeaders: { Authorization: `Bearer ${accessToken}` }
  });
  return Promise.resolve();
};