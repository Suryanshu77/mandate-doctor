import { createRequiredError, importLib } from "../_chunks/utils.mjs";
import { createDefaultAzureCredential } from "../_chunks/azure.mjs";
const DRIVER_DEPENDENCIES = {
	lib: {
		name: "@azure/app-configuration",
		version: "^1.11.0"
	},
	identityLib: {
		name: "@azure/identity",
		version: "^4.13.0",
		optional: true
	}
};
const DRIVER_NAME = "azure-app-configuration";
const driver = (opts = {}) => {
	const labelFilter = opts.label || "\0";
	const keyFilter = opts.prefix ? `${opts.prefix}:*` : "*";
	const p = (key) => opts.prefix ? `${opts.prefix}:${key}` : key;
	const d = (key) => opts.prefix ? key.replace(opts.prefix, "") : key;
	let client;
	const getClient = () => client ??= (async () => {
		if (!opts.endpoint && !opts.appConfigName && !opts.connectionString) throw createRequiredError(DRIVER_NAME, [
			"endpoint",
			"appConfigName",
			"connectionString"
		]);
		const { AppConfigurationClient } = await importLib(DRIVER_NAME, "@azure/app-configuration", opts.lib, () => import("@azure/app-configuration"));
		if (opts.connectionString) return new AppConfigurationClient(opts.connectionString);
		return new AppConfigurationClient(opts.endpoint || `https://${opts.appConfigName}.azconfig.io`, await createDefaultAzureCredential(DRIVER_NAME, opts));
	})();
	return {
		name: DRIVER_NAME,
		options: opts,
		getInstance: getClient,
		async hasItem(key) {
			try {
				await (await getClient()).getConfigurationSetting({
					key: p(key),
					label: opts.label
				});
				return true;
			} catch {
				return false;
			}
		},
		async getItem(key) {
			try {
				return (await (await getClient()).getConfigurationSetting({
					key: p(key),
					label: opts.label
				})).value;
			} catch {
				return null;
			}
		},
		async setItem(key, value) {
			await (await getClient()).setConfigurationSetting({
				key: p(key),
				value,
				label: opts.label
			});
		},
		async removeItem(key) {
			await (await getClient()).deleteConfigurationSetting({
				key: p(key),
				label: opts.label
			});
		},
		async getKeys() {
			const settings = (await getClient()).listConfigurationSettings({
				keyFilter,
				labelFilter,
				fields: [
					"key",
					"value",
					"label"
				]
			});
			const keys = [];
			for await (const setting of settings) keys.push(d(setting.key));
			return keys;
		},
		async getMeta(key) {
			const setting = await (await getClient()).getConfigurationSetting({
				key: p(key),
				label: opts.label
			});
			return {
				mtime: setting.lastModified,
				etag: setting.etag,
				tags: setting.tags
			};
		},
		async clear() {
			const settings = (await getClient()).listConfigurationSettings({
				keyFilter,
				labelFilter,
				fields: [
					"key",
					"value",
					"label"
				]
			});
			for await (const setting of settings) await (await getClient()).deleteConfigurationSetting({
				key: setting.key,
				label: setting.label
			});
		}
	};
};
export { DRIVER_DEPENDENCIES, driver as default };
