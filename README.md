# Sensi Thermostat Websocket


## Quick Start
To start getting thermostat data from your Sensi thermostat(s), first, install the dependecies. After that is done, just run `make start`. You will need to pass in your Sensi account email address and password as a command line argument to `make start`.
Refer to the [Clients](#Clients) table for valid Client ID and secret combinations.

```
make install
CLIENT_ID=client_id CLIENT_SECRET=client_secret EMAIL=email PASSWORD=password make start
```

## The Docker Way
If you want to run it in a docker container, run `make up`.
Before running make up, you will need a `env` file in the root directory of this project to pass in ENV variables.
The file will need to look like this:
```
CLIENT_ID=client
CLIENT_SECRET=secret
EMAIL=e@mail.com
PASSWORD=your_secret_password
```

### [Clients](#Clients)
| Client ID | Client Secret  |
|---|---|
| android  | XBF?Z9U6;x3bUwe^FugbL=4ksvGjLnCQ |
