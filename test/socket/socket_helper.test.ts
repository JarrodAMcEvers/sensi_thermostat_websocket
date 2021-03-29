import * as faker from 'faker';

const socketObject = {
  on: jest.fn()
};
const mockSocket = jest.fn(() => socketObject);
jest.mock('socket.io-client', () => mockSocket);

const mockEndpoint = faker.internet.url();
const mockConfig = {
  socket_endpoint: mockEndpoint
};
jest.mock('../../src/config', () => mockConfig);

const socketConnection = {
  on: jest.fn()
};
const mockSocketObject = {
  startSocketConnection: jest.fn(() => socketConnection)
};
const socket = jest.fn().mockImplementation(() => mockSocketObject);
jest.mock('../../src/socket/socket', () => {
  return { Socket: socket };
});

import { SocketHelper } from '../../src/socket/socket_helper';

describe('socket_helper', () => {
  let testSocketHelper;
  beforeEach(() => {
    testSocketHelper = new SocketHelper();
  });

  describe('stateHandler', () => {
    test('sets data on message', () => {
      const data = {
        data: 'one',
        other: 'two'
      };
      testSocketHelper.stateHandler(data);

      expect(testSocketHelper.socketState).toEqual(data);
    });
  });
});
