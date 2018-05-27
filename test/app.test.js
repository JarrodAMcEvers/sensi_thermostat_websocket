let faker = require('faker');

describe('app', () => {
  let app = {};

  let socketObject = jest.fn();
  socketObject.on  = jest.fn();

  let mockSocket = jest.fn(() => socketObject);
  jest.mock('socket.io-client', () => mockSocket);

  let mockEndpoint = faker.internet.url();
  let mockConfig = jest.fn();
  mockConfig.socket_endpoint = mockEndpoint;
  jest.mock('../src/config.js', () => mockConfig);

  describe('start', () => {
    beforeEach(() => {
      app = require('../src/app.js');
    });

    test('calls socketio client with correct params', () => {
      let accessToken = faker.random.uuid();
      return app.startSocketConnection(accessToken)
        .then(() => {
          let mockArgs = mockSocket.mock.calls[0];
          expect(mockArgs[0]).toBe(mockEndpoint);

          // deep equal check
          expect(mockArgs[1]).toEqual({
            transports: ['websocket'],
            path: '/thermostat',
            extraHeaders: { Authorization: `Bearer ${accessToken}` }
          });
        });
    });

    test('sets up socket handlers', () => {
      let accessToken = faker.random.uuid();
      app.connectHandler = jest.fn();
      return app.startSocketConnection(accessToken)
        .then(() => {
          expect(socketObject.on).toBeCalledWith('connected', app.connectHandler);
        });
    });

    test('returns socket', () => {
      let accessToken = faker.random.uuid();
      return app.startSocketConnection(accessToken)
        .then(socket => {
          expect(socket).toEqual(socketObject);
        });
    });
  });
});