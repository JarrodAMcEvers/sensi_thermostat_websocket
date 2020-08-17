import * as socketHelper from './socket/socket_helper';

socketHelper.startSocketConnection()
  .catch(err => {
    console.error('could not setup socket connection', err);
    process.exit(1);
  });
