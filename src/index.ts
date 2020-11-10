import { Authorization } from './authorization';
import { Socket } from './socket/socket';

const authorization    = new Authorization();
const socket           = new Socket(authorization);
socket.startSocketConnection()
  .catch(err => {
    console.error('could not setup socket connection', err);
    process.exit(1);
  });
