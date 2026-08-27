Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_plugin = require("./plugin.cjs");
const require_noop = require("./noop.cjs");
//#region src/index.ts
/**
* The real `EventClient` in development; a no-op everywhere else.
*
* Production bundlers replace `process.env.NODE_ENV` with a literal, fold this
* ternary to `EventClientNoOp`, and tree-shake `./plugin` out of the bundle.
* To keep the real client in production, import it from
* `@tanstack/devtools-event-client/production` instead.
*/
var EventClient = process.env.NODE_ENV !== "development" ? require_noop.EventClientNoOp : require_plugin.EventClient;
//#endregion
exports.EventClient = EventClient;

//# sourceMappingURL=index.cjs.map