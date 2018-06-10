let faker = require('faker');
let nock  = require('nock');

describe('authorization', () => {
  jest.setTimeout(2000);
  let authorization = {};

  let mockEndpoint          = faker.internet.url();
  let mockUsername          = faker.internet.userName();
  let mockPassword          = faker.internet.password();
  let mockConfig            = {};
  mockConfig.token_endpoint = mockEndpoint;
  mockConfig.username       = mockUsername;
  mockConfig.password       = mockPassword;
  jest.mock('../src/config.js', () => mockConfig);

  describe('getAccessToken', () => {
    beforeEach(() => {
      nock.cleanAll();
      authorization = require('../src/authorization.js');
    });

    test('call endpoint and return token', () => {
      let tokenFromEndpoint = faker.random.uuid();
      let tokenMock = nock(mockEndpoint)
        .post('/token')
        .reply(200, { access_token: tokenFromEndpoint });

      return authorization.getAccessToken()
        .then(token => {
          expect(token).toBe(tokenFromEndpoint);
          tokenMock.done();
        });
    });
  });
});