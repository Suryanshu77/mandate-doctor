import { importLib, joinKeys } from "../_chunks/utils.mjs";
const DRIVER_DEPENDENCIES = { lib: {
	name: "ioredis",
	version: "^5.9.3 || ^6"
} };
const DRIVER_NAME = "redis";
const driver = (opts) => {
	let redisClient;
	const getRedisClient = () => redisClient ??= (async () => {
		const { Redis } = await importLib(DRIVER_NAME, "ioredis", opts.lib, () => import("ioredis"));
		if (opts.cluster) return new Redis.Cluster(opts.cluster, opts.clusterOptions);
		return opts.url ? new Redis(opts.url, opts) : new Redis(opts);
	})();
	const base = (opts.base || "").replace(/:$/, "");
	const p = (...keys) => joinKeys(base, ...keys);
	const d = (key) => base ? key.replace(`${base}:`, "") : key;
	if (opts.preConnect) getRedisClient().catch((error) => {
		console.error(error);
	});
	const scan = async (pattern) => {
		const client = await getRedisClient();
		const keys = [];
		let cursor = "0";
		do {
			const [nextCursor, scanKeys] = opts.scanCount ? await client.scan(cursor, "MATCH", pattern, "COUNT", opts.scanCount) : await client.scan(cursor, "MATCH", pattern);
			cursor = nextCursor;
			keys.push(...scanKeys);
		} while (cursor !== "0");
		return keys;
	};
	return {
		name: DRIVER_NAME,
		options: opts,
		getInstance: getRedisClient,
		async hasItem(key) {
			return Boolean(await (await getRedisClient()).exists(p(key)));
		},
		async getItem(key) {
			return await (await getRedisClient()).get(p(key)) ?? null;
		},
		async getItemRaw(key) {
			return await (await getRedisClient()).getBuffer(p(key)) ?? null;
		},
		async getItems(items) {
			const keys = items.map((item) => p(item.key));
			const data = await (await getRedisClient()).mget(...keys);
			return keys.map((key, index) => {
				return {
					key: d(key),
					value: data[index] ?? null
				};
			});
		},
		async setItem(key, value, tOptions) {
			const ttl = tOptions?.ttl ?? opts.ttl;
			if (ttl) await (await getRedisClient()).set(p(key), value, "EX", ttl);
			else await (await getRedisClient()).set(p(key), value);
		},
		async setItems(items, commonOptions) {
			if (items.length === 0) return;
			const client = await getRedisClient();
			const defaultTtl = commonOptions?.ttl ?? opts.ttl;
			const getTtl = (item) => item.options?.ttl ?? defaultTtl;
			if (opts.cluster) {
				await Promise.all(items.map((item) => {
					const ttl = getTtl(item);
					return ttl ? client.set(p(item.key), item.value, "EX", ttl) : client.set(p(item.key), item.value);
				}));
				return;
			}
			if (defaultTtl || items.some((item) => item.options?.ttl)) {
				const pipeline = client.pipeline();
				for (const item of items) {
					const ttl = getTtl(item);
					if (ttl) pipeline.set(p(item.key), item.value, "EX", ttl);
					else pipeline.set(p(item.key), item.value);
				}
				const error = (await pipeline.exec())?.find(([error]) => error)?.[0];
				if (error) throw error;
			} else {
				const args = [];
				for (const item of items) args.push(p(item.key), item.value);
				await client.mset(...args);
			}
		},
		async setItemRaw(key, value, tOptions) {
			const _value = normalizeValue(value);
			const ttl = tOptions?.ttl ?? opts.ttl;
			if (ttl) await (await getRedisClient()).set(p(key), _value, "EX", ttl);
			else await (await getRedisClient()).set(p(key), _value);
		},
		async removeItem(key) {
			await (await getRedisClient()).unlink(p(key));
		},
		async getKeys(base) {
			return (await scan(p(base, "*"))).map((key) => d(key));
		},
		async clear(base) {
			const keys = await scan(p(base, "*"));
			if (keys.length === 0) return;
			await (await getRedisClient()).unlink(keys);
		},
		async dispose() {
			(await getRedisClient()).disconnect();
		}
	};
};
function normalizeValue(value) {
	const type = typeof value;
	if (type === "string" || type === "number") return value;
	if (Buffer.isBuffer(value)) return value;
	if (isTypedArray(value)) {
		if (Buffer.copyBytesFrom) return Buffer.copyBytesFrom(value, value.byteOffset, value.byteLength);
		else return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
	}
	if (value instanceof ArrayBuffer) return Buffer.from(value);
	return JSON.stringify(value);
}
function isTypedArray(value) {
	return value instanceof Int8Array || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int16Array || value instanceof Uint16Array || value instanceof Int32Array || value instanceof Uint32Array || value instanceof Float32Array || value instanceof Float64Array || value instanceof BigInt64Array || value instanceof BigUint64Array;
}
export { DRIVER_DEPENDENCIES, driver as default };
