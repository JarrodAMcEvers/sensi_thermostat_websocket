import { Authorization } from './authorization';
import { Socket } from './socket/socket';
import * as config from './config';

const authorization = new Authorization(
  config.CLIENT_ID,
  config.CLIENT_SECRET,
  config.EMAIL,
  config.PASSWORD
);
const socket = new Socket(authorization);

console.log('Starting socket connection with Sensi');
socket.startSocketConnection()
  .catch((err) => {
    console.error('could not setup socket connection', err);
    process.exit(1);
  });
