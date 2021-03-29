# Sensi Thermostat Websocket

## Command line tools needed
1. npm
1. nvm
1. docker
1. docker-compose

## Quick Start
```
make install # or nvm use && npm install
CLIENT_ID=client_id CLIENT_SECRET=client_secret EMAIL=email PASSWORD=password make start
```

You will need to pass in your Sensi account email address and password as a command line argument to `make start`.
You will also need a Client ID and secret for the OAuth process. Please refer to the [Clients](#Clients) table for valid Client ID and secret combinations.

## The Docker Way
If you want to run it in a docker container, run `make up` or `make run`. This requires that you have a file named `env` in the root directory of this project. This allows you to pass in your config to the container.
The file should look like this:
```
CLIENT_ID=client
CLIENT_SECRET=secret
EMAIL=e@mail.com
PASSWORD=your_sensi_password
```

### [Clients](#Clients)
| Client ID | Client Secret  |
|---|---|
| android  | XBF?Z9U6;x3bUwe^FugbL=4ksvGjLnCQ |
| ios | <TBD> |
