export function stateHandler(): void {

}

export function connectHandler(): void {
  console.log('connected');
}

export function disconnectHandler(err): void {
  console.error('disconnected', err);
}

export function errorHandler(err): void {
  console.error('error', err);
}
