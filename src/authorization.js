let request = require('request');
let config  = require('./config.js');
let util    = require('util');

let post = util.promisify(request.post);

exports.getTokens = async () => {
  return await post(`${config.token_endpoint}/token`, {
    form: {
      grant_type: 'password',
      client_id: config.client_id,
      client_secret: config.client_secret,
      username: config.username,
      password: config.password
    }
  })
    .then(res => {
      let body = JSON.parse(res.body);
      if (res.statusCode === 400) {
        return Promise.reject(body);
      }
      return { access_token: body.access_token, refresh_token: body.refresh_token };
    });
};