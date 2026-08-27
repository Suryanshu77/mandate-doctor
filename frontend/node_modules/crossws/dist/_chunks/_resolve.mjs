import { getWebSocketHooks, warnOnce } from "./adapter.mjs";
const HOOK_NAMES = [
	"upgrade",
	"message",
	"open",
	"close",
	"drain",
	"error",
	"ping",
	"pong"
];
function defaultResolve(server, wsOpts) {
	if (wsOpts.resolve) return wsOpts.resolve;
	if (HOOK_NAMES.some((name) => typeof wsOpts[name] === "function")) return;
	const fetch = server.options.fetch;
	if (typeof fetch !== "function") throw new Error("[crossws] server has no fetch handler to resolve WebSocket hooks from");
	return (req) => Promise.resolve(fetch(req)).then((res) => hooksFromFetchResult(res, getWebSocketHooks(req)));
}
function hooksFromFetchResult(res, reqHooks) {
	const crossws = res?.crossws;
	if (res instanceof Response) {
		if (crossws) {
			res.body?.cancel().catch(() => {});
			return crossws;
		}
		if (!res.ok && res.status !== 101 && !(res.status === 426 && reqHooks)) {
			if (res.status === 426) warnOnce("[crossws] Received a 426 response with no WebSocket hooks attached. The app routed to a WebSocket handler but its hooks were lost in transit (a middleware likely rebuilt the response). Attach them to the request with `setWebSocketHooks(request, hooks)` instead, or upgrade the framework to a version that does.");
			return { upgrade: () => res };
		}
		res.body?.cancel().catch(() => {});
		return reqHooks;
	}
	const headers = res?.headers;
	if (!headers) return crossws ?? reqHooks;
	const hooks = crossws ?? reqHooks;
	const userUpgrade = hooks?.upgrade;
	return {
		...hooks,
		async upgrade(request) {
			const result = await userUpgrade?.(request);
			if (result instanceof Response) return result;
			return {
				...result,
				headers: mergeHeaders(headers, result?.headers)
			};
		}
	};
}
function mergeHeaders(base, extra) {
	if (!extra) return base;
	const merged = new Headers(base);
	for (const [key, value] of new Headers(extra)) merged.set(key, value);
	return merged;
}
export { defaultResolve };
