/* eslint-disable no-await-in-loop */
import aht20 from 'aht20-sensor';
import * as client from 'prom-client';
import { Authorization } from './authorization.js';
import { Socket } from './socket/socket.js';
import { Thermostats } from './Thermostats.js';
import * as config from './config.js';
import { nestThermostatListener } from './nestThermostatLister.js';
import { OutsideAirTempFetcher } from './OutsideAirTempFetcher.js';

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

let globalSensor = null;

const sensiSocket = new Socket(authorization);
// eslint-disable-next-line max-len
const thermostats = new Thermostats(sensiSocket); // mixes the business logic and data access layer but ...
const register = new client.Registry();
const gaugeTemp = new client.Gauge({ name: 'temp_ambient_f', help: 'the ambient temperature', labelNames: ['room'] });
register.registerMetric(gaugeTemp);
const gaugeHVACRunning = new client.Gauge({ name: 'hvac_running', help: 'indicates if the hvac is running', labelNames: ['level', 'mode'] });
register.registerMetric(gaugeHVACRunning);

console.log('Starting socket connection with Sensi');
sensiSocket.startSocketConnection().catch((err) => {
  console.error('could not setup socket connection', err);
  process.exit(1);
});

sensiSocket.on('state', (data: any) => {
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

const readTemperatureSensorData = async (sensor) => {
  const { humidity, temperature: temperatureC } = await sensor.readData();
  const temperatureF = temperatureC * 1.8 + 32;
  return { temperatureC, temperatureF, humidity };
};

const readTemperatureSensorDataContinuously = async (sensor) => {
  let tempReadings = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await sleep(30 * 1000);
    const remoteSensorData = await readTemperatureSensorData(sensor);
    // console.log(remoteSensorData.temperatureF);
    // basic check for outlier data
    // eslint-disable-next-line max-len
    if ((remoteSensorData.temperatureF < 95) && (remoteSensorData.temperatureF > 65)) tempReadings.push(remoteSensorData.temperatureF);
    // after 4 temp readings, take the average and then perform the offset
    if (tempReadings.length > 4) {
      const avgTemps = average(tempReadings);
      gaugeTemp.set({ room: 'office' }, avgTemps);

      thermostats.forEach((themostat) => {
        themostat.setThermostatTempToSensorTemp(avgTemps);
      });

      tempReadings = [];
    }
  }
};

const manageCirculatingFanSchedule = async () => {
  while (true) {
    const d = new Date();
    thermostats.forEach(thermostat => {
      const fanShouldBeOn = ((d.getHours()<19 && d.getHours() >= 12) && (d.getDay()>0 && d.getDay()<6 ) && thermostat.thermostat_temp > 70 ) ? true : false;
      if(fanShouldBeOn!==thermostat.circulatingFanOn) {
        thermostat.circulatingFanOn = fanShouldBeOn;
        console.log("Changed Circulating Fan Status");
      }
    });
    await sleep(5 * 60 * 1000);
  }
};

app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.get('/temp', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(await readTemperatureSensorData(globalSensor)));
});

const main = async () => {
  https.createServer(options, app).listen(9091, () => console.log('Server is running on http://localhost:9091, metrics are exposed on http://localhost:9091/metrics'));
  const sensor = await aht20.open();
  globalSensor = sensor;
  readTemperatureSensorDataContinuously(sensor);
  nestThermostatListener('nest-device-access-345321', 'nestPull', gaugeTemp, gaugeHVACRunning);
  const tempFetcher = new OutsideAirTempFetcher();
  tempFetcher.start();
  tempFetcher.on('tempChange', (temp) => { gaugeTemp.set({ room: 'outside' }, temp); });

  manageCirculatingFanSchedule();

};

main();
