export type DevtoolsConnection = {
    port: number;
    host: string;
    protocol: 'http' | 'https';
};
export declare const setDevtoolsConnection: (c: DevtoolsConnection) => void;
export declare const getDevtoolsConnection: () => DevtoolsConnection;
export declare const setDevtoolsFileId: (id: string | null) => void;
export declare const getDevtoolsFileId: () => string | null;
/**
 * Origin of the bundler dev server (e.g. rspack-dev-server). This is where the
 * `__tsd/*` middleware endpoints are mounted, and it is DISTINCT from the event
 * bus connection above (which the devtools client connects to on port 4206).
 * The dev-server origin is used to build the absolute `/__tsd/open-source` URL
 * baked into enhanced console logs and the SSR-side `/__tsd/console-pipe/server`
 * POST target.
 */
export type DevServerOrigin = {
    port: number;
    host: string;
    protocol: 'http' | 'https';
};
export declare const setDevServerOrigin: (o: DevServerOrigin) => void;
export declare const getDevServerOrigin: () => DevServerOrigin | null;
