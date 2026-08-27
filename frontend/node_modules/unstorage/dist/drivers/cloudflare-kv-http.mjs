import { createError, createRequiredError, joinKeys } from "../_chunks/utils.mjs";
import { FetchError, createFetch } from "../_chunks/fetch.mjs";
const DRIVER_NAME = "cloudflare-kv-http";
const driver = (opts) => {
	if (!opts.accountId) throw createRequiredError(DRIVER_NAME, "accountId");
	if (!opts.namespaceId) throw createRequiredError(DRIVER_NAME, "namespaceId");
	let headers;
	if ("apiToken" in opts) headers = { Authorization: `Bearer ${opts.apiToken}` };
	else if ("userServiceKey" in opts) headers = { "X-Auth-User-Service-Key": opts.userServiceKey };
	else if (opts.email && opts.apiKey) headers = {
		"X-Auth-Email": opts.email,
		"X-Auth-Key": opts.apiKey
	};
	else throw createError(DRIVER_NAME, "One of the `apiToken`, `userServiceKey`, or a combination of `email` and `apiKey` is required.");
	const baseURL = `${opts.apiURL || "https://api.cloudflare.com"}/client/v4/accounts/${opts.accountId}/storage/kv/namespaces/${opts.namespaceId}`;
	const kvFetch = createFetch({
		baseURL,
		headers
	});
	const r = (key = "") => opts.base ? joinKeys(opts.base, key) : key;
	const hasItem = async (key) => {
		try {
			return (await kvFetch(`/metadata/${r(key)}`).then((res) => res.json()))?.success === true;
		} catch (error) {
			if (error instanceof FetchError && error.status === 404) return false;
			throw error;
		}
	};
	const getItem = async (key) => {
		try {
			return await kvFetch(`/values/${r(key)}`).then((res) => res.text());
		} catch (error) {
			if (error instanceof FetchError && error.status === 404) return null;
			throw error;
		}
	};
	const setItem = async (key, value, topts) => {
		await kvFetch(`/values/${r(key)}`, {
			method: "PUT",
			body: value,
			query: topts?.ttl ? { expiration_ttl: Math.max(topts?.ttl, opts.minTTL || 60) } : void 0
		});
	};
	const removeItem = async (key) => {
		await kvFetch(`/values/${r(key)}`, { method: "DELETE" });
	};
	const getKeys = async (base) => {
		const keys = [];
		const query = {};
		if (base || opts.base) query.prefix = r(base);
		const firstPage = await kvFetch("/keys", { query }).then((res) => res.json());
		for (const item of firstPage.result) keys.push(item.name);
		const cursor = firstPage.result_info.cursor;
		if (cursor) query.cursor = cursor;
		while (query.cursor) {
			const pageResult = await kvFetch("/keys", { query }).then((res) => res.json());
			for (const item of pageResult.result) keys.push(item.name);
			const pageCursor = pageResult.result_info.cursor;
			query.cursor = pageCursor ? pageCursor : void 0;
		}
		return keys;
	};
	const clear = async () => {
		const chunks = (await getKeys()).reduce((acc, key, i) => {
			if (i % 1e4 === 0) acc.push([]);
			acc[acc.length - 1].push(key);
			return acc;
		}, [[]]);
		await Promise.all(chunks.map(async (chunk) => {
			if (chunk.length > 0) await kvFetch("/bulk/delete", {
				method: "POST",
				body: chunk
			});
		}));
	};
	return {
		name: DRIVER_NAME,
		options: opts,
		hasItem,
		getItem,
		setItem,
		removeItem,
		getKeys: (base) => getKeys(base).then((keys) => keys.map((key) => opts.base ? key.slice(opts.base.length) : key)),
		clear
	};
};
export { driver as default };
