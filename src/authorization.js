let request = require('request');
let config  = require('./config.js');
let util    = require('util');

let post = util.promisify(request.post);

exports.getAccessToken = async () => {
  return await post(`${config.token_endpoint}/token`)
    .then(res => {
      let body = JSON.parse(res.body);
      return body.access_token;
  });
};