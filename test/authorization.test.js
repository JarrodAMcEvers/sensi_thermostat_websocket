let faker = require('faker');
let nock  = require('nock');

describe('authorization', () => {
  jest.setTimeout(2000);
  let authorization = {};

  let mockConfig            = {};
  mockConfig.token_endpoint = faker.internet.url();
  mockConfig.username       = faker.internet.userName();
  mockConfig.password       = faker.internet.password();
  mockConfig.client_id      = faker.random.uuid();
  mockConfig.client_secret  = faker.random.uuid();
  jest.mock('../src/config.js', () => mockConfig);

  describe('getAccessToken', () => {
    beforeEach(() => {
      nock.cleanAll();
      authorization = require('../src/authorization.js');
    });

    test('call endpoint and return token', () => {
      let tokenFromEndpoint = faker.random.uuid();
      let tokenMock         = nock(mockConfig.token_endpoint)
        .post('/token', {
          grant_type: 'password',
          client_id: mockConfig.client_id,
          client_secret: mockConfig.client_secret,
          username: mockConfig.username,
          password: mockConfig.password
        })
        .reply(200, { access_token: tokenFromEndpoint });

      return authorization.getAccessToken()
        .then(token => {
          expect(token).toBe(tokenFromEndpoint);
          tokenMock.done();
        });
    });
  });
});