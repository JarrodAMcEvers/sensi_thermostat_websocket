import * as faker from 'faker';
import * as nock from 'nock';

const mockConfig = {
  token_endpoint: faker.internet.url(),
  username: faker.internet.userName(),
  password: faker.internet.password(),
  client_id: faker.random.uuid(),
  client_secret: faker.random.uuid()
};
jest.mock('../src/config', () => mockConfig);

import * as authorization from '../src/authorization';

describe('authorization', () => {
  jest.setTimeout(2000);

  describe('getTokens', () => {
    beforeEach(() => {
      nock.cleanAll();
    });

    test('call endpoint and return token', async () => {
      let accessToken  = faker.random.uuid();
      let refreshToken = faker.random.uuid();

      let tokenMock = nock(mockConfig.token_endpoint)
        .post('/token', {
          grant_type: 'password',
          client_id: mockConfig.client_id,
          client_secret: mockConfig.client_secret,
          username: mockConfig.username,
          password: mockConfig.password
        })
        .reply(200, {access_token: accessToken, refresh_token: refreshToken});

      const token = await authorization.getTokens();

      expect(token).toEqual({access_token: accessToken, refresh_token: refreshToken});
      tokenMock.done();
    });

    test('rejects with error if statusCode is a 400', async () => {
      let error = faker.lorem.word();
      nock(mockConfig.token_endpoint)
        .post('/token')
        .reply(400, {error: error});

      try {
        await authorization.getTokens();
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err).toEqual({error: error});
      }
    });
  });
});
