let faker = require('faker');

describe('index', () => {
  let index;

  let configToken = faker.random.uuid();
  let config      = { access_token: configToken };
  let mockConfig  = jest.mock('../src/config.js', () => config);

  let startMock = jest.fn(() => Promise.resolve());
  let app       = { startSocketConnection: startMock };
  let appMock   = jest.mock('../src/app.js', () => app);

  test('calls app.start with access_token from config', () => {
    index = require('../src/index.js');
    expect(startMock).toHaveBeenCalledWith(configToken);
  });
});