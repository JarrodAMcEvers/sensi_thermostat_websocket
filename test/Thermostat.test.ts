import { Socket } from '../src/socket/socket.js';
import { Authorization } from '../src/authorization.js';
import { Thermostat } from '../src/Thermostat.js';
jest.mock('../src/socket/socket.js');
jest.mock('../src/authorization.js');

const standardStartMessage = { "icd_id": "0a-50-30-62-eb-18-ff-ff", "registration": { "name": "Test", "postal_code": "10010", "country": "US", "contractor_id": null, "timezone": "America/New_York", "address1": "501 Avenue of Americas", "address2": null, "city": "New York", "state": "Ny", "fleet_enabled": false, "fleet_enabled_date": null, "product_type": "Sensi Classic with HomeKit" }, "state": { "status": "online", "current_cool_temp": 75, "current_heat_temp": 68, "display_temp": 75.5, "current_operating_mode": "cool", "humidity": 37, "battery_voltage": 3.135, "power_status": "c_wire", "wifi_connection_quality": 48, "periodicity": 0, "comfort_alert": null, "other_error_bitfield": { "bad_temperature_sensor": "off", "bad_humidity_sensor": "off", "stuck_key": "off", "high_voltage": "off", "e5_alert": "off", "error_32": "off", "error_64": "off" }, "current_humidification_percent": 5, "current_dehumidification_percent": 40, "relay_status": { "w": "off", "w2": "off", "g": "off", "y": "off", "y2": "off", "o_b": "on" }, "demand_status": { "humidification": 0, "dehumidification": 0, "overcooling": "no", "cool_stage": null, "heat_stage": null, "aux_stage": null, "heat": 0, "fan": 0, "cool": 0, "aux": 0, "last": "cool", "last_start": null }, "hashedSchedule": "abcdefef", "display_scale": "f", "heat_max_temp": 99, "cool_min_temp": 45, "hold_mode": "off", "operating_mode": "cool", "scheduling": "on", "fan_mode": "auto", "display_humidity": "on", "continuous_backlight": "off", "compressor_lockout": "on", "early_start": "off", "keypad_lockout": "off", "temp_offset": 0, "humidity_offset": 0, "aux_cycle_rate": "medium", "cool_cycle_rate": "medium", "heat_cycle_rate": "medium", "aux_boost": "on", "heat_boost": "on", "cool_boost": "on", "dst_offset": 60, "dst_observed": "yes", "tz_offset": -300, "hold_end": null, "deadband": 2, "display_time": "on", "partial_keypad_lockout": { "setpoint": "on", "system_mode": "on", "fan_mode": "on", "schedule_mode": "on", "settings_menu": "on" }, "lcd_sleep_mode": null, "night_light": null, "outdoor_weather_display": "ff:00:00:ff:ff:ff:00:00:ff:00:00:ff:00:00:ff:00:00:ff:00", "circulating_fan": { "enabled": "off", "duty_cycle": 30 }, "humidity_control": { "humidification": { "target_percent": 5, "enabled": "off", "mode": "humidifier" }, "dehumidification": { "target_percent": 40, "enabled": "off", "mode": "overcooling" }, "status": "none" }, "geofencing": null, "remote_sensor_status": "00", "control": { "mode": "scheduling", "devices": null, "geo_state": null, "device_data": null } } }

describe('state updates', () => {
    let thermostat;
    let startState = { "demand_status": { "last_start": 1649628642, "cool": 100, "cool_stage": 1 }, "relay_status": { "y": "on" }, "wifi_connection_quality": 44, "control": {}, "humidity_control": { "status": "none" } }
    beforeEach(() => {
        const auth = new Authorization("", "", "", "")
        const socket = new Socket(auth);
        thermostat = new Thermostat(socket, {})
        thermostat.updateState(startState);
    });
    test('single update with no existing values', () => {
        expect(thermostat.state).toEqual(startState);
        expect(thermostat.state.demand_status.cool).toEqual(100);
        expect(thermostat.state.relay_status.y).toEqual("on");
    });
    test('test fan turning on with ac already running', () => {
        const statusUpdate = { "demand_status": { "fan": 100 }, "relay_status": { "g": "on" }, "control": {}, "humidity_control": { "status": "none" } }
        thermostat.updateState(statusUpdate);
        expect(thermostat.state.demand_status.cool).toEqual(100);
        expect(thermostat.state.relay_status.y).toEqual("on");
        expect(thermostat.state.relay_status.g).toEqual("on");
    });
    test('test ac turns off', () => {
        const statusUpdateFan = { "demand_status": { "fan": 100 }, "relay_status": { "g": "on" }, "control": {}, "humidity_control": { "status": "none" } }
        thermostat.updateState(statusUpdateFan);
        const statusUpdateOff = { "demand_status": { "last_start": null, "cool": 0, "fan": 0, "cool_stage": null }, "relay_status": { "y": "off", "g": "off" } }
        thermostat.updateState(statusUpdateOff);
        expect(thermostat.state.demand_status.cool).toEqual(0);
        expect(thermostat.state.relay_status.y).toEqual("off");
        expect(thermostat.state.relay_status.g).toEqual("off");
    });
})

describe('indicator of running state', () => {
    let thermostat;
    let auth;
    let socket;
    beforeEach(() => {
        auth = new Authorization("", "", "", "")
        socket = new Socket(auth);
        thermostat = new Thermostat(socket, standardStartMessage);
    });
    test('nothing running', () => {
        expect(thermostat.is_running_cool).toEqual(false);
        expect(thermostat.is_running_heat).toEqual(false);
        expect(thermostat.is_running_auxheat).toEqual(false);
        expect(thermostat.is_running).toEqual(false);
    });
    test('ac running', () => {
        const startState = { "demand_status": { "last_start": 1649628642, "cool": 100, "cool_stage": 1 }, "relay_status": { "y": "on" }, "wifi_connection_quality": 44, "control": {}, "humidity_control": { "status": "none" } }
        thermostat.updateState(startState);
        expect(thermostat.is_running_cool).toEqual(true);
        expect(thermostat.is_running_heat).toEqual(false);
        expect(thermostat.is_running_auxheat).toEqual(false);
        expect(thermostat.is_running).toEqual(true);
    });
    test('heat running', () => {
        const startState = { "demand_status": { "last_start": 1649628642, "cool": 0, "heat": 100, "cool_stage": 1 }, "relay_status": { "y": "on" }, "wifi_connection_quality": 44, "control": {}, "humidity_control": { "status": "none" } }
        thermostat.updateState(startState);
        expect(thermostat.is_running_cool).toEqual(false);
        expect(thermostat.is_running_heat).toEqual(true);
        expect(thermostat.is_running_auxheat).toEqual(false);
        expect(thermostat.is_running).toEqual(true);
    });
    test('aux heat running', () => {
        const startState = { "demand_status": { "last_start": 1649628642, "cool": 0, "heat": 100, "aux": 100, "cool_stage": 1 }, "relay_status": { "y": "on" }, "wifi_connection_quality": 44, "control": {}, "humidity_control": { "status": "none" } }
        thermostat.updateState(startState);
        expect(thermostat.is_running_cool).toEqual(false);
        expect(thermostat.is_running_heat).toEqual(true);
        expect(thermostat.is_running_auxheat).toEqual(true);
        expect(thermostat.is_running).toEqual(true);
    });
})

describe('temperature updates', () => {
    let thermostat;
    let auth;
    let socket;
    beforeEach(() => {
        auth = new Authorization("", "", "", "")
        socket = new Socket(auth);
        thermostat = new Thermostat(socket, standardStartMessage);
    });
    test('standard state', () => {
        expect(thermostat.thermostatSensor_temp).toEqual(75.5);
        expect(thermostat.thermostat_temp).toEqual(75.5);
    });
    test('test temp with offset', () => {
        const updateStateWithOffset = {"icd_id":"0a-50-30-62-eb-18-ff-ff","registration": { "name": "Test", "postal_code": "10010", "country": "US", "contractor_id": null, "timezone": "America/New_York", "address1": "501 Avenue of Americas", "address2": null, "city": "New York", "state": "Ny", "fleet_enabled": false, "fleet_enabled_date": null, "product_type": "Sensi Classic with HomeKit" }, "state":{"display_temp":74,"temp_offset":2,"display_scale":"f","control":{}}}
        thermostat.update(updateStateWithOffset);
        expect(thermostat.thermostatSensor_temp).toEqual(72);
        expect(thermostat.thermostat_temp).toEqual(74);
    });
    test('test temp after adding offset', () => {
        thermostat.setThermostatOffset(-2);
        expect(thermostat.thermostatSensor_temp).toEqual(75.5);
        expect(thermostat.thermostat_temp).toEqual(73.5);
    });
})

describe('temp setting offset', () => {
    let thermostat;
    let auth;
    let socket;
    beforeEach(() => {
        auth = new Authorization("", "", "", "")
        socket = new Socket(auth);
        thermostat = new Thermostat(socket, standardStartMessage);
    });
    test('test temp after adding offset', () => {
        thermostat.setThermostatOffset(-2);
        // sensor hasn't changed but display temp has
        expect(thermostat.thermostatSensor_temp).toEqual(75.5); 
        expect(thermostat.thermostat_temp).toEqual(73.5);
        expect(socket.emit).toHaveBeenCalled();
    });
})