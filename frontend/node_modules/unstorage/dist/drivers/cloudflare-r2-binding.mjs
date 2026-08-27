import { joinKeys } from "../_chunks/utils.mjs";
import { getR2Binding } from "../_chunks/cloudflare.mjs";
const DRIVER_NAME = "cloudflare-r2-binding";
const driver = (opts = {}) => {
	const r = (key = "") => opts.base ? joinKeys(opts.base, key) : key;
	const getKeys = async (base) => {
		return (await getR2Binding(opts.binding).list(base || opts.base ? { prefix: r(base) } : void 0)).objects.map((obj) => obj.key);
	};
	return {
		name: DRIVER_NAME,
		options: opts,
		getInstance: () => getR2Binding(opts.binding),
		async hasItem(key) {
			key = r(key);
			return await getR2Binding(opts.binding).head(key) !== null;
		},
		async getMeta(key) {
			key = r(key);
			const obj = await getR2Binding(opts.binding).head(key);
			if (!obj) return null;
			return {
				mtime: obj.uploaded,
				atime: obj.uploaded,
				...obj
			};
		},
		getItem(key, topts) {
			key = r(key);
			return getR2Binding(opts.binding).get(key, topts).then((r) => r?.text() ?? null);
		},
		async getItemRaw(key, topts) {
			key = r(key);
			const object = await getR2Binding(opts.binding).get(key, topts);
			return object ? getObjBody(object, topts?.type) : null;
		},
		async setItem(key, value, topts) {
			key = r(key);
			await getR2Binding(opts.binding).put(key, value, topts);
		},
		async setItemRaw(key, value, topts) {
			key = r(key);
			await getR2Binding(opts.binding).put(key, value, topts);
		},
		async removeItem(key) {
			key = r(key);
			await getR2Binding(opts.binding).delete(key);
		},
		getKeys(base) {
			return getKeys(base).then((keys) => opts.base ? keys.map((key) => key.slice(opts.base.length)) : keys);
		},
		async clear(base) {
			const binding = getR2Binding(opts.binding);
			const keys = await getKeys(base);
			await binding.delete(keys);
		}
	};
};
function getObjBody(object, type) {
	switch (type) {
		case "object": return object;
		case "stream": return object.body;
		case "blob": return object.blob();
		case "arrayBuffer": return object.arrayBuffer();
		case "bytes": return object.arrayBuffer().then((buffer) => new Uint8Array(buffer));
		default: return object.arrayBuffer();
	}
}
export { driver as default };
