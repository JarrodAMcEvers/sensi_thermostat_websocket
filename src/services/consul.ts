import Consul = require('consul');
import * as config from '../config';


export class ConsulKeyStore {
    private consul;
    constructor() {
        this.consul = new Consul({
            promisify: true,
            host: config.consul_endpoint
        });
    }

    async getJSONValue(key: string): Promise<object> {
        const result = await this.consul.kv.get(key);
        try {
            return JSON.parse(result.Value);
        } catch (error) {
            console.error('Could not JSON parse value from key store', error);
            return null;
        }
    }
}