import * as aht20 from 'aht20-sensor';
import { Authorization } from "./authorization";
import { Socket } from "./socket/socket";
import { Thermostats } from "./Thermostat";


const authorization = new Authorization();
const socket = new Socket(authorization);
const thermostats = new Thermostats(socket); // mixes the business logic and data access layer but ...

console.log("Starting socket connection with Sensi");
socket.startSocketConnection().catch((err) => {
  console.error("could not setup socket connection", err);
  process.exit(1);
});

socket.on("state", (data: any) => {
  thermostats.updateThermostats(data);
});

const readTempatureSensorData = async (sensor) => {
  const { humidity,
    temperature: temperatureC } = await sensor.readData();
  const temperatureF = temperatureC * 1.8 + 32;
  return { temperatureC, temperatureF, humidity };
}

const readTempatureSensorDataContiously = async (sensor) => {
  let tempReadings = [];
  while (true) {
    await sleep(1 * 1000);
    const remoteSensorData = await readTempatureSensorData(sensor);
    console.log(remoteSensorData.temperatureF);
    // basic check for outlier data
    if( ( remoteSensorData.temperatureF< 95 ) && ( remoteSensorData.temperatureF> 65 ))
      tempReadings.push(remoteSensorData.temperatureF);
    // after 60 temp readings, take the average and then perform the offset
    if (tempReadings.length > 60) {
      const avgTemps = average(tempReadings);
      thermostats.forEach(themostat => {
        themostat.setThermostatTempToSensorTemp(avgTemps);
      })
      tempReadings = [];
    }
  }
}

const main = async () => {
  const sensor = await aht20.open();
  readTempatureSensorDataContiously(sensor);
}

const sleep = (duration) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}

const average = (array) => array.reduce((a, b) => a + b) / array.length;

main();
