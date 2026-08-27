globalThis.__nitro_main__ = import.meta.url;
import { i as HTTPError, n as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/robot.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1a-elTi1YCxzOy2L+P7t7mP5WljB0Q\"",
		"mtime": "2026-08-25T08:41:14.840Z",
		"size": 26,
		"path": "../public/robot.txt"
	},
	"/assets/analytics-vfS-9UAy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"47-AU3CZxLZkq8qO5VCIaVmaiqOx0A\"",
		"mtime": "2026-08-27T17:46:02.915Z",
		"size": 71,
		"path": "../public/assets/analytics-vfS-9UAy.js"
	},
	"/assets/approvals-BsYLcMdw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"47-vjjiKE/CxTycG1AsQGJGLIYRTcE\"",
		"mtime": "2026-08-27T17:46:02.928Z",
		"size": 71,
		"path": "../public/assets/approvals-BsYLcMdw.js"
	},
	"/assets/recovery-cases-C6EMex_3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"66-sAUL8qsIpyPoNZPhqrVzW8uAHuQ\"",
		"mtime": "2026-08-27T17:46:02.930Z",
		"size": 102,
		"path": "../public/assets/recovery-cases-C6EMex_3.js"
	},
	"/assets/audit-replay-E0Fk5Bey.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"47-Ulzl8cRfr9d1FKYZpqh2Z3BM2uA\"",
		"mtime": "2026-08-27T17:46:02.928Z",
		"size": 71,
		"path": "../public/assets/audit-replay-E0Fk5Bey.js"
	},
	"/assets/index-osgbBhnB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5fe81-ZCoqcvVqXx2BP0dUDeUt41fD59w\"",
		"mtime": "2026-08-27T17:46:02.915Z",
		"size": 392833,
		"path": "../public/assets/index-osgbBhnB.js"
	},
	"/assets/pages-DOGTshXJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6edb4-24QnRrOArFcGT0cqXJOcVywhXjA\"",
		"mtime": "2026-08-27T17:46:02.930Z",
		"size": 454068,
		"path": "../public/assets/pages-DOGTshXJ.js"
	},
	"/assets/recovery-cases.index-D3hwt1Gf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"47-54i3Mvk3b0s4x4unmvLTTwIzLFQ\"",
		"mtime": "2026-08-27T17:46:02.934Z",
		"size": 71,
		"path": "../public/assets/recovery-cases.index-D3hwt1Gf.js"
	},
	"/assets/recovery-cases._caseId-DR9bydU6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"47-lgx79x8bSLhpIBDOYtdVfy5GAbY\"",
		"mtime": "2026-08-27T17:46:02.930Z",
		"size": 71,
		"path": "../public/assets/recovery-cases._caseId-DR9bydU6.js"
	},
	"/assets/routes-Bp4ybA1_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"47-hQ2D6HBiEDZHGc3w+YCj3ZVDWvg\"",
		"mtime": "2026-08-27T17:46:02.934Z",
		"size": 71,
		"path": "../public/assets/routes-Bp4ybA1_.js"
	},
	"/assets/settings-BmcWSM1s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"47-AKNBnO0MMS54bdjdI+vSH+k8xRc\"",
		"mtime": "2026-08-27T17:46:02.937Z",
		"size": 71,
		"path": "../public/assets/settings-BmcWSM1s.js"
	},
	"/assets/styles-CxYyysuA.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1521c-wVSggRQcK+8uarCCpz4gzIdoG4g\"",
		"mtime": "2026-08-27T17:46:02.937Z",
		"size": 86556,
		"path": "../public/assets/styles-CxYyysuA.css"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_W4cUtP = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_W4cUtP
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
