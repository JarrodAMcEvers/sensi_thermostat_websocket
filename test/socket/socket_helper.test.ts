import { SocketHelper } from '../../src/socket/socket_helper.js';

describe('socket_helper', () => {
  describe('stateHandler', () => {
    // placeholder test for now
    // jest complains if a describe block does not have at least one test.
    test('sets data on message', async () => {
      const logSpy = jest.spyOn(console, 'log');
      const data = {
        data: 'one',
        other: 'two'
      };
      SocketHelper.stateHandler(data);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(JSON.stringify(data)));
    });
  });
});
