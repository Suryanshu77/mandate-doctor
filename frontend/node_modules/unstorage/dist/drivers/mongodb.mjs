import { createRequiredError, importLib } from "../_chunks/utils.mjs";
const DRIVER_DEPENDENCIES = { lib: {
	name: "mongodb",
	version: "^6 || ^7"
} };
const DRIVER_NAME = "mongodb";
const driver = (opts) => {
	let collection;
	let client;
	const getMongoCollection = () => collection ??= (async () => {
		if (!opts.connectionString) throw createRequiredError(DRIVER_NAME, "connectionString");
		const { MongoClient } = await importLib(DRIVER_NAME, "mongodb", opts.lib, () => import("mongodb"));
		client = new MongoClient(opts.connectionString, opts.clientOptions);
		return client.db(opts.databaseName || "unstorage").collection(opts.collectionName || "unstorage");
	})();
	return {
		name: DRIVER_NAME,
		options: opts,
		getInstance: getMongoCollection,
		async hasItem(key) {
			return !!await (await getMongoCollection()).findOne({ key });
		},
		async getItem(key) {
			return (await (await getMongoCollection()).findOne({ key }))?.value ?? null;
		},
		async getItems(items) {
			const keys = items.map((item) => item.key);
			const result = await (await getMongoCollection()).find({ key: { $in: keys } }).toArray();
			const resultMap = new Map(result.map((doc) => [doc.key, doc]));
			return keys.map((key) => {
				return {
					key,
					value: resultMap.get(key)?.value ?? null
				};
			});
		},
		async setItem(key, value) {
			const currentDateTime = /* @__PURE__ */ new Date();
			await (await getMongoCollection()).updateOne({ key }, {
				$set: {
					key,
					value,
					modifiedAt: currentDateTime
				},
				$setOnInsert: { createdAt: currentDateTime }
			}, { upsert: true });
		},
		async setItems(items) {
			const currentDateTime = /* @__PURE__ */ new Date();
			const operations = items.map(({ key, value }) => ({ updateOne: {
				filter: { key },
				update: {
					$set: {
						key,
						value,
						modifiedAt: currentDateTime
					},
					$setOnInsert: { createdAt: currentDateTime }
				},
				upsert: true
			} }));
			await (await getMongoCollection()).bulkWrite(operations);
		},
		async removeItem(key) {
			await (await getMongoCollection()).deleteOne({ key });
		},
		async getKeys() {
			return await (await getMongoCollection()).find().project({ key: true }).map((d) => d.key).toArray();
		},
		async getMeta(key) {
			const document = await (await getMongoCollection()).findOne({ key });
			return document ? {
				mtime: document.modifiedAt,
				birthtime: document.createdAt
			} : {};
		},
		async clear() {
			await (await getMongoCollection()).deleteMany({});
		},
		async dispose() {
			if (collection) {
				await collection.catch(() => {});
				collection = void 0;
				await client?.close();
				client = void 0;
			}
		}
	};
};
export { DRIVER_DEPENDENCIES, driver as default };
