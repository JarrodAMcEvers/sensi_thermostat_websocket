import * as faker from 'faker';

const socketObject = {
  on: jest.fn()
};
const mockSocket = jest.fn(() => socketObject);
jest.mock('socket.io-client', () => mockSocket);

const mockEndpoint = faker.internet.url();
const mockConfig = {
  socketEndpoint: mockEndpoint
};
jest.mock('../../src/config', () => mockConfig);

const socketConnection = {
  on: jest.fn()
};
const mockSocketObject = {
  startSocketConnection: jest.fn(() => socketConnection)
};
const socket = jest.fn().mockImplementation(() => mockSocketObject);
jest.mock('../../src/socket/socket', () => ({ Socket: socket }));

import { SocketHelper } from '../../src/socket/socket_helper';

describe('socket_helper', () => {
  let testSocketHelper;
  beforeEach(() => {
    testSocketHelper = new SocketHelper();
  });

  describe('stateHandler', () => {
    // placeholder test for now
    // jest complains if a describe block does not have at least one test.
    test('sets data on message', async () => {
      const data = {
        data: 'one',
        other: 'two'
      };
      await testSocketHelper.stateHandler(data);

      expect(testSocketHelper.state).toEqual(data);
    });
  });
});
