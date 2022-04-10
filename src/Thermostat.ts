import { Socket } from './socket/socket';
import { Registration } from './types/types';

export class Thermostat {
  readonly icd_id: string;
  state: any;
  registration: Registration;
  socket: Socket = null;

  constructor(socket: Socket, data: any) {
    if (data.icd_id !== undefined) {
      this.icd_id = data.icd_id;
    }
    if (data.state !== undefined) {
      this.state = data.state;
    }
    if (data.registration !== undefined) {
      this.registration = data.registration;
    }
    if (socket) this.socket = socket;
  }

  // The temperature read at the thermostat
  get thermostatSensor_temp(): number {
    if (!this.state) return NaN;

    if (this.state.temp_offset === undefined) return NaN;

    const thermostatTemp: number = this.thermostat_temp - this.state.temp_offset;

    return thermostatTemp;
  }

  // The temperature on the display
  get thermostat_temp(): number {
    if (!this.state) return NaN;

    if (!this.state.display_temp) return NaN;

    return this.state.display_temp;
  }

  // is the system cooling
  get is_running_cool(): boolean {
    return this.state?.demand_status?.cool > 1;
  }

  // is the system heating
  get is_running_heat(): boolean {
    return this.state?.demand_status?.heat > 1;
  }

  // is the system using aux heat
  get is_running_auxheat(): boolean {
    return this.state?.demand_status?.aux > 1;
  }

  // is the system running
  get is_running(): boolean {
    const isRunning: boolean = this.is_running_cool || this.is_running_heat;
    return isRunning;
  }

  update(stateUpdates: any) {
    if (stateUpdates.registration) this.registration = stateUpdates.registration;
    if (stateUpdates.state) this.updateState(stateUpdates.state);
  }

  updateState(stateUpdates: any) {
    // merge the demand status objects if it's in the update
    if (stateUpdates.demand_status && this?.state?.demand_status) {
      const demandStatus = { ...this.state.demand_status, ...stateUpdates.demand_status };
      // eslint-disable-next-line no-param-reassign
      stateUpdates.demand_status = demandStatus;
    }

    // merge the relay status objects if it's in the update
    if (stateUpdates.relay_status && this?.state?.relay_status) {
      const relayStatus = { ...this.state.relay_status, ...stateUpdates.relay_status };
      // eslint-disable-next-line no-param-reassign
      stateUpdates.relay_status = relayStatus;
    }

    const updatedState: any = this.state
      ? { ...this.state, ...stateUpdates }
      : stateUpdates;
    this.state = updatedState;
  }

  setThermostatTempToSensorTemp(sensorTemperature: number) {
    // console.log(`Tempature used in thermostat: ${this.state.display_temp}`);
    // console.log(`Tempature at sensor: ${sensorTemperature}`);
    const currentTempAtThermostatSensor = this.thermostatSensor_temp;
    // console.log(`Tempature at thermostat: ${currentTempAtThermostatSensor}`);
    const temperatureDifference = sensorTemperature - currentTempAtThermostatSensor;
    // console.log(`Tempature difference between sensor and thermostat: ${temperatureDifference}`);
    const currentTempOffset = this.state.temp_offset;
    // console.log(`Current offset: ${currentTempOffset}`);
    const scale = 2;
    const temperatureDifferenceRounded = Math.round(temperatureDifference * scale) / scale;
    // console.log(`Proposed offset: ${temperatureDifferenceRounded}`);
    const absChangeInTempOffset = Math.abs(temperatureDifferenceRounded - currentTempOffset);
    if (absChangeInTempOffset < 1 || Math.abs(temperatureDifference - currentTempOffset) < 1) {
      // console.log("No change made");
      return;
    }
    console.log(`Changing offset by ${absChangeInTempOffset} to ${temperatureDifferenceRounded}`);
    // this.setThermostatOffset(temperatureDifferenceRounded);
  }

  setThermostatOffset(offset: number) {
    this.socket.emit('set_temp_offset', {
      icd_id: this.icd_id,
      value: offset,
    });
    // eslint-disable-next-line max-len
    // update the internal state just in case we don't get a response back before attempting the next update
    // TODO - really do state management and check for failures
    this.state.display_temp = this.thermostatSensor_temp + offset;
    this.state.temp_offset = offset;
  }
}
