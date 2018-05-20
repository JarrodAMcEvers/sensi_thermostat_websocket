let faker = require('faker');

const mock = jest.fn();
jest.mock('socket.io-client', () => {
  return mock;
});
let endpoint = faker.internet.url();
let socket = require('socket.io-client');
jest.mock('../src/config.js', () => {
  return {
    endpoint: endpoint
  }
});

let app = require('../src/app.js');

test('calls socketio client with the correct params', () => {
  return app.start()
    .then(() => {
      expect(mock.mock.calls[0][0]).toBe(endpoint);
    });
});