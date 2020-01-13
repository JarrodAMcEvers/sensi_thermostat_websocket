import * as app from './app';
import * as config from './config';

app.startSocketConnection(config.access_token)
  .catch(err => {
    console.error('could not setup socket connection', err);
    process.exit(1);
  });
