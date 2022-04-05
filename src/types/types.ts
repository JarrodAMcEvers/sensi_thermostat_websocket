type Epoch = number;
type FleetEnabled = true | false;
type DisplayScale = 'f' | 'c';

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
  fleet_enabled: FleetEnabled;
  fleet_billing_option: string;
}

export interface Control { }

export interface DemandStatus {
  last_start?: Epoch;
  heat: number;
  cool: number;
  fan: number;
  heat_stage?: number;
}

export interface State {
  display_temp?: number;
  display_scale?: DisplayScale;
  humidity?: number;
  control: Control;
  demand_status?: DemandStatus
}

export interface Registration {
  name: string;
  city: string;
  state: string;
  country: string;
  address1: string;
  address2?: string;
  timezone: string;
  postal_code: string;
  product_type: string;
  // contractor id might be an int
  contractor_id?: string;
  fleet_enabled: FleetEnabled;
  fleet_enabled_date?: string;
}

export interface SocketState {
  icd_id: string;
  registration: Registration;
  state: State;
}
