import { createRequiredError, importLib } from "../_chunks/utils.mjs";
const DRIVER_DEPENDENCIES = { lib: {
	name: "@planetscale/database",
	version: "^1.19.0"
} };
const DRIVER_NAME = "planetscale";
const DEFAULT_TABLE_NAME = "storage";
const driver = (opts = {}) => {
	const table = opts.table || DEFAULT_TABLE_NAME;
	let _connection;
	const getConnection = () => _connection ??= (async () => {
		if (!opts.url) throw createRequiredError(DRIVER_NAME, "url");
		const { connect } = await importLib(DRIVER_NAME, "@planetscale/database", opts.lib, () => import("@planetscale/database"));
		const connection = connect({
			url: opts.url,
			fetch
		});
		if (opts.boostCache) connection.execute("SET @@boost_cached_queries = true;").catch((error) => {
			console.error("[unstorage] [planetscale] Failed to enable cached queries:", error);
		});
		return connection;
	})();
	return {
		name: DRIVER_NAME,
		options: {
			...opts,
			table
		},
		getInstance: getConnection,
		hasItem: async (key) => {
			return rows(await (await getConnection()).execute(`SELECT EXISTS (SELECT 1 FROM ${table} WHERE id = :key) as value;`, { key }))[0]?.value == "1";
		},
		getItem: async (key) => {
			return rows(await (await getConnection()).execute(`SELECT value from ${table} WHERE id=:key;`, { key }))[0]?.value ?? null;
		},
		setItem: async (key, value) => {
			await (await getConnection()).execute(`INSERT INTO ${table} (id, value) VALUES (:key, :value) ON DUPLICATE KEY UPDATE value = :value;`, {
				key,
				value
			});
		},
		removeItem: async (key) => {
			await (await getConnection()).execute(`DELETE FROM ${table} WHERE id=:key;`, { key });
		},
		getMeta: async (key) => {
			const res = await (await getConnection()).execute(`SELECT created_at, updated_at from ${table} WHERE id=:key;`, { key });
			return {
				birthtime: rows(res)[0]?.created_at,
				mtime: rows(res)[0]?.updated_at
			};
		},
		getKeys: async (base = "") => {
			return rows(await (await getConnection()).execute(`SELECT id from ${table} WHERE id LIKE :base;`, { base: `${base}%` })).map((r) => r.id);
		},
		clear: async () => {
			await (await getConnection()).execute(`DELETE FROM ${table};`);
		}
	};
};
function rows(res) {
	return res.rows || [];
}
export { DRIVER_DEPENDENCIES, driver as default };
