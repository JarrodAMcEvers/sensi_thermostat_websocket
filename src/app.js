let socket = require('socket.io-client');
let config = require('./config.js');

exports.start = () => {
  socket(config.endpoint)
  return Promise.resolve();
};