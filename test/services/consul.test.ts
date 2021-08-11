import 'jest-extended';
import * as faker from 'faker';

const mockEndpoint = faker.internet.url();
const mockConfig = {
  consul_endpoint: mockEndpoint
};
jest.mock('../../src/config', () => mockConfig);

const mockConsulObject = {
    kv: {
        get: jest.fn()
    }
};
const consul = jest.fn().mockImplementation(() => mockConsulObject);
jest.mock('consul', () => {
    return consul;
});

import { ConsulKeyStore } from '../../src/services/consul';

describe('Consul', () => {
    describe('ConsulKeyStore', () => {
        test('creates consul object with correct parameters', () => {
            new ConsulKeyStore();

            expect(consul).toHaveBeenCalledWith({
                promisify: true,
                host: mockConfig.consul_endpoint
            });
        });

        test('getJSONValue returns parsed JSON from key store', async () => {
            const fakeValue = { name: faker.company.companyName() };
            mockConsulObject.kv.get.mockResolvedValueOnce({
                Value: JSON.stringify(fakeValue)
            })
            const testObject = new ConsulKeyStore();

            const value = await testObject.getJSONValue('key');

            expect(mockConsulObject.kv.get).toHaveBeenCalledWith('key');
            expect(value).toStrictEqual(fakeValue);
        });

        test('getJSONValue returns null if value is not valid JSON', async () => {
            const fakeValue = '{ name: invalid }';
            mockConsulObject.kv.get.mockResolvedValueOnce({
                Value: fakeValue
            })
            const testObject = new ConsulKeyStore();

            const value = await testObject.getJSONValue('key');

            expect(value).toBeNull();
        });
    });
});
