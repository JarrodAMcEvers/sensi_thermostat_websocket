let app    = require('./app.js');
let config = require('./config.js');

app.startSocketConnection(config.access_token);