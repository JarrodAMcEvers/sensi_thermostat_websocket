let faker = require('faker');

describe('index', () => {
  let index = {};
  let configToken = faker.random.uuid();
  let config = jest.mock('../src/config.js', () => {
    return {
      access_token: configToken
    };
  });

  let startMock = jest.fn();
  let app = jest.mock('../src/app.js', () => {
    return {
      startSocketConnection: startMock
    };
  });

  test('calls app.start with access_token from config', () => {
    index = require('../src/index.js');
    expect(startMock).toHaveBeenCalledWith(configToken);
  });
});