import { createError, createRequiredError, importLib } from "../_chunks/utils.mjs";
import { createDefaultAzureCredential } from "../_chunks/azure.mjs";
const DRIVER_DEPENDENCIES = {
	lib: {
		name: "@azure/data-tables",
		version: "^13.3.2"
	},
	identityLib: {
		name: "@azure/identity",
		version: "^4.13.0",
		optional: true
	}
};
const DRIVER_NAME = "azure-storage-table";
const driver = (opts) => {
	const { accountName = null, tableName = "unstorage", partitionKey = "unstorage", accountKey = null, sasKey = null, connectionString = null, pageSize = 1e3 } = opts;
	let client;
	const getClient = () => client ??= (async () => {
		if (!accountName) throw createRequiredError(DRIVER_NAME, "accountName");
		if (pageSize > 1e3) throw createError(DRIVER_NAME, "`pageSize` exceeds the maximum allowed value of `1000`");
		const { TableClient, AzureNamedKeyCredential, AzureSASCredential } = await importLib(DRIVER_NAME, "@azure/data-tables", opts.lib, () => import("@azure/data-tables"));
		const url = `https://${accountName}.table.core.windows.net`;
		if (accountKey) return new TableClient(url, tableName, new AzureNamedKeyCredential(accountName, accountKey));
		if (sasKey) return new TableClient(url, tableName, new AzureSASCredential(sasKey));
		if (connectionString) return TableClient.fromConnectionString(connectionString, tableName);
		return new TableClient(url, tableName, await createDefaultAzureCredential(DRIVER_NAME, opts));
	})();
	return {
		name: DRIVER_NAME,
		options: opts,
		getInstance: getClient,
		async hasItem(key) {
			try {
				await (await getClient()).getEntity(partitionKey, key);
				return true;
			} catch {
				return false;
			}
		},
		async getItem(key) {
			try {
				return (await (await getClient()).getEntity(partitionKey, key)).unstorageValue;
			} catch {
				return null;
			}
		},
		async setItem(key, value) {
			const entity = {
				partitionKey,
				rowKey: key,
				unstorageValue: value
			};
			await (await getClient()).upsertEntity(entity, "Replace");
		},
		async removeItem(key) {
			await (await getClient()).deleteEntity(partitionKey, key);
		},
		async getKeys() {
			const iterator = (await getClient()).listEntities().byPage({ maxPageSize: pageSize });
			const keys = [];
			for await (const page of iterator) {
				const pageKeys = page.map((entity) => entity.rowKey).filter(Boolean);
				keys.push(...pageKeys);
			}
			return keys;
		},
		async getMeta(key) {
			const entity = await (await getClient()).getEntity(partitionKey, key);
			return {
				mtime: entity.timestamp ? new Date(entity.timestamp) : void 0,
				etag: entity.etag
			};
		},
		async clear() {
			const iterator = (await getClient()).listEntities().byPage({ maxPageSize: pageSize });
			for await (const page of iterator) await Promise.all(page.map(async (entity) => {
				if (entity.partitionKey && entity.rowKey) await (await getClient()).deleteEntity(entity.partitionKey, entity.rowKey);
			}));
		}
	};
};
export { DRIVER_DEPENDENCIES, driver as default };
