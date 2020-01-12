const app    = require('./app.js');
const config = require('./config.js');

app.startSocketConnection(config.access_token)
  .catch(err => {
    console.error('could not setup socket connection', err);
    process.exit(1);
  });
