export function stateHandler(data: any): void {
  console.log(JSON.stringify(data));
}

export function disconnectHandler(err): void {
  console.error('disconnected', err);
}

export function errorHandler(err): void {
  console.error('error', err);
}
