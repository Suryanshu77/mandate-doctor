export interface ClientEventBusConfig {
    /**
     * Optional flag to indicate if the devtools server event bus is available to connect to.
     * This is used to determine if the devtools can connect to the server for real-time event streams.
     */
    connectToServerBus?: boolean;
    /**
     * Optional flag to enable debug mode for the event bus.
     */
    debug?: boolean;
    /**
     * Optional port to connect to the devtools server event bus.
     * Defaults to 4206.
     */
    port?: number;
    /**
     * Optional host to connect to the devtools server event bus.
     * Defaults to 'localhost'.
     */
    host?: string;
    /**
     * Optional protocol to use for connecting to the devtools server event bus.
     * Defaults to 'http'. Set to 'https' when the dev server uses HTTPS.
     */
    protocol?: 'http' | 'https';
}
export declare class ClientEventBus {
    #private;
    constructor({ port, host, protocol, debug, connectToServerBus, }?: ClientEventBusConfig);
    private emitToClients;
    private flushPendingServerEvents;
    private emitToServer;
    start(): void;
    stop(): void;
    private getGlobalTarget;
    private debugLog;
    private connectSSE;
    private connectWebSocket;
    private connect;
    private handleEventReceived;
}
