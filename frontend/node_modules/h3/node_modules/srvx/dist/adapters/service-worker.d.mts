import { Server, ServerOptions, ServerRequest, ServiceWorkerFetchEvent } from "../_chunks/types.mjs";
declare const FastURL: typeof globalThis.URL;
declare const FastResponse: typeof globalThis.Response;
type ServiceWorkerHandler = (request: ServerRequest, event: ServiceWorkerFetchEvent) => Response | Promise<Response>;
declare function serve(options: ServerOptions): Server<ServiceWorkerHandler>;
export { FastResponse, FastURL, ServiceWorkerHandler, serve };