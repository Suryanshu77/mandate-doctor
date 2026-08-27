import { importLib } from "../_chunks/utils.mjs";
import driver$1 from "./deno-kv.mjs";
const DRIVER_DEPENDENCIES = { lib: {
	name: "@deno/kv",
	version: ">=0.14.0"
} };
const DRIVER_NAME = "deno-kv-node";
const driver = (opts) => {
	const baseDriver = driver$1({
		...opts,
		openKv: async () => {
			const { openKv } = await importLib(DRIVER_NAME, "@deno/kv", opts.lib, () => import("@deno/kv"));
			return openKv(opts.path, opts.openKvOptions);
		}
	});
	return {
		...baseDriver,
		getInstance() {
			return baseDriver.getInstance();
		},
		name: DRIVER_NAME
	};
};
export { DRIVER_DEPENDENCIES, driver as default };
