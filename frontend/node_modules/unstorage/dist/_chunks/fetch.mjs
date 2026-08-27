function joinURL(base, path) {
	if (!base || base === "/") return path || "/";
	if (!path || path === "/") return base || "/";
	const baseHasTrailing = base[base.length - 1] === "/";
	const pathHasLeading = path[0] === "/";
	if (baseHasTrailing && pathHasLeading) return base + path.slice(1);
	if (!baseHasTrailing && !pathHasLeading) return base + "/" + path;
	return base + path;
}
function withTrailingSlash(path) {
	if (!path || path === "/") return "/";
	return path[path.length - 1] === "/" ? path : `${path}/`;
}
var FetchError = class extends Error {
	name = "FetchError";
	response;
	status;
	data;
	constructor(method, url, response, body) {
		super(`[${method}] "${url}": ${response.status} ${response.statusText}${body ? ` ${body}` : ""}`);
		this.response = response;
		this.status = response.status;
		if (body) try {
			this.data = JSON.parse(body);
		} catch {
			this.data = body;
		}
	}
};
async function fetchRequest(path = "", opts = {}) {
	const { baseURL, query, headers, body, ...init } = opts;
	const url = requestURL(baseURL, path, query);
	const _headers = normalizeHeaders(headers);
	let _body = body;
	if (isJSONSerializable(body)) {
		_body = JSON.stringify(body);
		_headers["content-type"] ??= "application/json";
	}
	const response = await fetch(url, {
		...init,
		headers: _headers,
		body: _body
	});
	if (!response.ok) throw new FetchError(init.method || "GET", url, response, await responseText(response));
	return response;
}
function createFetch(defaults = {}) {
	return (path = "", opts = {}) => fetchRequest(path, {
		...defaults,
		...opts,
		headers: {
			...defaults.headers,
			...opts.headers
		},
		query: {
			...defaults.query,
			...opts.query
		}
	});
}
function requestURL(baseURL, path, query) {
	let url = baseURL ? joinURL(baseURL, path) : path;
	if (query) {
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(query)) if (value !== void 0) params.set(key, String(value));
		const search = params.toString();
		if (search) url += (url.includes("?") ? "&" : "?") + search;
	}
	return url;
}
function normalizeHeaders(headers) {
	const normalized = {};
	for (const [key, value] of Object.entries(headers || {})) if (value !== void 0) normalized[key.toLowerCase()] = value;
	return normalized;
}
function isJSONSerializable(body) {
	if (!body || typeof body !== "object") return false;
	if (Array.isArray(body)) return true;
	const proto = Object.getPrototypeOf(body);
	return proto === null || proto === Object.prototype;
}
async function responseText(response) {
	try {
		const text = (await response.text()).trim();
		return text.length > 256 ? text.slice(0, 256) + "..." : text || void 0;
	} catch {}
}
export { FetchError, createFetch, fetchRequest, joinURL, withTrailingSlash };
