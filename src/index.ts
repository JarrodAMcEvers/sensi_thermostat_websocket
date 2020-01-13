import * as app from './app';

app.startSocketConnection()
  .catch(err => {
    console.error('could not setup socket connection', err);
    process.exit(1);
  });
