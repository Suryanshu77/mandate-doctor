//#region src/runtime-bridge.ts
/**
* Worker-side bridge for isolated server runtimes (Nitro v3 worker, Cloudflare workerd).
*
* Injected into the `@tanstack/devtools-event-client` module ONLY in non-client
* (server) environments during dev. At module-eval time it gives the isolated
* runtime a real `globalThis.__TANSTACK_EVENT_TARGET__` (so the unchanged
* `EventClient` uses it instead of a throwaway target) and bridges that target to
* the Vite dev process over the framework plugin's existing HMR HotChannel.
*
* Guards:
* - `import.meta.hot` falsy (production / no HMR) -> tree-shaken / no-op.
* - global target already set (in-process RunnableDevEnvironment, where
*   ServerEventBus lives) -> no-op, so existing behavior is unchanged.
*
* The bridge replicates ServerEventBus's in-process responsibilities so the
* EventClient protocol is identical across the wire (see design doc).
*/
function generateRuntimeBridgeCode() {
	return `
;(function __tsdRuntimeBridge() {
  if (typeof import.meta === 'undefined' || !import.meta.hot) return;
  if (!globalThis.__TANSTACK_EVENT_TARGET__) {
    var target = new EventTarget();
    globalThis.__TANSTACK_EVENT_TARGET__ = target;

    // Complete EventClient's connect handshake locally so queued events flush.
    target.addEventListener('tanstack-connect', function () {
      target.dispatchEvent(new CustomEvent('tanstack-connect-success'));
    });

    // Worker -> Vite dev server.
    target.addEventListener('tanstack-dispatch-event', function (e) {
      import.meta.hot.send('tsd:to-server', e.detail);
    });

    // Vite dev server -> worker listeners.
    import.meta.hot.on('tsd:to-client', function (event) {
      target.dispatchEvent(new CustomEvent(event.type, { detail: event }));
      target.dispatchEvent(new CustomEvent('tanstack-devtools-global', { detail: event }));
    });
  }
})();
`;
}
function isEventClientModule(id, code) {
	return (id.includes("devtools-event-client") || id.includes("event-bus-client")) && code.includes("EventClient");
}
function injectRuntimeBridge(code, id, environmentName) {
	if (!environmentName || environmentName === "client") return void 0;
	if (!isEventClientModule(id, code)) return void 0;
	return `${code}\n${generateRuntimeBridgeCode()}`;
}
function wireRuntimeBridgeChannels(server, getTarget) {
	const teardowns = [];
	for (const [name, env] of Object.entries(server.environments)) {
		if (name === "client") continue;
		const hot = env?.hot;
		if (!hot || typeof hot.on !== "function" || typeof hot.send !== "function") continue;
		const onToServer = (event) => {
			getTarget()?.dispatchEvent(new CustomEvent("tanstack-dispatch-event", { detail: event }));
		};
		hot.on("tsd:to-server", onToServer);
		teardowns.push(() => hot.off?.("tsd:to-server", onToServer));
		const target = getTarget();
		const forward = (e) => hot.send("tsd:to-client", e.detail);
		target?.addEventListener("tanstack-devtools-global", forward);
		teardowns.push(() => target?.removeEventListener("tanstack-devtools-global", forward));
	}
	return () => teardowns.forEach((off) => off());
}
//#endregion
export { generateRuntimeBridgeCode, injectRuntimeBridge, wireRuntimeBridgeChannels };

//# sourceMappingURL=runtime-bridge.js.map