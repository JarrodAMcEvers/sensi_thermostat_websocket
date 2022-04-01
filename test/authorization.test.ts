import * as faker from 'faker';
import * as nock from 'nock';

const token_endpoint = faker.internet.url();
const email = faker.internet.userName();
const password = faker.internet.password();
const client_id = faker.random.uuid();
const client_secret = faker.random.uuid();
const mockConfig = {
  token_endpoint: token_endpoint,
  email: email,
  password: password,
  client_id: client_id,
  client_secret: client_secret
};
jest.mock('../src/config', () => mockConfig);

import { Authorization } from '../src/authorization';

describe('authorization', () => {
  jest.setTimeout(2000);
  let authorization;

  describe('login', () => {
    beforeEach(() => {
      authorization = new Authorization();
    });
    afterEach(() => {
      nock.cleanAll();
    })

    test('call endpoint and return token', async () => {
      const accessToken = faker.random.uuid();
      const refreshToken = faker.random.uuid();
      const response = { access_token: accessToken, refresh_token: refreshToken };

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

    test('rejects with error if request fails', async () => {
      let error = faker.lorem.word();
      nock(mockConfig.token_endpoint)
        .post('/token')
        .reply(400, { error: error });

      try {
        await authorization.login();
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err).toEqual({ error: error });
      }
    });

    ['client_id', 'client_secret', 'email', 'password'].forEach(testCase => {
      test(`does not call login endpoint if ${testCase} is not set in the config`, async () => {
        const value = JSON.parse(JSON.stringify(mockConfig[`${testCase}`]));
        mockConfig[`${testCase}`] = null;
        const tokenNock = nock(mockConfig.token_endpoint)
          .post('/token')
          .reply(400, {});

        try {
          await authorization.login();
          expect(true).toBeFalsy();
        } catch (err) {
          expect(tokenNock.isDone()).toBeFalsy();
          mockConfig[`${testCase}`] = value;
        }
      });
    });
  });

  describe('refreshAccessToken', () => {
    const accessToken = faker.random.uuid();
    const refreshToken = faker.random.uuid();
    const response = { access_token: accessToken, refresh_token: refreshToken };

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
        .reply(400, { error: error });

      try {
        await authorization.refreshAccessToken();
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err).toEqual({ error: error });
      }
    });
  });
});
