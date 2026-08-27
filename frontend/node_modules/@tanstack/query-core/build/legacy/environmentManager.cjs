Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_utils = require("./utils.cjs");
//#region src/environmentManager.ts
/**
* Manages environment detection used by TanStack Query internals.
*/
const environmentManager = (() => {
	let isServerFn = () => require_utils.isServer;
	return {
		/**
		* Returns whether the current runtime should be treated as a server environment.
		*/
		isServer() {
			return isServerFn();
		},
		/**
		* Overrides the server check globally.
		*/
		setIsServer(isServerValue) {
			isServerFn = isServerValue;
		}
	};
})();
//#endregion
exports.environmentManager = environmentManager;

//# sourceMappingURL=environmentManager.cjs.map