import { isServer } from "./utils.js";
//#region src/environmentManager.ts
/**
* Manages environment detection used by TanStack Query internals.
*/
const environmentManager = (() => {
	let isServerFn = () => isServer;
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
export { environmentManager };

//# sourceMappingURL=environmentManager.js.map