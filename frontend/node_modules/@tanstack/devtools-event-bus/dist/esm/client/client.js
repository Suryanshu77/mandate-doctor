import { parseWithBigInt, stringifyWithBigInt } from "../utils/json.js";
//#region src/client/client.ts
function getDefaultPort(configPort) {
	if (typeof __TANSTACK_DEVTOOLS_PORT__ !== "undefined") return __TANSTACK_DEVTOOLS_PORT__;
	return configPort;
}
function getDefaultHost(configHost) {
	if (typeof __TANSTACK_DEVTOOLS_HOST__ !== "undefined") return __TANSTACK_DEVTOOLS_HOST__;
	return configHost;
}
function getDefaultProtocol(configProtocol) {
	if (typeof __TANSTACK_DEVTOOLS_PROTOCOL__ !== "undefined") return __TANSTACK_DEVTOOLS_PROTOCOL__;
	return configProtocol;
}
var ClientEventBus = class {
	#port;
	#host;
	#protocol;
	#socket;
	#eventSource;
	#eventTarget;
	#debug;
	#connectToServerBus;
	#broadcastChannel;
	#pendingServerEvents = [];
	#dispatcher = (e) => {
		const event = e.detail;
		this.emitToServer(event);
		this.emitToClients(event);
	};
	#connectFunction = () => {
		this.debugLog("Connection request made to event-bus, replying back with success");
		this.#eventTarget.dispatchEvent(new CustomEvent("tanstack-connect-success"));
	};
	constructor({ port = getDefaultPort(4206), host = getDefaultHost("localhost"), protocol = getDefaultProtocol("http"), debug = false, connectToServerBus = false } = {}) {
		this.#debug = debug;
		this.#broadcastChannel = new BroadcastChannel("tanstack-devtools");
		this.#eventSource = null;
		this.#port = port;
		this.#host = host;
		this.#protocol = protocol;
		this.#socket = null;
		this.#connectToServerBus = connectToServerBus;
		this.#eventTarget = this.getGlobalTarget();
		this.#broadcastChannel.onmessage = (e) => {
			this.emitToClients(parseWithBigInt(e.data), true);
		};
		this.debugLog("Initializing client event bus");
	}
	emitToClients(event, fromBroadcastChannel = false) {
		this.debugLog("Emitting event from client bus", event);
		const specificEvent = new CustomEvent(event.type, { detail: event });
		this.debugLog("Emitting event to specific client listeners", event);
		this.#eventTarget.dispatchEvent(specificEvent);
		const globalEvent = new CustomEvent("tanstack-devtools-global", { detail: event });
		if (!fromBroadcastChannel) this.#broadcastChannel?.postMessage(stringifyWithBigInt(event));
		this.debugLog("Emitting event to global client listeners", event);
		this.#eventTarget.dispatchEvent(globalEvent);
	}
	flushPendingServerEvents() {
		if (!this.#socket || this.#socket.readyState !== WebSocket.OPEN) return;
		const pending = this.#pendingServerEvents;
		this.#pendingServerEvents = [];
		for (const json of pending) {
			this.debugLog("Flushing queued event to server via WS");
			this.#socket.send(json);
		}
	}
	emitToServer(event) {
		const json = stringifyWithBigInt(event);
		if (this.#socket) {
			if (this.#socket.readyState === WebSocket.OPEN) {
				this.debugLog("Emitting event to server via WS", event);
				this.#socket.send(json);
			} else if (this.#socket.readyState === WebSocket.CONNECTING) {
				this.debugLog("WebSocket still connecting, queueing event", event);
				this.#pendingServerEvents.push(json);
			}
			return;
		}
		if (this.#eventSource) {
			this.debugLog("Emitting event to server via SSE", event);
			fetch(`${this.#protocol}://${this.#host}:${this.#port}/__devtools/send`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: json
			}).catch(() => {});
		}
	}
	start() {
		this.debugLog("Starting client event bus");
		if (typeof window === "undefined") return;
		if (this.#connectToServerBus) this.connect();
		this.#eventTarget = window;
		this.#eventTarget.addEventListener("tanstack-dispatch-event", this.#dispatcher);
		this.#eventTarget.addEventListener("tanstack-connect", this.#connectFunction);
	}
	stop() {
		this.debugLog("Stopping client event bus");
		if (typeof window === "undefined") return;
		this.#eventTarget.removeEventListener("tanstack-dispatch-event", this.#dispatcher);
		this.#eventTarget.removeEventListener("tanstack-connect", this.#connectFunction);
		this.#eventSource?.close();
		this.#socket?.close();
		this.#socket = null;
		this.#eventSource = null;
		this.#pendingServerEvents = [];
	}
	getGlobalTarget() {
		if (typeof window !== "undefined") return window;
		return new EventTarget();
	}
	debugLog(...messages) {
		if (this.#debug) console.log("🌴 [tanstack-devtools:client-bus]", ...messages);
	}
	connectSSE() {
		this.debugLog("Connecting to SSE server");
		this.#eventSource = new EventSource(`${this.#protocol}://${this.#host}:${this.#port}/__devtools/sse`);
		this.#eventSource.onmessage = (e) => {
			this.debugLog("Received message from SSE server", e.data);
			this.handleEventReceived(e.data);
		};
	}
	connectWebSocket() {
		this.debugLog("Connecting to WebSocket server");
		const wsProtocol = this.#protocol === "https" ? "wss" : "ws";
		this.#socket = new WebSocket(`${wsProtocol}://${this.#host}:${this.#port}/__devtools/ws`);
		this.#socket.onopen = () => {
			this.debugLog("WebSocket connection opened");
			this.flushPendingServerEvents();
		};
		this.#socket.onmessage = (e) => {
			this.debugLog("Received message from server", e.data);
			this.handleEventReceived(e.data);
		};
		this.#socket.onclose = () => {
			this.debugLog("WebSocket connection closed");
			this.#socket = null;
			this.#pendingServerEvents = [];
		};
		this.#socket.onerror = () => {
			this.debugLog("WebSocket connection error");
		};
	}
	connect() {
		try {
			this.connectWebSocket();
		} catch {
			if (typeof window === "undefined") return;
			this.connectSSE();
		}
	}
	handleEventReceived(data) {
		try {
			const event = parseWithBigInt(data);
			this.emitToClients(event);
		} catch {}
	}
};
//#endregion
export { ClientEventBus };

//# sourceMappingURL=client.js.map