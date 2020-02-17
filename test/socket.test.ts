import * as faker from 'faker';

let mockEndpoint           = faker.internet.url();
let mockConfig            = {
  socket_endpoint: mockEndpoint
};
jest.mock('../src/config', () => mockConfig);

const mockSocketObject = {
  on: jest.fn()
};
const mockSocket = jest.fn(() => mockSocketObject);
jest.mock('socket.io-client', () => mockSocket);

const socketHelper = {
  connectHandler: jest.fn(),
  disconnectHandler: jest.fn(),
  errorHandler: jest.fn(),
};
jest.mock('../src/socket_helper', () => socketHelper);

import {Socket} from '../src/socket';

describe('socket', () => {
  let accessToken;
  beforeEach(() => {
    accessToken = faker.random.uuid();
  });
  jest.setTimeout(2000);

  test('return socket connection, if it exists', () => {
    let connection                = {
      on: jest.fn()
    };
    let socketObject              = new Socket('token');
    socketObject.socketConnection = connection;

    const socketConnection = socketObject.startSocketConnection();

    expect(socketConnection).toEqual(connection);
    expect(mockSocket).not.toHaveBeenCalled();
  });

  test('creates socket connection and returns it', () => {
    let socketObject = new Socket(accessToken);

    expect(socketObject.startSocketConnection()).toEqual(mockSocketObject);

    let mockArgs: Array<2> = mockSocket.mock.calls[0];
    expect(mockArgs[0]).toBe(mockEndpoint);
    expect(mockArgs[1]).toEqual({
      transports: ['websocket'],
      path: '/thermostat',
      extraHeaders: { Authorization: `Bearer ${accessToken}` }
    });
  });

  test('sets up connected, disconnect, and error handlers', async () => {
    const socketObject = new Socket(accessToken);

    const connection = socketObject.startSocketConnection();

    expect(connection.on).toHaveBeenCalledWith('connected', socketHelper.connectHandler);
    expect(connection.on).toHaveBeenCalledWith('disconnect', socketHelper.disconnectHandler);
    expect(connection.on).toHaveBeenCalledWith('error', socketHelper.errorHandler);
  });
});
