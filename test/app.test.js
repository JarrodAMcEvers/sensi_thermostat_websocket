let faker = require('faker');

describe('app', () => {
  let app = {};

  let socketObject = faker.random.number();
  let mock         = jest.fn(() => socketObject);
  jest.mock('socket.io-client', () => {
    return mock;
  });

  let endpoint = faker.internet.url();
  let config   = jest.mock('../src/config.js', () => {
    return {
      socket_endpoint: endpoint
    };
  });

  describe('start', () => {
    beforeEach(() => {
      app = require('../src/app.js');
    });

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

    test('returns socket', () => {
      let accessToken = faker.random.uuid();
      return app.start(accessToken)
        .then(socket => {
          expect(socket).toEqual(socketObject);
        });
    });
  });
});