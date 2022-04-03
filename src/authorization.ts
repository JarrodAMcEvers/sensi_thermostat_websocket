import { SensiOAuthResponse } from './types/types';
import * as config from './config';
// needed because of CommonJS module
const axios = require('axios').default;

export class Authorization {
  private clientId: string;
  private clientSecret: string;
  private email: string;
  private password: string;

  public accessToken: string = null;
  private refreshToken: string = null;

  constructor(client_id: string, client_secret: string, email: string, password: string) {
    this.clientId = client_id;
    this.clientSecret = client_secret;
    this.email = email;
    this.password = password;
  }

  public async login(): Promise<void> {
    try {
      if (!this.clientId || !this.clientSecret || !this.email || !this.password) {
        return Promise.reject({ message: 'Missing one or more of the required environment variables: CLIENT_ID, CLIENT_SECRET, EMAIL, PASSWORD.' });
      }

      const response = await axios({
        url: `${config.token_endpoint}/token`,
        method: 'POST',
        data: {
          grant_type: 'password',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          username: this.email,
          password: this.password
        }
      });

      const body: SensiOAuthResponse = response.data;
      console.log('body', body);

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
          client_id: this.clientId,
          client_secret: this.clientSecret,
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
