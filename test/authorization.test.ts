import * as faker from 'faker';
import * as nock from 'nock';

const mockConfig = {
  token_endpoint: faker.internet.url(),
  email: faker.internet.userName(),
  password: faker.internet.password(),
  client_id: faker.random.uuid(),
  client_secret: faker.random.uuid()
};
jest.mock('../src/config', () => mockConfig);

import {Authorization} from '../src/authorization';

describe('authorization', () => {
  jest.setTimeout(2000);
  let authorization;

  describe('login', () => {
    beforeEach(() => {
      authorization = new Authorization();
      nock.cleanAll();
    });

    test('call endpoint and return token', async () => {
      const accessToken  = faker.random.uuid();
      const refreshToken = faker.random.uuid();
      const response = {access_token: accessToken, refresh_token: refreshToken};

      let tokenMock = nock(mockConfig.token_endpoint)
        .post('/token', {
          grant_type: 'password',
          client_id: mockConfig.client_id,
          client_secret: mockConfig.client_secret,
          username: mockConfig.email,
          password: mockConfig.password
        })
        .reply(200, response);

      await authorization.login();

      expect(authorization.accessToken).toBe(accessToken)
      expect(authorization.refreshToken).toBe(refreshToken)
      tokenMock.done();
    });

    test('rejects with error if statusCode is a 400', async () => {
      let error = faker.lorem.word();
      nock(mockConfig.token_endpoint)
        .post('/token')
        .reply(400, {error: error});

      try {
        await authorization.login();
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err).toEqual({error: error});
      }
    });
  });

  describe('refreshAccessToken', () => {
    const accessToken  = faker.random.uuid();
    const refreshToken = faker.random.uuid();
    const response = {access_token: accessToken, refresh_token: refreshToken};

    beforeEach(async () => {
      nock(mockConfig.token_endpoint)
        .post('/token', {
          grant_type: 'password',
          client_id: mockConfig.client_id,
          client_secret: mockConfig.client_secret,
          username: mockConfig.email,
          password: mockConfig.password
        })
        .reply(200, response);

        authorization = new Authorization();
        await authorization.login();

        nock.cleanAll();
    });

    test('refresh access token', async () => {
      const newAccessToken = faker.random.uuid();

      let tokenMock = nock(mockConfig.token_endpoint)
        .post('/token', {
          grant_type: 'refresh_token',
          client_id: mockConfig.client_id,
          client_secret: mockConfig.client_secret,
          refresh_token: refreshToken
        })
        .reply(200, { access_token: newAccessToken });

      await authorization.refreshAccessToken();

      expect(authorization.accessToken).toBe(newAccessToken);
      expect(authorization.refreshToken).toBe(refreshToken);
      tokenMock.done();
    });

    test('rejects with error if statusCode is a 400', async () => {
      let error = faker.lorem.word();
      nock(mockConfig.token_endpoint)
        .post('/token')
        .reply(400, {error: error});

      try {
        await authorization.refreshAccessToken();
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err).toEqual({error: error});
      }
    });
  });
});
