import { createError, createRequiredError, importLib } from "../_chunks/utils.mjs";
const DRIVER_DEPENDENCIES = { lib: {
	name: "@netlify/blobs",
	version: "^6.5.0 || ^7.0.0 || ^8.1.0 || ^9.0.0 || ^10.0.0 || ^11.0.0"
} };
const DRIVER_NAME = "netlify-blobs";
const driver = (options) => {
	const { deployScoped, name, lib, ...opts } = options;
	let store;
	const getClient = () => store ??= (async () => {
		const { getStore, getDeployStore } = await importLib(DRIVER_NAME, "@netlify/blobs", lib, () => import("@netlify/blobs"));
		if (deployScoped) {
			if (name) throw createError(DRIVER_NAME, "deploy-scoped stores cannot have a name");
			return getDeployStore({
				fetch,
				...opts
			});
		}
		if (!name) throw createRequiredError(DRIVER_NAME, "name");
		return getStore({
			name: encodeURIComponent(name),
			fetch,
			...opts
		});
	})();
	return {
		name: DRIVER_NAME,
		options,
		getInstance: getClient,
		async hasItem(key) {
			return (await getClient()).getMetadata(key).then(Boolean);
		},
		getItem: async (key, tops) => {
			return (await getClient()).get(key, tops);
		},
		async getMeta(key) {
			return (await getClient()).getMetadata(key);
		},
		async getItemRaw(key, topts) {
			return (await getClient()).get(key, { type: topts?.type ?? "arrayBuffer" });
		},
		async setItem(key, value, topts) {
			await (await getClient()).set(key, value, topts);
		},
		async setItemRaw(key, value, topts) {
			await (await getClient()).set(key, value, topts);
		},
		async removeItem(key) {
			return (await getClient()).delete(key);
		},
		async getKeys(base, tops) {
			return (await (await getClient()).list({
				...tops,
				prefix: base
			})).blobs.map((item) => item.key);
		},
		async clear(base) {
			const client = await getClient();
			return Promise.allSettled((await client.list({ prefix: base })).blobs.map((item) => client.delete(item.key))).then(() => {});
		}
	};
};
export { DRIVER_DEPENDENCIES, driver as default };
