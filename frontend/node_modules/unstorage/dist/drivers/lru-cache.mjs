import { importLib } from "../_chunks/utils.mjs";
const DRIVER_DEPENDENCIES = { lib: {
	name: "lru-cache",
	version: "^11.2.6"
} };
const DRIVER_NAME = "lru-cache";
const driver = (opts = {}) => {
	let _cache;
	const getCache = () => _cache ??= (async () => {
		const { LRUCache } = await importLib(DRIVER_NAME, "lru-cache", opts.lib, () => import("lru-cache"));
		return new LRUCache({
			max: 1e3,
			sizeCalculation: opts.maxSize || opts.maxEntrySize ? (value, key) => {
				return key.length + byteLength(value);
			} : void 0,
			...opts
		});
	})();
	return {
		name: DRIVER_NAME,
		options: opts,
		getInstance: getCache,
		async hasItem(key) {
			return (await getCache()).has(key);
		},
		async getItem(key) {
			return (await getCache()).get(key) ?? null;
		},
		async getItemRaw(key) {
			return (await getCache()).get(key) ?? null;
		},
		async setItem(key, value) {
			(await getCache()).set(key, value);
		},
		async setItemRaw(key, value) {
			(await getCache()).set(key, value);
		},
		async removeItem(key) {
			(await getCache()).delete(key);
		},
		async getKeys() {
			return [...(await getCache()).keys()];
		},
		async clear() {
			(await _cache)?.clear();
		},
		async dispose() {
			(await _cache)?.clear();
		}
	};
};
function byteLength(value) {
	if (typeof Buffer !== "undefined") try {
		return Buffer.byteLength(value);
	} catch {}
	try {
		return typeof value === "string" ? value.length : JSON.stringify(value).length;
	} catch {}
	return 0;
}
export { DRIVER_DEPENDENCIES, driver as default };
