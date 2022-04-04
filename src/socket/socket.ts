import { Authorization } from "../authorization";
import { SocketHelper } from "./socket_helper";
import * as config from "../config";
import * as socketIO from "socket.io-client";
import { SocketState } from "../types/types";

export class Socket {
  private authorization: Authorization;
  socketConnection: any = null;
  onListeners: any = [
    {
      on: "state",
      fn: (data: any) => {
        SocketHelper.stateHandler(data);
      },
    },
  ];

  constructor(authorization: Authorization) {
    this.authorization = authorization;
  }

  async connectToSocket() {
    if (this.socketConnection && this.socketConnection.connected === true) {
      return;
    }

    if (this.authorization.isRefreshTokenAvailable()) {
      await this.authorization.refreshAccessToken();
    } else {
      await this.authorization.login();
    }

    this.socketConnection = socketIO(config.socket_endpoint, {
      transports: ["websocket"],
      path: "/thermostat",
      extraHeaders: {
        Authorization: `Bearer ${this.authorization.accessToken}`,
      },
    });
  }

  async startSocketConnection() {
    await this.connectToSocket();

    this.socketConnection.on("connect", () => {
      console.log("connected");
      /*
        Even if the access token is expired (it's valid for four hours),
        you will still get updates from the server about your thermostats.
        If you try to emit an event (get_weather, etc.), it will get rejected
        with an unauthorized error.
      */
      this.onListeners.forEach((listener) => {
        this.socketConnection.on(listener.on, listener.fn);
      });
    });

    // TODO: add reconnect logic
    this.socketConnection.on("disconnect", SocketHelper.disconnectHandler);

    this.socketConnection.on("error", async (error: Error) => {
      console.error("socket error", error);
      if (error.message && error.message.indexOf("jwt expired") >= 0) {
        console.log("access token is expired, reauthorizing");
        this.socketConnection.close();
        await this.startSocketConnection();
      }
    });

    return this.socketConnection;
  }

  async on(listener: String, fn: Function) {
    this.onListeners.push({ on: listener, fn });
  }

  async emit(event: string, body: any) {
    // console.log(event);
    // console.log(body);
    this.socketConnection.emit(event, body);
  }
}
