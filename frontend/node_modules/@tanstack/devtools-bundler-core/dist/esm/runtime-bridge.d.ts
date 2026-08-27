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
export declare function generateRuntimeBridgeCode(): string;
export declare function injectRuntimeBridge(code: string, id: string, environmentName: string | undefined): string | undefined;
interface BridgeHotChannel {
    on?: (event: string, cb: (data: any) => void) => void;
    off?: (event: string, cb: (data: any) => void) => void;
    send?: (event: string, data: any) => void;
}
interface BridgeServerLike {
    environments: Record<string, {
        hot?: BridgeHotChannel | null;
    } | undefined>;
}
export declare function wireRuntimeBridgeChannels(server: BridgeServerLike, getTarget: () => EventTarget | null | undefined): () => void;
export {};
