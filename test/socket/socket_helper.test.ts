import * as faker from 'faker';

const socketObject = {
  on: jest.fn()
};
const mockSocket   = jest.fn(() => socketObject);
jest.mock('socket.io-client', () => mockSocket);

const accessToken = faker.random.uuid();
const mockAuthorizationObject = {
  accessToken,
  login: jest.fn()
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

const mockEndpoint = faker.internet.url();
const mockConfig   = {
  socket_endpoint: mockEndpoint
};
jest.mock('../../src/config', () => mockConfig);

const socketConnection = {
  on: jest.fn()
};
const mockSocketObject = {
  startSocketConnection: jest.fn(() => socketConnection)
};
const socket           = jest.fn().mockImplementation(() => mockSocketObject);
jest.mock('../../src/socket/socket', () => {
  return {Socket: socket};
});

import * as socketHelper from '../../src/socket/socket_helper';

describe('socket_helper', () => {
  describe('startSocketConnection', () => {
    test('properly creates socket connection', async () => {
      await socketHelper.startSocketConnection();

      expect(socket).toBeCalledWith(mockAuthorizationObject);
    });
  });
});
