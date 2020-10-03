import {Tokens, SensiOAuthResponse} from './types';
import * as config from './config';
import * as request from 'request';
import * as util from 'util';

const post = util.promisify(request.post);

export class Authorization {
  public accessToken: string;
  private refreshToken: string;

  public async login(): Promise<SensiOAuthResponse> {
    const response = await post(
      `${config.token_endpoint}/token`,
      {
        form: {
          grant_type: 'password',
          client_id: config.client_id,
          client_secret: config.client_secret,
          username: config.email,
          password: config.password
        }
      }
    );

    const body: SensiOAuthResponse = JSON.parse(response.body);
    if (response.statusCode === 400) {
      return Promise.reject(body);
    }

    this.accessToken = body.access_token;
    this.refreshToken = body.refresh_token;

    return body;
  }
}
