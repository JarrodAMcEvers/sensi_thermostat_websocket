import 'jest-extended';
import * as faker from 'faker';

const accessToken = faker.random.uuid();
const mockAuthorizationObject = {
  accessToken,
  login: jest.fn().mockResolvedValue(null),
  refreshAccessToken: jest.fn().mockResolvedValue(null),
  isRefreshTokenAvailable: jest.fn()
}
const mockAuthorization = jest.fn().mockImplementation(() => {
  return mockAuthorizationObject;
})
import {Authorization} from '../../src/authorization';
jest.mock('../../src/authorization', () => {
    return {
      Authorization: mockAuthorization
    }
});

let mockEndpoint           = faker.internet.url();
let mockConfig            = {
  socket_endpoint: mockEndpoint
};
jest.mock('../../src/config', () => mockConfig);

const mockSocketObject = {
  on: jest.fn()
};
let mockSocket = jest.fn(() => mockSocketObject);
jest.mock('socket.io-client', () => mockSocket);

const socketHelper = {
  connectHandler: jest.fn(),
  disconnectHandler: jest.fn(),
  stateHandler: jest.fn()
};
jest.mock('../../src/socket/socket_helper', () => socketHelper);

import {Socket} from '../../src/socket/socket';

describe('socket', () => {
  jest.setTimeout(2000);
  console.error = jest.fn();
  let authorization;

  beforeEach(() => {
    authorization = new Authorization();
  });

  test('return socket connection, if it exists', async () => {
    let connection                = {
      on: jest.fn()
    };
    let socketObject              = new Socket(authorization);
    socketObject.socketConnection = connection;

    const socketConnection = await socketObject.startSocketConnection();

    expect(socketConnection).toEqual(connection);
    expect(mockSocket).not.toHaveBeenCalled();
  });

  test('login', () => {
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
    let socketObject = new Socket(authorization);

    expect(await socketObject.startSocketConnection()).toEqual(mockSocketObject);

    let mockArgs: Array<2> = mockSocket.mock.calls[0];
    expect(mockArgs[0]).toBe(mockEndpoint);
    expect(mockArgs[1]).toEqual({
      transports: ['websocket'],
      path: '/thermostat',
      extraHeaders: { Authorization: `Bearer ${authorization.accessToken}` }
    });
  });

  test('sets up connect, disconnect, and error handlers', async () => {
    const socketObject = new Socket(authorization);

    const connection = await socketObject.startSocketConnection();

    expect(connection.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(connection.on).toHaveBeenCalledWith('disconnect', socketHelper.disconnectHandler);
    expect(connection.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  test('listens for state messages after connecting', async () => {
    const socketObject = new Socket(authorization);

    const connection = await socketObject.startSocketConnection();
    const handler = connection.on.mock.calls.find(x => x[0] === 'connect')[1];
    await handler();

    expect(connection.on).toHaveBeenCalledWith('state', socketHelper.stateHandler);
  });

  test('reestablish socket connection if jwt expired error comes through', async () => {
    const socketObject = new Socket(authorization);
    const error = {
      message: 'jwt expired',
      code: 'invalid_token',
      type: 'UnauthorizedError'
    };

    const connection = await socketObject.startSocketConnection();
    const handler = connection.on.mock.calls.find(x => x[0] === 'error')[1];
    mockSocket.mockClear();
    await handler(error);

    let mockArgs: Array<2> = mockSocket.mock.calls[0];
    expect(mockArgs[0]).toBe(mockEndpoint);
    expect(mockArgs[1]).toEqual({
      transports: ['websocket'],
      path: '/thermostat',
      extraHeaders: { Authorization: `Bearer ${authorization.accessToken}` }
    });
  });
});
