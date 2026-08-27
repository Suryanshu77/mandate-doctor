import { stringify } from "./_chunks/_utils.mjs";
import { normalizeBaseKey, normalizeKey } from "./_chunks/utils2.mjs";
const MethodToTypeMap = {
	GET: "read",
	HEAD: "read",
	PUT: "write",
	DELETE: "write"
};
const JSON_HEADERS = { "content-type": "application/json;charset=UTF-8" };
function createStorageHandler(storage, opts = {}) {
	return async (req) => {
		try {
			return await handleRequest(storage, opts, req);
		} catch (error) {
			return errorResponse(error);
		}
	};
}
async function handleRequest(storage, opts, req) {
	const _path = opts.resolvePath?.(req) ?? requestPath(req.url);
	const lastChar = _path[_path.length - 1];
	const isBaseKey = lastChar === ":" || lastChar === "/";
	const key = isBaseKey ? normalizeBaseKey(_path) : normalizeKey(_path);
	const type = MethodToTypeMap[req.method];
	if (!type) throw new HTTPError(405, `Method Not Allowed: ${req.method}`);
	if (opts.authorize) try {
		await opts.authorize({
			type,
			request: req,
			key
		});
	} catch (error) {
		throw error instanceof HTTPError ? error : new HTTPError(typeof error?.status === "number" ? error.status : 401, error?.message, { cause: error });
	}
	if (req.method === "GET") {
		if (isBaseKey) {
			const keys = await storage.getKeys(key);
			return new Response(JSON.stringify(keys.map((key) => key.replace(/:/g, "/"))), { headers: JSON_HEADERS });
		}
		const isRaw = req.headers.get("accept") === "application/octet-stream";
		const driverValue = await (isRaw ? storage.getItemRaw(key) : storage.getItem(key));
		if (driverValue === null) throw new HTTPError(404, "KV value not found");
		return new Response(isRaw ? rawBody(driverValue) : stringify(driverValue), { headers: metaHeaders(await storage.getMeta(key)) });
	}
	if (req.method === "HEAD") {
		if (!await storage.hasItem(key)) throw new HTTPError(404, "KV value not found");
		return new Response(null, { headers: metaHeaders(await storage.getMeta(key)) });
	}
	if (req.method === "PUT") {
		const isRaw = req.headers.get("content-type") === "application/octet-stream";
		const topts = { ttl: Number(req.headers.get("x-ttl")) || void 0 };
		if (isRaw) await storage.setItemRaw(key, await req.bytes(), topts);
		else await storage.setItem(key, await req.text(), topts);
		return new Response("OK");
	}
	await (isBaseKey ? storage.clear(key) : storage.removeItem(key));
	return new Response("OK");
}
function metaHeaders(meta) {
	const headers = new Headers();
	if (meta.mtime) headers.set("last-modified", new Date(meta.mtime).toUTCString());
	if (meta.ttl) {
		headers.set("x-ttl", `${meta.ttl}`);
		headers.set("cache-control", `max-age=${meta.ttl}`);
	}
	return headers;
}
function requestPath(url) {
	const pathStart = url.indexOf("/", url.indexOf("://") + 3);
	if (pathStart === -1) return "/";
	const queryStart = url.indexOf("?", pathStart);
	return queryStart === -1 ? url.slice(pathStart) : url.slice(pathStart, queryStart);
}
function rawBody(value) {
	if (typeof value === "string" || ArrayBuffer.isView(value) || value instanceof ArrayBuffer || value instanceof Blob || value instanceof ReadableStream) return value;
	return stringify(value);
}
var HTTPError = class extends Error {
	name = "HTTPError";
	status;
	statusText;
	constructor(status, statusText, opts) {
		const _statusText = sanitizeStatusText(statusText);
		super(_statusText, opts);
		this.status = sanitizeStatus(status);
		this.statusText = _statusText;
	}
};
function errorResponse(error) {
	if (!(error instanceof HTTPError)) {
		console.error("[unstorage] [server]", error);
		error = new HTTPError(500, "Internal Server Error");
	}
	const { status, statusText, message } = error;
	return new Response(JSON.stringify({
		status,
		statusText,
		message
	}), {
		status,
		statusText,
		headers: JSON_HEADERS
	});
}
function sanitizeStatus(status) {
	return status >= 100 && status <= 599 ? status : 500;
}
function sanitizeStatusText(statusText = "") {
	return statusText.replace(/[^\u0020-\u007E]/g, "");
}
export { createStorageHandler };
