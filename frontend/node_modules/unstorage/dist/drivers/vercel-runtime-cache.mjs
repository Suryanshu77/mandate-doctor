import { importLib, joinKeys, normalizeKey } from "../_chunks/utils.mjs";
const DRIVER_DEPENDENCIES = { lib: {
	name: "@vercel/functions",
	version: "^2.2.12 || ^3.0.0",
	optional: true
} };
const DRIVER_NAME = "vercel-runtime-cache";
const driver = (opts) => {
	const base = normalizeKey(opts?.base);
	const r = (...keys) => joinKeys(base, ...keys);
	let _cache;
	const getClient = () => _cache ??= getCache(opts);
	return {
		name: DRIVER_NAME,
		getInstance: getClient,
		async hasItem(key) {
			const value = await (await getClient()).get(r(key));
			return value !== void 0 && value !== null;
		},
		async getItem(key) {
			const value = await (await getClient()).get(r(key));
			return value === void 0 ? null : value;
		},
		async setItem(key, value, tOptions) {
			const ttl = tOptions?.ttl ?? opts?.ttl;
			const tags = [...tOptions?.tags || [], ...opts?.tags || []].filter(Boolean);
			await (await getClient()).set(r(key), value, {
				ttl,
				tags
			});
		},
		async removeItem(key) {
			await (await getClient()).delete(r(key));
		},
		async getKeys(_base) {
			return [];
		},
		async clear(_base) {
			if (opts?.tags && opts.tags.length > 0) await (await getClient()).expireTag(opts.tags);
		}
	};
};
const SYMBOL_FOR_REQ_CONTEXT = /*#__PURE__*/ Symbol.for("@vercel/request-context");
function getContext() {
	return globalThis[SYMBOL_FOR_REQ_CONTEXT]?.get?.() ?? {};
}
async function getCache(opts) {
	const cache = getContext()?.cache || (await importLib(DRIVER_NAME, "@vercel/functions", opts?.lib, () => import("@vercel/functions"))).getCache?.({
		keyHashFunction: (key) => key,
		namespaceSeparator: ":"
	});
	if (!cache) throw new Error("Runtime cache is not available!");
	return cache;
}
export { DRIVER_DEPENDENCIES, driver as default };
