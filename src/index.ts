import { Authorization } from './authorization';
import { Socket } from './socket/socket';

const authorization = new Authorization();
const socket        = new Socket(authorization);

console.log('Starting socket connection with Sensi');
socket.startSocketConnection()
  .catch(err => {
    console.error('could not setup socket connection', err);
    process.exit(1);
  });
