let faker = require('faker');
let nock  = require('nock');

describe('socket', () => {
  jest.setTimeout(2000);
  let socket = {};

  let mockEndpoint           = faker.internet.url();
  let mockConfig            = {};
  mockConfig.socket_endpoint = mockEndpoint;
  jest.mock('../src/config.js', () => mockConfig);

  let mockSocketObject = jest.fn();
  mockSocketObject.on  = jest.fn();

  let mockSocket = jest.fn(() => mockSocketObject);
  jest.mock('socket.io-client', () => mockSocket);

  socket = require('../src/socket.js');

  test('return connection if it exists', () => {
    let connection                = faker.random.uuid();
    let socketObject              = new socket();
    socketObject.socketConnection = connection;
    expect(socketObject.connection).toEqual(connection);
  });

  test('creates socket connection and returns it', () => {
    let socketObject = new socket();
    socketObject.connection;
  });

  test('create socket connection and returns it', () => {
    let accessToken  = faker.random.uuid();

    let socketObject = new socket(accessToken);

    expect(socketObject.connection).toEqual(mockSocketObject);

    let mockArgs = mockSocket.mock.calls[0];
    expect(mockArgs[0]).toBe(mockEndpoint);
    expect(mockArgs[1]).toEqual({
      transports: ['websocket'],
      path: '/thermostat',
      extraHeaders: { Authorization: `Bearer ${accessToken}` }
    });
  });
});