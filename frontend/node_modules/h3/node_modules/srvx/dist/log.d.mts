import { ServerMiddleware } from "./_chunks/types.mjs";
interface LoggerMiddlewareOptions {
  /**
   * Batch lines and write once per event-loop turn (default: `true`). Set to
   * `false` to hand each line to stdout in the request's own turn: slower
   * under load, but a hard kill can only drop the write still in flight,
   * never a batch waiting for its flush turn.
   */
  batch?: boolean;
}
declare const loggerMiddleware: (options?: LoggerMiddlewareOptions) => ServerMiddleware;
export { LoggerMiddlewareOptions, loggerMiddleware };