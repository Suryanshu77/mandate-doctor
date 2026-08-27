import { createError, createRequiredError, importLib } from "../_chunks/utils.mjs";
import { createDefaultAzureCredential } from "../_chunks/azure.mjs";
const DRIVER_DEPENDENCIES = {
	lib: {
		name: "@azure/keyvault-secrets",
		version: "^4.10.0"
	},
	identityLib: {
		name: "@azure/identity",
		version: "^4.13.0"
	}
};
const DRIVER_NAME = "azure-key-vault";
const driver = (opts) => {
	let keyVaultClient;
	const getKeyVaultClient = () => keyVaultClient ??= (async () => {
		const { vaultName = null, serviceVersion = "7.3", pageSize = 25 } = opts;
		if (!vaultName) throw createRequiredError(DRIVER_NAME, "vaultName");
		if (pageSize > 25) throw createError(DRIVER_NAME, "`pageSize` cannot be greater than `25`");
		const { SecretClient } = await importLib(DRIVER_NAME, "@azure/keyvault-secrets", opts.lib, () => import("@azure/keyvault-secrets"));
		const credential = await createDefaultAzureCredential(DRIVER_NAME, opts);
		return new SecretClient(`https://${vaultName}.vault.azure.net`, credential, { serviceVersion });
	})();
	return {
		name: DRIVER_NAME,
		options: opts,
		getInstance: getKeyVaultClient,
		async hasItem(key) {
			try {
				await (await getKeyVaultClient()).getSecret(encode(key));
				return true;
			} catch {
				return false;
			}
		},
		async getItem(key) {
			try {
				return (await (await getKeyVaultClient()).getSecret(encode(key))).value;
			} catch {
				return null;
			}
		},
		async setItem(key, value) {
			await (await getKeyVaultClient()).setSecret(encode(key), value);
		},
		async removeItem(key) {
			await (await (await getKeyVaultClient()).beginDeleteSecret(encode(key))).pollUntilDone();
			await (await getKeyVaultClient()).purgeDeletedSecret(encode(key));
		},
		async getKeys() {
			const secrets = (await getKeyVaultClient()).listPropertiesOfSecrets().byPage({ maxPageSize: opts.pageSize || 25 });
			const keys = [];
			for await (const page of secrets) {
				const pageKeys = page.map((secret) => decode(secret.name));
				keys.push(...pageKeys);
			}
			return keys;
		},
		async getMeta(key) {
			const secret = await (await getKeyVaultClient()).getSecret(encode(key));
			return {
				mtime: secret.properties.updatedOn,
				birthtime: secret.properties.createdOn,
				expireTime: secret.properties.expiresOn
			};
		},
		async clear() {
			const secrets = (await getKeyVaultClient()).listPropertiesOfSecrets().byPage({ maxPageSize: opts.pageSize || 25 });
			for await (const page of secrets) {
				const deletionPromises = page.map(async (secret) => {
					await (await (await getKeyVaultClient()).beginDeleteSecret(secret.name)).pollUntilDone();
					await (await getKeyVaultClient()).purgeDeletedSecret(secret.name);
				});
				await Promise.all(deletionPromises);
			}
		}
	};
};
const base64Map = {
	"=": "-e-",
	"+": "-p-",
	"/": "-s-"
};
function encode(value) {
	let encoded = Buffer.from(value).toString("base64");
	for (const key in base64Map) encoded = encoded.replace(new RegExp(key.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&"), "g"), base64Map[key]);
	return encoded;
}
function decode(value) {
	let decoded = value;
	const search = new RegExp(Object.values(base64Map).join("|"), "g");
	decoded = decoded.replace(search, (match) => {
		return Object.keys(base64Map).find((key) => base64Map[key] === match);
	});
	return Buffer.from(decoded, "base64").toString();
}
export { DRIVER_DEPENDENCIES, driver as default };
