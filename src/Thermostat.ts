import { Socket } from './socket/socket.js';
import { Registration } from './types/types.js';
import _ from 'lodash';

export class Thermostat {
  readonly icd_id: string;
  state: any;
  registration: Registration;
  socket: Socket = null;
  lastTempUpdateToSensor: Date;

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
    
    // determine if the message indicates the thermostat is tunring off
    if(this.is_running && (stateUpdates?.demand_status?.cool===0 || stateUpdates?.demand_status?.heat===0 ) ) {
      stateUpdates.demand_status.lastEndTime = new Date();
    }
    const newState = _.merge(this.state,stateUpdates);
    this.state = newState;
    }

  setThermostatTempToSensorTemp(sensorTemperature: number) {
    // CHECK: Ensure the temp isn't updated all the time
    // when the last temp offset was less than 5 minutes ago, don't update again 
    const currentDate : Date = new Date();
    const lastUpdateToCurrent : any = (currentDate.valueOf() - this.lastTempUpdateToSensor?.valueOf()) || 0 ;
    if( (lastUpdateToCurrent) < 5 * 60 * 1000 ) {
      return;
    }

    // CHECK: Ensure the offset isn't changed just after the hvac starts to prevent short cycling
    // Currently set to 10 minutes from start
    const lastStartTime : Date = new Date(this?.state?.demand_status?.last_start * 1000) || null;
    const lastStartToCurrent : any = (currentDate.valueOf() - lastStartTime?.valueOf()) || 0 ;
    if( (lastStartToCurrent) < 10 * 60 * 1000 ) {
      return;
    }


    // CHECK: Ensure the offset isn't changed just after the hvac stops to prevent short cycling
    // Currently set to 5 minutes from the end time
    const lastEndTime : Date = new Date(this?.state?.demand_status?.last_end * 1000) || null;
    const lastEndTimeToCurrent : any = (currentDate.valueOf() - lastEndTime?.valueOf()) || 0 ;
    if( (lastEndTimeToCurrent) < 5 * 60 * 1000 ) {
      return;
  }

    // CALCULATE: Determine the offset to apply 
    const currentTempAtThermostatSensor = this.thermostatSensor_temp;
    const temperatureDifference = sensorTemperature - currentTempAtThermostatSensor;
    const scale = 2;
    const temperatureDifferenceRounded = Math.round(temperatureDifference * scale) / scale;
    const currentTempOffset = this.state.temp_offset;
    const absChangeInTempOffset = Math.abs(temperatureDifferenceRounded - currentTempOffset);

    // DEBUG: Log the information
    // console.log(`Tempature used in thermostat: ${this.state.display_temp}`);
    // console.log(`Tempature at sensor: ${sensorTemperature}`);
    // console.log(`Tempature at thermostat: ${currentTempAtThermostatSensor}`);
    // console.log(`Tempature difference between sensor and thermostat: ${temperatureDifference}`);
    // console.log(`Current offset: ${currentTempOffset}`);
    // console.log(`Proposed offset: ${temperatureDifferenceRounded}`);
    
    // CHECK: Only change the temp if the difference is big enough 
    if (absChangeInTempOffset <= 0.5) {
      return;
    }

    console.log(`Changing offset by ${absChangeInTempOffset} to ${temperatureDifferenceRounded}`);
    this.setThermostatOffset(temperatureDifferenceRounded);
  
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

  get circulatingFanOn(): boolean {
    return this.state?.circulating_fan?.enabled === "on"
  }

  set circulatingFanOn(onOff: boolean) {
    const enabledValue = onOff ? "on" : "off";
    const perOn = this.circulatingFanPer ? this.circulatingFanPer : 50;
    this.socket.emit('set_circulating_fan', {
      icd_id: this.icd_id,
      value:
      {
        "duty_cycle": perOn,
        "enabled": enabledValue
      }
    });
  }

  get circulatingFanPer(): number {
    return this.state?.duty_cycle
  }

}
