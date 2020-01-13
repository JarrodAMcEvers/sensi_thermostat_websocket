import * as faker from 'faker';

const socketObject = {
  on: jest.fn()
};
const mockSocket   = jest.fn(() => socketObject);
jest.mock('socket.io-client', () => mockSocket);

const mockAuthorization = {
  getTokens: jest.fn()
};
jest.mock('../src/authorization', () => mockAuthorization);

const mockEndpoint = faker.internet.url();
const mockConfig   = {
  socket_endpoint: mockEndpoint
};
jest.mock('../src/config', () => mockConfig);

import * as app from '../src/app';

describe('app', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('start', () => {
    beforeAll(() => {
      mockAuthorization.getTokens.mockResolvedValue(faker.random.number({min: 0, max: 1000}));
    });

    test('calls socketio client with correct params', async () => {
      const accessToken = faker.random.uuid();

      await app.startSocketConnection(accessToken);

      const mockArgs: Array<2> = mockSocket.mock.calls[0];
      expect(mockArgs[0]).toBe(mockEndpoint);

      // deep equal check
      expect(mockArgs[1]).toEqual({
        transports: ['websocket'],
        path: '/thermostat',
        extraHeaders: {Authorization: `Bearer ${accessToken}`}
      });
    });

    test('if access token is undefined, call authorization.getTokens', async () => {
      await app.startSocketConnection(undefined);

      expect(mockAuthorization.getTokens).toHaveBeenCalled();
    });

    test('does not call authorization.getTokens if token is !undefined', async () => {
      await app.startSocketConnection('some token');

      expect(mockAuthorization.getTokens).toHaveBeenCalledTimes(0);
    });

    test('calls socketio client with access token from getTokens', async () => {
      let token                   = faker.random.uuid();
      mockAuthorization.getTokens = jest.fn(() => Promise.resolve({access_token: token}));

      await app.startSocketConnection(undefined);

      let mockArgs: Array<any> = mockSocket.mock.calls[0];

      expect(mockArgs[1]).toEqual({
        transports: ['websocket'],
        path: '/thermostat',
        extraHeaders: {Authorization: `Bearer ${token}`}
      });
    });

    test('returns socket', async () => {
      const accessToken = faker.random.uuid();
      const socket      = await app.startSocketConnection(accessToken);
      expect(socket).toEqual(socketObject);
    });
  });
});
