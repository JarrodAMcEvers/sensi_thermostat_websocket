export class Thermostat {
  readonly icd_id: string;
  state: any;

  constructor(data: any) {
    if (data.icd_id !== undefined) {
      this.icd_id = data.icd_id;
    }
    if (data.state !== undefined) {
      this.state = data.state;
    }
  }

  get thermostat_temp() {
    if (!this.state) return NaN;

    if (!this.state.display_temp) return NaN;

    if (this.state.temp_offset === undefined) return NaN;

    const thermostat_temp: number =
      this.state.display_temp + this.state.temp_offset;

    return thermostat_temp;
  }

  updateState(stateUpdates: any) {
    const updatedState: any = this.state
      ? Object.assign(this.state, stateUpdates)
      : stateUpdates;
    this.state = updatedState;
  }
}

export class Thermostats extends Map<string, Thermostat> {
  constructor(otherMap?: Map<string, Thermostat>) {
    super(otherMap);
  }

  updateThermostats(data: any) {
    data.forEach((thermostatRaw) => {
      let thermostat: Thermostat = null;
      if (this.has(thermostatRaw.icd_id)) {
        thermostat = this.get(thermostatRaw.icd_id);
        thermostat.updateState(thermostatRaw.state);
      } else {
        thermostat = new Thermostat(thermostatRaw);
      }
      this.set(thermostat.icd_id, thermostat);
      console.log(`thermostat temp: ${thermostat.thermostat_temp}`);
    });
  }
}
