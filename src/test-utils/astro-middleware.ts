export type MiddlewareHandler = (...args: any[]) => Promise<Response> | Response;

export function defineMiddleware<T extends MiddlewareHandler>(handler: T): T {
  return handler;
}
