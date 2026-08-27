import { importLib } from "../_chunks/utils.mjs";
const DRIVER_DEPENDENCIES = { lib: {
	name: "idb-keyval",
	version: "^6.2.2"
} };
const DRIVER_NAME = "idb-keyval";
const driver = (opts = {}) => {
	const base = opts.base && opts.base.length > 0 ? `${opts.base}:` : "";
	const makeKey = (key) => base + key;
	let _lib;
	const getLib = () => _lib ??= importLib(DRIVER_NAME, "idb-keyval", opts.lib, () => import("idb-keyval")).then((lib) => ({
		lib,
		store: opts.dbName && opts.storeName ? lib.createStore(opts.dbName, opts.storeName) : void 0
	}));
	return {
		name: DRIVER_NAME,
		options: opts,
		async hasItem(key) {
			const { lib, store } = await getLib();
			return await lib.get(makeKey(key), store) === void 0 ? false : true;
		},
		async getItem(key) {
			const { lib, store } = await getLib();
			return await lib.get(makeKey(key), store) ?? null;
		},
		async getItemRaw(key) {
			const { lib, store } = await getLib();
			return await lib.get(makeKey(key), store) ?? null;
		},
		async setItem(key, value) {
			const { lib, store } = await getLib();
			return lib.set(makeKey(key), value, store);
		},
		async setItemRaw(key, value) {
			const { lib, store } = await getLib();
			return lib.set(makeKey(key), value, store);
		},
		async removeItem(key) {
			const { lib, store } = await getLib();
			return lib.del(makeKey(key), store);
		},
		async getKeys() {
			const { lib, store } = await getLib();
			return lib.keys(store);
		},
		async clear() {
			const { lib, store } = await getLib();
			return lib.clear(store);
		}
	};
};
export { DRIVER_DEPENDENCIES, driver as default };
