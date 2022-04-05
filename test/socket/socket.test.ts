import 'jest-extended';
import * as faker from 'faker';

// authorization mock
const accessToken = faker.random.uuid();
const mockAuthorizationObject = {
  accessToken,
  login: jest.fn().mockResolvedValue(null),
  refreshAccessToken: jest.fn().mockResolvedValue(null),
  isRefreshTokenAvailable: jest.fn()
};
const mockAuthorization = jest.fn().mockImplementation(() => mockAuthorizationObject);
import { Authorization } from '../../src/authorization';

jest.mock('../../src/authorization', () => ({
  Authorization: mockAuthorization
}));

// config mock
// let mockEndpoint = faker.internet.url();
const mockConfig = {
  SOCKET_ENDPOINT: faker.internet.url()
};
jest.mock('../../src/config', () => mockConfig);

// socket-io client mock
const mockSocketObject = {
  connected: false,
  close: jest.fn(),
  on: jest.fn()
};
const mockSocket = jest.fn(() => mockSocketObject);
jest.mock('socket.io-client', () => mockSocket);

// socket helper mock
const mockSocketHelperObject = {
  state: '',
  stateHandler: jest.fn(),
  disconnectHandler: jest.fn()
};
const socketHelper = jest.fn().mockImplementation(() => mockSocketHelperObject);
jest.mock('../../src/socket/socket_helper', () => ({ SocketHelper: socketHelper }));

import { Socket } from '../../src/socket/socket';

describe('socket', () => {
  jest.setTimeout(2000);
  console.error = jest.fn();
  let authorization;

  beforeEach(() => {
    authorization = new Authorization(
      '', '', '', ''
    );
    mockSocketHelperObject.stateHandler.mockImplementation(() => true);
  });

  test('return socket connection if the socket is connected', async () => {
    const connection = {
      connected: true,
      on: jest.fn()
    };
    const socketObject = new Socket(authorization);
    socketObject.socketConnection = connection;

    const socketConnection = await socketObject.startSocketConnection();

    expect(socketConnection).toBe(connection);
    expect(mockSocket).not.toHaveBeenCalled();
  });

  test('login if refresh token is not available', () => {
    mockAuthorizationObject.isRefreshTokenAvailable.mockReturnValue(false);
    const socket = new Socket(authorization);
    socket.startSocketConnection();

    expect(mockAuthorizationObject.login).toHaveBeenCalled();
    expect(mockAuthorizationObject.refreshAccessToken).not.toHaveBeenCalled();
    expect(mockAuthorizationObject.login).toHaveBeenCalledBefore(mockSocket);
  });

  test('get new access token if a refresh token is available', () => {
    mockAuthorizationObject.isRefreshTokenAvailable.mockReturnValue(true);
    const socket = new Socket(authorization);
    socket.startSocketConnection();

    expect(mockAuthorizationObject.refreshAccessToken).toHaveBeenCalled();
    expect(mockAuthorizationObject.login).not.toHaveBeenCalled();
    expect(mockAuthorizationObject.refreshAccessToken).toHaveBeenCalledBefore(mockSocket);
  });

  test('creates socket connection and returns it', async () => {
    const socketObject = new Socket(authorization);

    expect(await socketObject.startSocketConnection()).toEqual(mockSocketObject);

    const mockArgs: Array<2> = mockSocket.mock.calls[0];
    expect(mockArgs[0]).toBe(mockConfig.SOCKET_ENDPOINT);
    expect(mockArgs[1]).toEqual({
      transports: ['websocket'],
      path: '/thermostat',
      extraHeaders: { Authorization: `Bearer ${authorization.accessToken}` }
    });
  });

  test('sets up socket helper and connect, disconnect, and error handlers', async () => {
    const socketObject = new Socket(authorization);

    const connection = await socketObject.startSocketConnection();

    expect(socketHelper).toHaveBeenCalled();
    expect(connection.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(connection.on).toHaveBeenCalledWith('disconnect', mockSocketHelperObject.disconnectHandler);
    expect(connection.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  describe('state event handler', () => {
    test('listens for state messages after connecting', async () => {
      const socketObject = new Socket(authorization);

      const connection = await socketObject.startSocketConnection();
      const handler = connection.on.mock.calls.find((x) => x[0] === 'connect')[1];
      await handler();
      const stateHandler = connection.on.mock.calls.find((x) => x[0] === 'state')[1];
      await stateHandler('data');

      expect(mockSocketHelperObject.stateHandler).toHaveBeenCalledWith('data');
    });
  });

  test('reestablish socket connection if jwt expired error comes through', async () => {
    const socketObject = new Socket(authorization);
    const error = {
      message: 'jwt expired',
      code: 'invalid_token',
      type: 'UnauthorizedError'
    };

    const connection = await socketObject.startSocketConnection();
    const handler = connection.on.mock.calls.find((x) => x[0] === 'error')[1];
    mockSocket.mockClear();
    mockSocketObject.close.mockClear();
    await handler(error);

    const mockArgs: Array<2> = mockSocket.mock.calls[0];
    expect(mockSocketObject.close).toHaveBeenCalledBefore(mockSocket);
    expect(mockArgs[0]).toBe(mockConfig.SOCKET_ENDPOINT);
    expect(mockArgs[1]).toEqual({
      transports: ['websocket'],
      path: '/thermostat',
      extraHeaders: { Authorization: `Bearer ${authorization.accessToken}` }
    });
  });
});
