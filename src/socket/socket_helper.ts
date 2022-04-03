import { SocketState } from "../types/types";

export class SocketHelper {
  static stateHandler(data: any): void {
    const datetime = new Date().toLocaleString().replace(",", "");

    console.log("received data at", datetime);
    console.log(JSON.stringify(data));
  }

  static disconnectHandler(err): void {
    console.error("disconnected", err);
  }
}
