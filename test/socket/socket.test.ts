import * as faker from 'faker';

let mockEndpoint           = faker.internet.url();
let mockConfig            = {
  socket_endpoint: mockEndpoint
};
jest.mock('../../src/config', () => mockConfig);

const mockSocketObject = {
  on: jest.fn()
};
const mockSocket = jest.fn(() => mockSocketObject);
jest.mock('socket.io-client', () => mockSocket);

const socketHelper = {
  connectHandler: jest.fn(),
  disconnectHandler: jest.fn(),
  errorHandler: jest.fn(),
  stateHandler: jest.fn()
};
jest.mock('../../src/socket/socket_helper', () => socketHelper);

import {Socket} from '../../src/socket/socket';

describe('socket', () => {
  jest.setTimeout(2000);
  let accessToken;

  beforeEach(() => {
    accessToken = faker.random.uuid();
  });

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

    expect(connection.on).toHaveBeenCalledWith('connected', expect.any(Function));
    expect(connection.on).toHaveBeenCalledWith('disconnect', socketHelper.disconnectHandler);
    expect(connection.on).toHaveBeenCalledWith('error', socketHelper.errorHandler);
  });

  test('listens for state messages after connecting', async () => {
    const socketObject = new Socket(accessToken);

    const connection = socketObject.startSocketConnection();
    const handler = connection.on.mock.calls.find(x => x[0] === 'connected')[1];
    await handler();

    expect(connection.on).toHaveBeenCalledWith('state', socketHelper.stateHandler);
  });
});
