import { DenoFetchHandler, DenoServeOptions, Server, ServerOptions } from "../_chunks/types.mjs";
import { FastURL } from "../_chunks/_url.mjs";
declare const FastResponse: typeof globalThis.Response;
declare function serve(options: ServerOptions): DenoServer;
declare class DenoServer implements Server<DenoFetchHandler> {
  #private;
  readonly runtime = "deno";
  readonly options: Server["options"];
  readonly deno: Server["deno"];
  readonly serveOptions: DenoServeOptions | undefined;
  readonly fetch: DenoFetchHandler;
  readonly waitUntil?: Server["waitUntil"];
  constructor(options: ServerOptions);
  serve(): Promise<this>;
  get url(): string | undefined;
  ready(): Promise<Server>;
  close(): Promise<void>;
}
export { FastResponse, FastURL, serve };