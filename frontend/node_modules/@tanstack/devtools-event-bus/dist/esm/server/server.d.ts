import { default as http } from 'node:http';
import { WebSocketServer } from 'ws';
export interface TanStackDevtoolsEvent<TEventName extends string, TPayload = any> {
    type: TEventName;
    payload: TPayload;
    pluginId?: string;
}
declare global {
    var __TANSTACK_DEVTOOLS_SERVER__: http.Server | null;
    var __TANSTACK_DEVTOOLS_WSS_SERVER__: WebSocketServer | null;
    var __TANSTACK_EVENT_TARGET__: EventTarget | null;
}
/**
 * A minimal server interface that both `http.Server` and `http2.Http2SecureServer` satisfy.
 * Used so the event bus can piggyback on any compatible server without depending on http2 types directly.
 */
export interface HttpServerLike {
    on: (event: string, listener: (...args: Array<any>) => void) => this;
    removeListener: (event: string, listener: (...args: Array<any>) => void) => this;
    address: () => ReturnType<http.Server['address']>;
}
export interface ServerEventBusConfig {
    port?: number | undefined;
    host?: string | undefined;
    debug?: boolean | undefined;
    /**
     * An external HTTP server to attach to instead of creating a standalone one.
     * When provided, the event bus will add its SSE/POST/WS handlers to this server
     * instead of creating and listening on its own server.
     * Useful for piggybacking on Vite's HTTPS-enabled server.
     */
    httpServer?: HttpServerLike | undefined;
}
export declare class ServerEventBus {
    #private;
    constructor({ port, host, debug, httpServer, }?: ServerEventBusConfig);
    private debugLog;
    private emitToServer;
    private emitEventToClients;
    private emit;
    private createSSEServer;
    private createWebSocketServer;
    private handleNewConnection;
    start(): Promise<number>;
    /**
     * Get the port the server is listening on.
     * This may differ from the configured port if the original port was in use.
     */
    get port(): number;
    stop(): void;
}
