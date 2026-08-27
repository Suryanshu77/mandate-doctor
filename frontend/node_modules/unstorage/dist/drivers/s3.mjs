import { createError, createRequiredError, importLib, normalizeKey } from "../_chunks/utils.mjs";
const DRIVER_DEPENDENCIES = { lib: {
	name: "aws4fetch",
	version: "^1.0.20"
} };
const DRIVER_NAME = "s3";
const MAX_BULK_DELETE = 1e3;
const MAX_CONCURRENT_DELETES = 10;
const driver = (options) => {
	let _awsClient;
	const getAwsClient = () => _awsClient ??= (async () => {
		if (!options.accessKeyId) throw createRequiredError(DRIVER_NAME, "accessKeyId");
		if (!options.secretAccessKey) throw createRequiredError(DRIVER_NAME, "secretAccessKey");
		if (!options.endpoint) throw createRequiredError(DRIVER_NAME, "endpoint");
		if (!options.region) throw createRequiredError(DRIVER_NAME, "region");
		const { AwsClient } = await importLib(DRIVER_NAME, "aws4fetch", options.lib, () => import("aws4fetch"));
		return new AwsClient({
			service: "s3",
			accessKeyId: options.accessKeyId,
			secretAccessKey: options.secretAccessKey,
			region: options.region
		});
	})();
	const baseURL = `${options.endpoint.replace(/\/$/, "")}/${options.bucket || ""}`;
	const url = (key = "") => `${baseURL}/${normalizeKey(key, "/")}`;
	const awsFetch = async (url, opts) => {
		const request = await (await getAwsClient()).sign(url, opts);
		const res = await fetch(request);
		if (!res.ok) {
			if (res.status === 404) return null;
			throw createError(DRIVER_NAME, `[${request.method}] ${url}: ${res.status} ${res.statusText} ${await res.text()}`);
		}
		return res;
	};
	const headObject = async (key) => {
		const res = await awsFetch(url(key), { method: "HEAD" });
		if (!res) return null;
		const metaHeaders = {};
		for (const [key, value] of res.headers.entries()) {
			const match = /x-amz-meta-(.*)/.exec(key);
			if (match?.[1]) metaHeaders[match[1]] = value;
		}
		return metaHeaders;
	};
	const listObjects = async (base) => {
		const prefix = normalizeKey(base, "/");
		const keys = [];
		let continuationToken;
		do {
			const query = encodeQuery({
				"list-type": "2",
				prefix: prefix ? `${prefix}/` : void 0,
				"continuation-token": continuationToken
			});
			const res = await awsFetch(`${baseURL}?${query}`).then((r) => r?.text());
			if (!res) {
				if (continuationToken) throw createError(DRIVER_NAME, `Failed to list objects in ${prefix}`);
				return [];
			}
			const result = parseList(res);
			keys.push(...result.keys);
			if (result.isTruncated && (!result.nextToken || result.nextToken === continuationToken)) throw createError(DRIVER_NAME, `Truncated listing did not return a new continuation token for ${prefix || baseURL}`);
			continuationToken = result.isTruncated ? result.nextToken : void 0;
		} while (continuationToken);
		return keys;
	};
	const getObject = (key) => {
		return awsFetch(url(key));
	};
	const putObject = async (key, value, headers) => {
		return awsFetch(url(key), {
			method: "PUT",
			headers: headers ? Object.fromEntries(Object.entries(headers).filter(([_, v]) => v !== void 0)) : void 0,
			body: value
		});
	};
	const deleteObject = async (key) => {
		return awsFetch(url(key), { method: "DELETE" }).then((r) => {
			if (r?.status !== 204 && r?.status !== 200) throw createError(DRIVER_NAME, `Failed to delete ${key}`);
		});
	};
	const deleteObjects = async (base) => {
		const keys = await listObjects(base);
		if (keys.length === 0) return null;
		if (options.bulkDelete === false) for (let i = 0; i < keys.length; i += MAX_CONCURRENT_DELETES) await Promise.all(keys.slice(i, i + MAX_CONCURRENT_DELETES).map((key) => deleteObject(key)));
		else for (let i = 0; i < keys.length; i += MAX_BULK_DELETE) {
			const body = deleteKeysReq(keys.slice(i, i + MAX_BULK_DELETE));
			await awsFetch(`${baseURL}?delete`, {
				method: "POST",
				headers: { "x-amz-checksum-sha256": await sha256Base64(body) },
				body
			});
		}
	};
	return {
		name: DRIVER_NAME,
		options,
		getItem(key) {
			return getObject(key).then((res) => res ? res.text() : null);
		},
		getItemRaw(key) {
			return getObject(key).then((res) => res ? res.arrayBuffer() : null);
		},
		async setItem(key, value, topts) {
			await putObject(key, value, topts?.headers);
		},
		async setItemRaw(key, value, topts) {
			await putObject(key, value, topts?.headers);
		},
		getMeta(key) {
			return headObject(key);
		},
		hasItem(key) {
			return headObject(key).then((meta) => !!meta);
		},
		getKeys(base) {
			return listObjects(base);
		},
		async removeItem(key) {
			await deleteObject(key);
		},
		async clear(base) {
			await deleteObjects(base);
		}
	};
};
function deleteKeysReq(keys) {
	return `<Delete>${keys.map((key) => {
		key = key.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		return `<Object><Key>${key}</Key></Object>`;
	}).join("")}</Delete>`;
}
function encodeQuery(params) {
	return Object.entries(params).filter(([, value]) => value !== void 0).map(([key, value]) => `${encodeRfc3986(key)}=${encodeRfc3986(value)}`).join("&");
}
function encodeRfc3986(str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}
function decodeXmlText(str) {
	return str.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&amp;/g, "&");
}
async function sha256Base64(str) {
	const buffer = new TextEncoder().encode(str);
	const hash = await crypto.subtle.digest("SHA-256", buffer);
	const bytes = new Uint8Array(hash);
	const binaryString = String.fromCharCode(...bytes);
	return btoa(binaryString);
}
function parseList(xml) {
	if (!xml.startsWith("<?xml")) throw new Error("Invalid XML");
	const listBucketResult = xml.match(/<ListBucketResult[^>]*>([\s\S]*)<\/ListBucketResult>/)?.[1];
	if (!listBucketResult) throw new Error("Missing <ListBucketResult>");
	const keys = (listBucketResult.match(/<Contents[^>]*>([\s\S]*?)<\/Contents>/g) || []).map((content) => {
		const key = content.match(/<Key>([\s\S]+?)<\/Key>/)?.[1];
		return key && decodeXmlText(key);
	}).filter(Boolean);
	const isTruncated = listBucketResult.match(/<IsTruncated>([\s\S]*?)<\/IsTruncated>/)?.[1] === "true";
	const nextToken = listBucketResult.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/)?.[1];
	return {
		keys,
		isTruncated,
		nextToken: nextToken && decodeXmlText(nextToken)
	};
}
export { DRIVER_DEPENDENCIES, driver as default };
