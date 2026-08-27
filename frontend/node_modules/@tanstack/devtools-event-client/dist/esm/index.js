import { EventClient as EventClient$1 } from "./plugin.js";
import { EventClientNoOp } from "./noop.js";
//#region src/index.ts
/**
* The real `EventClient` in development; a no-op everywhere else.
*
* Production bundlers replace `process.env.NODE_ENV` with a literal, fold this
* ternary to `EventClientNoOp`, and tree-shake `./plugin` out of the bundle.
* To keep the real client in production, import it from
* `@tanstack/devtools-event-client/production` instead.
*/
var EventClient = process.env.NODE_ENV !== "development" ? EventClientNoOp : EventClient$1;
//#endregion
export { EventClient };

//# sourceMappingURL=index.js.map