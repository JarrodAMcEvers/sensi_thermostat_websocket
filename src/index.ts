/* eslint-disable no-await-in-loop */
import * as aht20 from 'aht20-sensor';
import * as client from 'prom-client';
import { Authorization } from './authorization';
import { Socket } from './socket/socket';
import { Thermostats } from './Thermostats';
import * as config from './config';

const authorization = new Authorization(
  config.CLIENT_ID,
  config.CLIENT_SECRET,
  config.EMAIL,
  config.PASSWORD
);

const sleep = (duration) => new Promise((resolve) => {
  setTimeout(resolve, duration);
});

const average = (array) => array.reduce((a, b) => a + b) / array.length;

const socket = new Socket(authorization);
// eslint-disable-next-line max-len
const thermostats = new Thermostats(socket); // mixes the business logic and data access layer but ...
const gateway = new client.Pushgateway('http://127.0.0.1:9091');
const gaugeTemp = new client.Gauge({ name: 'temp_ambient_f', help: 'the ambient tempature', labelNames: ['room'] });
const gaugeHVACRunning = new client.Gauge({ name: 'hvac_running', help: 'indicates if the hvac is running', labelNames: ['level', 'mode'] });

console.log('Starting socket connection with Sensi');
socket.startSocketConnection().catch((err) => {
  console.error('could not setup socket connection', err);
  process.exit(1);
});

socket.on('state', (data: any) => {
  thermostats.updateThermostats(data);
  thermostats.forEach((themostat) => {
    gaugeTemp.set({ room: 'top_of_stairs' }, themostat.thermostatSensor_temp);
    gaugeTemp.set({ room: 'upstairs_thermostat' }, themostat.thermostat_temp);
    gaugeHVACRunning.set({ level: 'upstairs', mode: 'system' }, +themostat.is_running);
    gaugeHVACRunning.set({ level: 'upstairs', mode: 'heat' }, +themostat.is_running_heat);
    gaugeHVACRunning.set({ level: 'upstairs', mode: 'auxheat' }, +themostat.is_running_auxheat);
    gaugeHVACRunning.set({ level: 'upstairs', mode: 'cool' }, +themostat.is_running_cool);
  });
  gateway.pushAdd({ jobName: 'tempSensor' });
});

const readTempatureSensorData = async (sensor) => {
  const { humidity, temperature: temperatureC } = await sensor.readData();
  const temperatureF = temperatureC * 1.8 + 32;
  return { temperatureC, temperatureF, humidity };
};

const readTempatureSensorDataContiously = async (sensor) => {
  let tempReadings = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(1 * 1000);
    const remoteSensorData = await readTempatureSensorData(sensor);
    // console.log(remoteSensorData.temperatureF);
    // basic check for outlier data
    // eslint-disable-next-line max-len
    if ((remoteSensorData.temperatureF < 95) && (remoteSensorData.temperatureF > 65)) tempReadings.push(remoteSensorData.temperatureF);
    // after 60 temp readings, take the average and then perform the offset
    if (tempReadings.length > 60) {
      const avgTemps = average(tempReadings);
      gaugeTemp.set({ room: 'office' }, avgTemps);
      gateway.pushAdd({ jobName: 'tempSensor' });

      thermostats.forEach((themostat) => {
        themostat.setThermostatTempToSensorTemp(avgTemps);
      });

      tempReadings = [];
    }
  }
};

const main = async () => {
  const sensor = await aht20.open();
  readTempatureSensorDataContiously(sensor);
};

main();
