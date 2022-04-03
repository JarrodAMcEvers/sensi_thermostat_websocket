import { Authorization } from './authorization';
import { Socket } from './socket/socket';
import * as config from './config';

const authorization = new Authorization(config.client_id, config.client_secret, config.email, config.password);
const socket = new Socket(authorization);

console.log('Starting socket connection with Sensi');
socket.startSocketConnection()
  .catch(err => {
    console.error('could not setup socket connection', err);
    process.exit(1);
  });
