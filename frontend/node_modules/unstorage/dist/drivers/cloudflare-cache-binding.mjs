import { joinKeys } from "../_chunks/utils.mjs";
const DRIVER_NAME = "cloudflare-cache-binding";
const driver = (opts) => {
	const r = (key = "") => {
		if (opts.base) key = joinKeys(opts.base, key);
		return `unstorage://${key.replace(/:/g, "/")}`;
	};
	let _cache;
	const getCache = () => {
		if (_cache) return _cache;
		if (opts.name) _cache = globalThis.caches.open(opts.name);
		else _cache = globalThis.caches.default;
		return _cache;
	};
	const setItemRaw = async (key, value, tOptions) => {
		const cacheKey = r(key);
		const headers = {};
		const ttl = tOptions?.ttl ?? opts.ttl;
		if (ttl) headers["Cache-Control"] = `max-age=${ttl}`;
		if (tOptions?.tag) headers["Cache-Tag"] = tOptions.tag;
		const cacheValue = new Response(value, { headers });
		await (await getCache()).put(cacheKey, cacheValue);
	};
	return {
		name: DRIVER_NAME,
		options: opts,
		getInstance: () => getCache(),
		async hasItem(key) {
			const cacheKey = r(key);
			return await (await getCache()).match(cacheKey) !== void 0;
		},
		async getItem(key) {
			const cacheKey = r(key);
			const response = await (await getCache()).match(cacheKey);
			return response ? await response.text() : null;
		},
		async getItemRaw(key) {
			const cacheKey = r(key);
			const response = await (await getCache()).match(cacheKey);
			return response ? await response.arrayBuffer() : null;
		},
		async setItem(key, value, tOptions) {
			return setItemRaw(key, value, tOptions);
		},
		async setItemRaw(key, value, tOptions) {
			return setItemRaw(key, value, tOptions);
		},
		async removeItem(key) {
			const cacheKey = r(key);
			await (await getCache()).delete(cacheKey);
		},
		getKeys() {
			return [];
		}
	};
};
export { driver as default };
