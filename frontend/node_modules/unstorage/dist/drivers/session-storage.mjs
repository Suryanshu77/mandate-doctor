import "../_chunks/utils.mjs";
import driver$1 from "./localstorage.mjs";
const DRIVER_NAME = "session-storage";
const driver = (opts = {}) => {
	return {
		...driver$1({
			windowKey: "sessionStorage",
			...opts
		}),
		name: DRIVER_NAME
	};
};
export { driver as default };
