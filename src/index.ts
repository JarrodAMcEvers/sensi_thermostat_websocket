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
