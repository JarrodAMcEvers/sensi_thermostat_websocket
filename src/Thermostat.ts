import { Socket } from "./socket/socket";
import { Registration } from "./types/types";

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

  // The temperature read
  get thermostatSensor_temp() {
    if (!this.state) return NaN;

    if (!this.state.display_temp) return NaN;

    if (this.state.temp_offset === undefined) return NaN;

    const thermostat_temp: number =
      this.state.display_temp - this.state.temp_offset;

    return thermostat_temp;
  }

  update(stateUpdates: any) {
    if (stateUpdates.registration)
      this.registration = stateUpdates.registration;
    if (stateUpdates.state) this.updateState(stateUpdates.state);
  }

  updateState(stateUpdates: any) {
    const updatedState: any = this.state
      ? Object.assign(this.state, stateUpdates)
      : stateUpdates;
    this.state = updatedState;
  }

  setThermostatTempToSensorTemp(sensorTemperature: number) {
    console.log(`Tempature used in thermostat: ${this.state.display_temp}`);
    console.log(`Tempature at sensor: ${sensorTemperature}`);
    const currentTempAtThermostatSensor = this.thermostatSensor_temp;
    console.log(`Tempature at thermostat: ${currentTempAtThermostatSensor}`);
    const temperatureDifference =
      sensorTemperature - currentTempAtThermostatSensor;
    console.log(`Tempature difference between sensor and thermostat: ${temperatureDifference}`);
    const currentTempOffset = this.state.temp_offset;
    console.log(`Current offset: ${currentTempOffset}`);
    const scale = 2;
    const temperatureDifferenceRounded =
      Math.round(temperatureDifference * scale) / scale;
    console.log(`Proposed offset: ${temperatureDifferenceRounded}`);
    const absChangeInTempOffset = Math.abs(temperatureDifferenceRounded - currentTempOffset);
    if (absChangeInTempOffset < 1 || Math.abs(temperatureDifference - currentTempOffset) < 1) {
      console.log("No change made");
      return;
    }
    console.log(`Changing offset by ${absChangeInTempOffset} to ${temperatureDifferenceRounded}`);
    this.setThermostatOffset(temperatureDifferenceRounded);
  }

  setThermostatOffset(offset: number) {
    this.socket.emit("set_temp_offset", {
      icd_id: this.icd_id,
      value: offset,
    });
    // update the internal state just in case we don't get a response back before attempting the next update
    // TODO - really do state management and check for failures
    this.state.display_temp = this.thermostatSensor_temp + offset;
    this.state.temp_offset = offset;

  }

}

export class Thermostats extends Map<string, Thermostat> {
  socket: Socket = null;

  constructor(socket: Socket, otherMap?: Map<string, Thermostat>) {
    super(otherMap);
    this.socket = socket;
  }

  updateThermostats(data: any) {
    data.forEach((thermostatRaw) => {
      let thermostat: Thermostat = null;
      if (this.has(thermostatRaw.icd_id)) {
        thermostat = this.get(thermostatRaw.icd_id);
        thermostat.update(thermostatRaw);
      } else {
        thermostat = new Thermostat(this.socket, thermostatRaw);
      }
      this.set(thermostat.icd_id, thermostat);
    });
  }
}
