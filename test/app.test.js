let faker = require('faker');

const mock = jest.fn();
jest.mock('socket.io-client', () => {
  return mock;
});
let endpoint = faker.internet.url();
let socket   = require('socket.io-client');
let config = jest.mock('../src/config.js', () => {
  return {
    endpoint: endpoint
  };
});

let app = require('../src/app.js');

describe('start', () => {
  test('calls socketio client with correct params', () => {
    let accessToken = faker.random.uuid();
    return app.start(accessToken)
      .then(() => {
        let mockArgs = mock.mock.calls[0];
        expect(mockArgs[0]).toBe(endpoint);

        // deep equal check
        expect(mockArgs[1]).toEqual({
          transports: ['websocket'],
          path: '/thermostat',
          extraHeaders: { Authorization: `Bearer ${accessToken}` }
        });
      });
  });
});