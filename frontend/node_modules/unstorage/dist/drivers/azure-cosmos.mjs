import { createRequiredError, importLib } from "../_chunks/utils.mjs";
import { createDefaultAzureCredential } from "../_chunks/azure.mjs";
const DRIVER_DEPENDENCIES = {
	lib: {
		name: "@azure/cosmos",
		version: "^4.9.1"
	},
	identityLib: {
		name: "@azure/identity",
		version: "^4.13.0",
		optional: true
	}
};
const DRIVER_NAME = "azure-cosmos";
const driver = (opts) => {
	let client;
	const getCosmosClient = () => client ??= (async () => {
		if (!opts.endpoint) throw createRequiredError(DRIVER_NAME, "endpoint");
		const { CosmosClient } = await importLib(DRIVER_NAME, "@azure/cosmos", opts.lib, () => import("@azure/cosmos"));
		const { database } = await (opts.accountKey ? new CosmosClient({
			endpoint: opts.endpoint,
			key: opts.accountKey
		}) : new CosmosClient({
			endpoint: opts.endpoint,
			aadCredentials: await createDefaultAzureCredential(DRIVER_NAME, opts)
		})).databases.createIfNotExists({ id: opts.databaseName || "unstorage" });
		const { container } = await database.containers.createIfNotExists({ id: opts.containerName || "unstorage" });
		return container;
	})();
	return {
		name: DRIVER_NAME,
		options: opts,
		getInstance: getCosmosClient,
		async hasItem(key) {
			return (await (await getCosmosClient()).item(key).read()).resource ? true : false;
		},
		async getItem(key) {
			const item = await (await getCosmosClient()).item(key).read();
			return item.resource ? item.resource.value : null;
		},
		async setItem(key, value) {
			const modified = /* @__PURE__ */ new Date();
			await (await getCosmosClient()).items.upsert({
				id: key,
				value,
				modified
			}, { consistencyLevel: "Session" });
		},
		async removeItem(key) {
			await (await getCosmosClient()).item(key).delete({ consistencyLevel: "Session" });
		},
		async getKeys() {
			return (await (await getCosmosClient()).items.query(`SELECT { id } from c`).fetchAll()).resources.map((item) => item.id);
		},
		async getMeta(key) {
			const item = await (await getCosmosClient()).item(key).read();
			return { mtime: item.resource?.modified ? new Date(item.resource.modified) : void 0 };
		},
		async clear() {
			const items = (await (await getCosmosClient()).items.query(`SELECT { id } from c`).fetchAll()).resources;
			for (const item of items) await (await getCosmosClient()).item(item.id).delete({ consistencyLevel: "Session" });
		}
	};
};
export { DRIVER_DEPENDENCIES, driver as default };
