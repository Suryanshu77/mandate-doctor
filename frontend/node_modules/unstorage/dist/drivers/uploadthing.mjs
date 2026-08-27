import { importLib, normalizeKey } from "../_chunks/utils.mjs";
const DRIVER_DEPENDENCIES = { lib: {
	name: "uploadthing",
	version: "^7.7.4"
} };
const DRIVER_NAME = "uploadthing";
const driver = (opts = {}) => {
	let client;
	const base = opts.base ? normalizeKey(opts.base) : "";
	const r = (key) => base ? `${base}:${key}` : key;
	const getClient = () => client ??= (async () => {
		const { UTApi } = await importLib(DRIVER_NAME, "uploadthing/server", opts.lib, () => import("uploadthing/server"));
		return new UTApi({
			...opts,
			defaultKeyType: "customId"
		});
	})();
	const getKeys = async (base) => {
		const { files } = await (await getClient()).listFiles({});
		return files.map((file) => file.customId).filter((k) => k && k.startsWith(base));
	};
	const toFile = (key, value) => {
		return Object.assign(new Blob([value]), {
			name: key,
			customId: key
		});
	};
	return {
		name: DRIVER_NAME,
		getInstance() {
			return getClient();
		},
		getKeys(base) {
			return getKeys(r(base));
		},
		async hasItem(key) {
			return (await (await getClient()).getFileUrls(r(key))).data.length > 0;
		},
		async getItem(key) {
			const url = await (await getClient()).getFileUrls(r(key)).then((res) => res.data[0]?.url);
			if (!url) return null;
			return fetch(url).then((res) => res.text());
		},
		async getItemRaw(key) {
			const url = await (await getClient()).getFileUrls(r(key)).then((res) => res.data[0]?.url);
			if (!url) return null;
			return fetch(url).then((res) => res.arrayBuffer());
		},
		async setItem(key, value) {
			await (await getClient()).uploadFiles(toFile(r(key), value));
		},
		async setItemRaw(key, value) {
			await (await getClient()).uploadFiles(toFile(r(key), value));
		},
		async setItems(items) {
			await (await getClient()).uploadFiles(items.map((item) => toFile(r(item.key), item.value)));
		},
		async removeItem(key) {
			await (await getClient()).deleteFiles([r(key)]);
		},
		async clear(base) {
			const client = await getClient();
			const keys = await getKeys(r(base));
			await client.deleteFiles(keys);
		}
	};
};
export { DRIVER_DEPENDENCIES, driver as default };
