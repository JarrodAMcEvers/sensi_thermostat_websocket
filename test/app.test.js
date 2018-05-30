let faker = require('faker');

describe('app', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  let app = {};

  let socketObject = jest.fn();
  socketObject.on  = jest.fn();

  let mockSocket = jest.fn(() => socketObject);
  jest.mock('socket.io-client', () => mockSocket);

  let mockAuthorization = {};
  mockAuthorization.getAccessToken = jest.fn();
  jest.mock('../src/authorization.js', () => mockAuthorization);

  let mockEndpoint           = faker.internet.url();
  let mockConfig             = jest.fn();
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

    test('if access token is undefined, call authorization.getAccessToken', () => {
      return app.startSocketConnection(undefined)
        .then(() => {
          expect(mockAuthorization.getAccessToken).toHaveBeenCalled();
        });
    });

    test('sets up connected socket handler', () => {
      let accessToken    = faker.random.uuid();
      app.connectHandler = jest.fn();
      return app.startSocketConnection(accessToken)
        .then(() => {
          expect(socketObject.on).toBeCalledWith('connected', app.connectHandler);
        });
    });

    test('sets up disconnect socket handler', () => {
      let accessToken       = faker.random.uuid();
      app.disconnectHandler = jest.fn();
      return app.startSocketConnection(accessToken)
        .then(() => {
          expect(socketObject.on).toBeCalledWith('disconnect', app.disconnectHandler);
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

  describe('connectHandler', () => {
    beforeEach(() => {
      console.log = jest.fn();
      app         = require('../src/app.js');
    });

    test('logs', () => {
      return app.connectHandler()
        .then(() => {
          expect(console.log).toBeCalledWith('connected');
        });
    });
  });

  describe('connectHandler', () => {
    beforeEach(() => {
      console.error = jest.fn();
      app         = require('../src/app.js');
    });

    test('logs error', () => {
      let error = new Error(faker.lorem.word());
      return app.disconectHandler(error)
        .then(() => {
          expect(console.error).toBeCalledWith('disconnected', error);
        });
    });
  });
});