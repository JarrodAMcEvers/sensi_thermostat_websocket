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

  setTempOffset(sensorTemperature: number) {
    const currentTempAtThermostatSensor = this.thermostatSensor_temp;
    const temperatureDifference =
      sensorTemperature - currentTempAtThermostatSensor;
    const scale = 2;
    const temperatureDifferenceRounded =
      Math.round(temperatureDifference * scale) / scale;
    const changeInOffset =
      this.state.temp_offset - temperatureDifferenceRounded;
    if (changeInOffset != 0) {
      console.log(`Change temperature by ${changeInOffset}`);
      this.socket.emit("set_temp_offset", {
        icd_id: this.icd_id,
        value: temperatureDifferenceRounded,
      });
    }
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
      console.log(`thermostat temp: ${thermostat.thermostatSensor_temp}`);
    });
  }
}
