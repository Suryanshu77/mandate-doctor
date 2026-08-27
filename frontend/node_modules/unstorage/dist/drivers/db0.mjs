import { createError } from "../_chunks/utils.mjs";
const DRIVER_DEPENDENCIES = { database: {
	name: "db0",
	version: ">=0.3.4"
} };
const DRIVER_NAME = "db0";
const DEFAULT_TABLE_NAME = "unstorage";
const kExperimentalWarning = "__unstorage_db0_experimental_warning__";
const driver = (opts) => {
	const tableName = opts.tableName || DEFAULT_TABLE_NAME;
	let setupPromise;
	let setupDone = false;
	const ensureTable = () => {
		if (setupDone) return;
		if (!setupPromise) {
			if (!globalThis[kExperimentalWarning]) {
				console.warn("[unstorage]: Database driver is experimental and behavior may change in the future.");
				globalThis[kExperimentalWarning] = true;
			}
			setupPromise = setupTable(opts.database, tableName).then(() => {
				setupDone = true;
				setupPromise = void 0;
			});
		}
		return setupPromise;
	};
	const isMysql = opts.database.dialect === "mysql";
	return {
		name: DRIVER_NAME,
		options: {
			...opts,
			tableName
		},
		getInstance: () => opts.database,
		async hasItem(key) {
			await ensureTable();
			const { rows } = isMysql ? await opts.database.sql`SELECT EXISTS (SELECT 1 FROM {${tableName}} WHERE \`key\` = ${key}) AS \`value\`` : await opts.database.sql`SELECT EXISTS (SELECT 1 FROM {${tableName}} WHERE key = ${key}) AS value`;
			return rows?.[0]?.value == "1";
		},
		getItem: async (key) => {
			await ensureTable();
			const { rows } = isMysql ? await opts.database.sql`SELECT value FROM {${tableName}} WHERE \`key\` = ${key}` : await opts.database.sql`SELECT value FROM {${tableName}} WHERE key = ${key}`;
			return rows?.[0]?.value ?? null;
		},
		getItemRaw: async (key) => {
			await ensureTable();
			const { rows } = isMysql ? await opts.database.sql`SELECT \`blob\` as value FROM {${tableName}} WHERE \`key\` = ${key}` : await opts.database.sql`SELECT blob as value FROM {${tableName}} WHERE key = ${key}`;
			return rows?.[0]?.value ?? null;
		},
		setItem: async (key, value) => {
			await ensureTable();
			if (isMysql) await opts.database.sql`INSERT INTO {${tableName}} (\`key\`, \`value\`, created_at, updated_at) VALUES (${key}, ${value}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE value = ${value}, updated_at = CURRENT_TIMESTAMP`;
			else await opts.database.sql`INSERT INTO {${tableName}} (key, value, created_at, updated_at) VALUES (${key}, ${value}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = ${value}, updated_at = CURRENT_TIMESTAMP`;
		},
		async setItemRaw(key, value) {
			await ensureTable();
			if (isMysql) {
				const blob = Buffer.from(value);
				await opts.database.sql`INSERT INTO {${tableName}} (\`key\`, \`blob\`, created_at, updated_at) VALUES (${key}, ${blob}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE \`blob\` = ${blob}, updated_at = CURRENT_TIMESTAMP`;
			} else await opts.database.sql`INSERT INTO {${tableName}} (key, blob, created_at, updated_at) VALUES (${key}, ${value}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET blob = ${value}, updated_at = CURRENT_TIMESTAMP`;
		},
		removeItem: async (key) => {
			await ensureTable();
			if (isMysql) await opts.database.sql`DELETE FROM {${tableName}} WHERE \`key\`=${key}`;
			else await opts.database.sql`DELETE FROM {${tableName}} WHERE key=${key}`;
		},
		getMeta: async (key) => {
			await ensureTable();
			const { rows } = isMysql ? await opts.database.sql`SELECT created_at, updated_at FROM {${tableName}} WHERE \`key\` = ${key}` : await opts.database.sql`SELECT created_at, updated_at FROM {${tableName}} WHERE key = ${key}`;
			return {
				birthtime: toDate(rows?.[0]?.created_at),
				mtime: toDate(rows?.[0]?.updated_at)
			};
		},
		getKeys: async (base = "") => {
			await ensureTable();
			const { rows } = isMysql ? await opts.database.sql`SELECT \`key\` FROM {${tableName}} WHERE \`key\` LIKE ${base + "%"}` : await opts.database.sql`SELECT key FROM {${tableName}} WHERE key LIKE ${base + "%"}`;
			return rows?.map((r) => r.key);
		},
		clear: async () => {
			await ensureTable();
			await opts.database.sql`DELETE FROM {${tableName}}`;
		},
		dispose: async () => {
			await opts.database.dispose();
		}
	};
};
async function setupTable(database, tableName) {
	switch (database.dialect) {
		case "sqlite":
		case "libsql":
			await database.sql`
      CREATE TABLE IF NOT EXISTS {${tableName}} (
        key TEXT PRIMARY KEY,
        value TEXT,
        blob BLOB,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;
			return;
		case "postgresql":
			await database.sql`
      CREATE TABLE IF NOT EXISTS {${tableName}} (
        key VARCHAR(255) NOT NULL PRIMARY KEY,
        value TEXT,
        blob BYTEA,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
			return;
		case "mysql":
			await database.sql`
      CREATE TABLE IF NOT EXISTS {${tableName}} (
        \`key\` VARCHAR(255) NOT NULL PRIMARY KEY,
        \`value\` LONGTEXT,
        \`blob\` BLOB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
			return;
		default: throw createError(DRIVER_NAME, `unsuppoted SQL dialect: ${database.dialect}`);
	}
}
function toDate(timestamp) {
	return timestamp ? new Date(timestamp) : void 0;
}
export { DRIVER_DEPENDENCIES, driver as default };
