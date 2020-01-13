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

  describe('startSocketConnection', () => {
    beforeAll(() => {
      mockAuthorization.getTokens.mockResolvedValue(faker.random.number({min: 0, max: 1000}));
    });

    test('get access token for socket connection', async () => {
      await app.startSocketConnection();

      expect(mockAuthorization.getTokens).toHaveBeenCalled();
    });

    test('properly creates socket connection', async () => {
      const accessToken = faker.random.uuid();
      mockAuthorization.getTokens.mockResolvedValueOnce({ access_token: accessToken });

      await app.startSocketConnection();

      const mockArgs: Array<any> = mockSocket.mock.calls[0];
      expect(mockArgs[0]).toBe(mockEndpoint);

      // deep equal check
      expect(mockArgs[1]).toEqual({
        transports: ['websocket'],
        path: '/thermostat',
        extraHeaders: {Authorization: `Bearer ${accessToken}`}
      });
    });

    test('returns socket', async () => {
      const socket      = await app.startSocketConnection();

      expect(socket).toEqual(socketObject);
    });
  });
});
