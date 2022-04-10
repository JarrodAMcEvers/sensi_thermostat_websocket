import { Socket } from './socket/socket';
import { Thermostat } from './Thermostat';

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
