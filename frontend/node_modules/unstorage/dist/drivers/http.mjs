import "../_chunks/utils.mjs";
import { FetchError, fetchRequest, joinURL } from "../_chunks/fetch.mjs";
const DRIVER_NAME = "http";
const driver = (opts) => {
	const r = (key = "") => joinURL(opts.base, key.replace(/:/g, "/"));
	const rBase = (key = "") => joinURL(opts.base, (key || "/").replace(/:/g, "/") + ":");
	const catchFetchError = (error, fallbackVal = null) => {
		if (error instanceof FetchError && error.status === 404) return fallbackVal;
		throw error;
	};
	const getHeaders = (topts, defaultHeaders) => {
		const headers = {
			...defaultHeaders,
			...opts.headers,
			...topts?.headers
		};
		if (topts?.ttl && !headers["x-ttl"]) headers["x-ttl"] = topts.ttl + "";
		return headers;
	};
	return {
		name: DRIVER_NAME,
		options: opts,
		async hasItem(key, topts) {
			return fetchRequest(r(key), {
				method: "HEAD",
				headers: getHeaders(topts)
			}).then(() => true).catch((error) => catchFetchError(error, false));
		},
		async getItem(key, tops) {
			const res = await fetchRequest(r(key), { headers: getHeaders(tops) }).catch(catchFetchError);
			return res ? await res.text() : null;
		},
		async getItemRaw(key, topts) {
			const res = await fetchRequest(r(key), { headers: getHeaders(topts, { accept: "application/octet-stream" }) }).catch(catchFetchError);
			return res ? await res.arrayBuffer() : null;
		},
		async getMeta(key, topts) {
			const res = await fetchRequest(r(key), {
				method: "HEAD",
				headers: getHeaders(topts)
			});
			let mtime;
			let ttl;
			const _lastModified = res.headers.get("last-modified");
			if (_lastModified) mtime = new Date(_lastModified);
			const _ttl = res.headers.get("x-ttl");
			if (_ttl) ttl = Number.parseInt(_ttl, 10);
			return {
				status: res.status,
				mtime,
				ttl
			};
		},
		async setItem(key, value, topts) {
			await fetchRequest(r(key), {
				method: "PUT",
				body: value,
				headers: getHeaders(topts)
			});
		},
		async setItemRaw(key, value, topts) {
			await fetchRequest(r(key), {
				method: "PUT",
				body: value,
				headers: getHeaders(topts, { "content-type": "application/octet-stream" })
			});
		},
		async removeItem(key, topts) {
			await fetchRequest(r(key), {
				method: "DELETE",
				headers: getHeaders(topts)
			});
		},
		async getKeys(base, topts) {
			const value = await (await fetchRequest(rBase(base), { headers: getHeaders(topts) })).json();
			return Array.isArray(value) ? value : [];
		},
		async clear(base, topts) {
			await fetchRequest(rBase(base), {
				method: "DELETE",
				headers: getHeaders(topts)
			});
		}
	};
};
export { driver as default };
