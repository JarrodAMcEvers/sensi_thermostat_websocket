# Sensi Thermostat Websocket

The Sensi Thermostat Websocket project is a wrapper around Emerson's WebSocket API used by the Sensi WiFi thermostat mobile app.

This application allows you to receive thermostat updates for all of the thermostats connected to a Sensi account. You can also perform basic updates such as setting the tempature offset in case you have a remote ambient tempeature sensor. Right now, it is also logs the tempatures from the thermostat and a local sensor to Grafana. This will be split later.

## Command line tools this project uses

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
You will also need a client ID and secret for the OAuth process. Please refer to the [Clients](#Clients) table for valid credentials.

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

| Client ID | Client Secret                    |
| --------- | -------------------------------- |
| android   | XBF?Z9U6;x3bUwe^FugbL=4ksvGjLnCQ |
| ios       | 8m7YoDninTVasvZ42;^nwrA}%FPWuVjH |

### API Documentation
The Emerson Sensi Web Socket API is documented in [api.md](api.md).

## Contributing to this project

Pull requests are always greatly appreciated!! Before submitting a pull request, make sure that the tests pass. This project uses the Jest testing framework.

**If new code is added, tests are required.**

Command to run before submitting a pull request.

```bash
make test
```
