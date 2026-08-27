//#region src/noop.ts
/**
* A no-op implementation of `EventClient` with an identical public API.
*
* The package root export resolves to this class outside of development (see
* `index.ts`), so production bundlers can tree-shake the real client away.
* Authors who want devtools events in production should import the real client
* from `@tanstack/devtools-event-client/production` instead.
*/
var EventClientNoOp = class {
	#pluginId;
	constructor({ pluginId }) {
		this.#pluginId = pluginId;
	}
	getPluginId() {
		return this.#pluginId;
	}
	createEventPayload(eventSuffix, payload) {
		return {
			type: `${this.#pluginId}:${eventSuffix}`,
			payload,
			pluginId: this.#pluginId
		};
	}
	emit(_eventSuffix, _payload) {}
	on(_eventSuffix, _cb, _options) {
		return () => {};
	}
	onAll(_cb) {
		return () => {};
	}
	onAllPluginEvents(_cb) {
		return () => {};
	}
};
//#endregion
exports.EventClientNoOp = EventClientNoOp;

//# sourceMappingURL=noop.cjs.map