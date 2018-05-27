let faker = require('faker');
describe('config', () => {
  let config = {};
  let endpoint;
  beforeEach(() => {
    endpoint                    = faker.internet.url();
    process.env.socket_endpoint = endpoint;
    config                      = require('../src/config.js');
  });

  test('values come from process.env', () => {
    expect(config.socket_endpoint).toBe(endpoint);
  });
});