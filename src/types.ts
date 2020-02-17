export interface SensiOAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
  user_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  password_reset: boolean;
  eula_accepted: boolean;
  alerts: boolean;
  offers: boolean;
  fleet_enabled: boolean;
  fleet_billing_option: string;
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
}
