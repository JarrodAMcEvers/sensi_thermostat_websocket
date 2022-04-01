import { SensiOAuthResponse } from './types/types';
import * as config from './config';
// needed because of CommonJS module
const axios = require('axios').default;

export class Authorization {
  public accessToken: string = null;
  private refreshToken: string = null;

  public async login(): Promise<void> {
    try {
      if (config.client_id == null || config.client_secret == null || config.email == null || config.password == null) {
        return;
      }

      const response = await axios({
        url: `${config.token_endpoint}/token`,
        method: 'POST',
        data: {
          grant_type: 'password',
          client_id: config.client_id,
          client_secret: config.client_secret,
          username: config.email,
          password: config.password
        }
      });

      const body: SensiOAuthResponse = response.data;

      this.accessToken = body.access_token;
      this.refreshToken = body.refresh_token;
    } catch (err) {
      return Promise.reject(err.response.data);
    }
  }

  public async refreshAccessToken(): Promise<void> {
    try {
      const response = await axios({
        url: `${config.token_endpoint}/token`,
        method: 'POST',
        data: {
          grant_type: 'refresh_token',
          client_id: config.client_id,
          client_secret: config.client_secret,
          refresh_token: this.refreshToken
        }
      });

      const body: SensiOAuthResponse = response.data;

      this.accessToken = body.access_token;
    } catch (err) {
      return Promise.reject(err.response.data);
    }
  }

  public isRefreshTokenAvailable(): boolean {
    return this.refreshToken !== null;
  }
}
