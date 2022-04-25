import faker from 'faker';
import nock from 'nock';

const tokenEndpoint = faker.internet.url();
const email = faker.internet.userName();
const password = faker.internet.password();
const clientId = faker.random.uuid();
const clientSecret = faker.random.uuid();

jest.mock('../src/config.js', () => ({
  TOKEN_ENDPOINT: tokenEndpoint
}));

import { Authorization } from '../src/authorization.js';

describe('authorization', () => {
  jest.setTimeout(2000);
  let authorization;

  describe('login', () => {
    beforeEach(() => {
      authorization = new Authorization(
        clientId, clientSecret, email, password
      );
    });
    afterEach(() => {
      nock.cleanAll();
    });

    test('call endpoint and return token', async () => {
      const accessToken = faker.random.uuid();
      const refreshToken = faker.random.uuid();
      const response = { access_token: accessToken, refresh_token: refreshToken };

      const tokenMock = nock(tokenEndpoint)
        .post('/token', {
          grant_type: 'password',
          client_id: clientId,
          client_secret: clientSecret,
          username: email,
          password
        })
        .reply(200, response);

      await authorization.login();

      expect(authorization.accessToken).toBe(accessToken);
      expect(authorization.refreshToken).toBe(refreshToken);
      tokenMock.done();
    });

    test('rejects with error if request fails', async () => {
      const error = faker.lorem.word();
      nock(tokenEndpoint)
        .post('/token')
        .reply(400, { error });

      try {
        await authorization.login();
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err).toEqual({ error });
      }
    });

    [
      {
        property: 'clientId',
        auth: new Authorization(
          undefined, clientSecret, email, password
        )
      },
      {
        property: 'clientSecret',
        auth: new Authorization(
          clientId, undefined, email, password
        )
      },
      {
        property: 'email',
        auth: new Authorization(
          clientId, clientSecret, undefined, password
        )
      },
      {
        property: 'password',
        auth: new Authorization(
          clientId, clientSecret, email, undefined
        )
      }
    ].forEach((testCase: { property: string, auth: Authorization }) => {
      test(`does not call login endpoint if ${testCase.property} is not set in the config`, async () => {
        const tokenNock = nock(tokenEndpoint)
          .post('/token')
          .reply(400, {});

        try {
          await testCase.auth.login();
          expect(true).toBeFalsy();
        } catch (err) {
          expect(err).toEqual(new Error('Missing one or more of the required environment variables: CLIENT_ID, CLIENT_SECRET, EMAIL, PASSWORD.'));
          expect(tokenNock.isDone()).toBeFalsy();
        }
      });
    });
  });

  describe('refreshAccessToken', () => {
    const accessToken = faker.random.uuid();
    const refreshToken = faker.random.uuid();
    const response = { access_token: accessToken, refresh_token: refreshToken };

    beforeEach(async () => {
      nock(tokenEndpoint)
        .post('/token', {
          grant_type: 'password',
          client_id: clientId,
          client_secret: clientSecret,
          username: email,
          password
        })
        .reply(200, response);

      authorization = new Authorization(
        clientId, clientSecret, email, password
      );
      await authorization.login();

      nock.cleanAll();
    });

    test('refresh access token', async () => {
      const newAccessToken = faker.random.uuid();

      const tokenMock = nock(tokenEndpoint)
        .post('/token', {
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken
        })
        .reply(200, { access_token: newAccessToken });

      await authorization.refreshAccessToken();

      expect(authorization.accessToken).toBe(newAccessToken);
      expect(authorization.refreshToken).toBe(refreshToken);
      tokenMock.done();
    });

    test('rejects with error if statusCode is a 400', async () => {
      const error = faker.lorem.word();
      nock(tokenEndpoint)
        .post('/token')
        .reply(400, { error });

      try {
        await authorization.refreshAccessToken();
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err).toEqual({ error });
      }
    });
  });
});
