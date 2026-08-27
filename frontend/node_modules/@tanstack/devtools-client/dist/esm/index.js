import { EventClient } from "@tanstack/devtools-event-client";
//#region src/index.ts
var DevtoolsEventClient = class extends EventClient {
	constructor() {
		super({ pluginId: "tanstack-devtools-core" });
	}
};
var devtoolsEventClient = new DevtoolsEventClient();
//#endregion
export { DevtoolsEventClient, devtoolsEventClient };

//# sourceMappingURL=index.js.map