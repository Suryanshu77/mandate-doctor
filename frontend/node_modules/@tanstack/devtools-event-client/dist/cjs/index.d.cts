import { EventClient as EventClientImpl } from './plugin.cjs';
/**
 * The real `EventClient` in development; a no-op everywhere else.
 *
 * Production bundlers replace `process.env.NODE_ENV` with a literal, fold this
 * ternary to `EventClientNoOp`, and tree-shake `./plugin` out of the bundle.
 * To keep the real client in production, import it from
 * `@tanstack/devtools-event-client/production` instead.
 */
declare const EventClient: typeof EventClientImpl;
type EventClient<TEventMap extends Record<string, any>> = EventClientImpl<TEventMap>;
export { EventClient };
