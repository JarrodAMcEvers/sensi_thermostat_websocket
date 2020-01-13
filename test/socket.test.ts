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

import {Socket} from '../src/socket';

describe('socket', () => {
  jest.setTimeout(2000);

  test('return connection if it exists', () => {
    let connection                = faker.random.uuid();
    let socketObject              = new Socket('token');
    socketObject.socketConnection = connection;
    expect(socketObject.connection).toEqual(connection);
  });

  test('create socket connection and returns it', () => {
    let accessToken  = faker.random.uuid();

    let socketObject = new Socket(accessToken);

    expect(socketObject.connection).toEqual(mockSocketObject);

    let mockArgs: Array<2> = mockSocket.mock.calls[0];
    expect(mockArgs[0]).toBe(mockEndpoint);
    expect(mockArgs[1]).toEqual({
      transports: ['websocket'],
      path: '/thermostat',
      extraHeaders: { Authorization: `Bearer ${accessToken}` }
    });
  });
});
