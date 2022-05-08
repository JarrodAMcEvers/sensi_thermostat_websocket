// Imports the Google Cloud client library
import { PubSub } from '@google-cloud/pubsub';

const { NEST_THERMOSTAT_ID } = process.env;

let gaugeTemp = null;
let gaugeHVACRunning = null;

export const nestThermostatListener = async (
  projectId = 'your-project-id', // Your Google Cloud Platform project ID
  subscriptionName = 'my-sub', // Name for the new subscription to create
  gaugeTempInput = gaugeTemp,
  gaugeHVACRunningInput = gaugeHVACRunning
) => {
  gaugeTemp = gaugeTempInput;
  gaugeHVACRunning = gaugeHVACRunningInput;
  // Instantiates a client
  const pubsub = new PubSub({ projectId });

  // Listen to a subscription
  const subscription = pubsub.subscription(subscriptionName);

  // Create an event handler to handle messages
  const messageHandler = (message) => {
    if (!message.data) return; // make sure we have a message
    const messageDataJSON = message.data.toString();
    const messageData = JSON.parse(messageDataJSON);
    if (!(messageData?.resourceUpdate?.name === NEST_THERMOSTAT_ID)) {
      console.log('message is for other thermostat');
      message.ack();
      return;
    }

    const timeStamp = new Date(messageData.timestamp);

    console.log(JSON.stringify(messageData.resourceUpdate));
    const tempC = messageData?.resourceUpdate?.traits['sdm.devices.traits.Temperature']?.ambientTemperatureCelsius
    if (tempC) {
      const tempF = tempC * 1.8 + 32;
      // console.log(`Main temp: ${tempF} at ${timeStamp.toLocaleString()}`);
      gaugeTemp.set({ room: 'main_thermostat' }, tempF);
    }

    const hvacRunningInfo = messageData?.resourceUpdate?.traits['sdm.devices.traits.ThermostatHvac']?.status

    if (hvacRunningInfo) {
      const is_running_heat = hvacRunningInfo === 'HEATING';
      const is_running_auxheat = false;
      const is_running_cool = hvacRunningInfo === 'COOLING'
      const is_running = is_running_heat || is_running_auxheat || is_running_cool;
      // console.log(hvacRunningInfo);
      // console.log(`HVAC Heat Run: ${is_running_heat} at ${timeStamp.toLocaleString()}`);
      // console.log(`HVAC Cool Run: ${is_running_cool}`);
      // console.log(`HVAC Run: ${is_running}`);

      gaugeHVACRunning.set({ level: 'main', mode: 'heat' }, +is_running_heat);
      gaugeHVACRunning.set({ level: 'main', mode: 'auxheat' }, +is_running_auxheat);
      gaugeHVACRunning.set({ level: 'main', mode: 'cool' }, +is_running_cool);
      gaugeHVACRunning.set({ level: 'main', mode: 'system' }, +is_running);
    }

    // "Ack" (acknowledge receipt of) the message
    console.log('ACK');
    message.ack();
  };

  // Listen for new messages until timeout is hit
  subscription.on('message', messageHandler);

  // Receive callbacks for errors on the subscription
  subscription.on('error', (error) => {
    console.error('Received error:', error);
    process.exit(1);
  });
};
