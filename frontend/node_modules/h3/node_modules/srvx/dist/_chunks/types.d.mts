import * as NodeHttp from "node:http";
import * as NodeHttps from "node:https";
import * as NodeHttp2 from "node:http2";
import * as NodeNet from "node:net";
/**
 * Controls whether `X-Forwarded-*` headers (proto, host, for, and the HTTP/2
 * `:scheme` pseudo-header) are trusted when deriving request metadata.
 *
 * These headers are appended by every proxy on the wire, so trusting them is
 * hop-aware: starting from the immediate peer and walking the forwarded chain
 * right-to-left, each address in the trusted set is treated as a proxy we
 * control. The first address *not* in the set is the real client (see
 * {@link ServerOptions.trustProxy}).
 *
 *   - `false` (default): never trust forwarded headers; derive protocol, host
 *     and client IP from the real transport only.
 *   - `true`: always trust forwarded headers (every hop is trusted, so the
 *     leftmost `X-Forwarded-For` entry is the client).
 *   - `"loopback"`: trust only hops on a loopback address (`127.0.0.0/8` or
 *     `::1`), i.e. a proxy running on the same host.
 *   - `string[]`: trust only hops whose address is in the allowlist.
 */
type TrustProxyOption = boolean | "loopback" | string[];
/**
 * Headers accepted by the runtime `Headers` constructor (`HeadersInit`).
 *
 * Derived from the ambient `Headers` so that it does not require `lib: ["dom"]`.
 */
type ResponseHeaders = NonNullable<ConstructorParameters<typeof globalThis.Headers>[0]>;
/**
 * Options forwarded to `Bun.serve()`.
 *
 * @docs https://bun.sh/docs/api/http
 */
interface BunServeOptions {
  port?: string | number;
  hostname?: string;
  unix?: string;
  reusePort?: boolean;
  idleTimeout?: number;
  maxRequestBodySize?: number;
  error?: (error: any) => any;
  tls?: any;
  /** Any other option supported by the running Bun version. */
  [key: string]: any;
}
/**
 * Server instance returned by `Bun.serve()` (`Bun.Server`).
 */
interface BunHttpServer {
  readonly url: URL;
  readonly port?: number;
  readonly hostname?: string;
  readonly development?: boolean;
  readonly pendingRequests?: number;
  readonly pendingWebSockets?: number;
  requestIP(request: Request): {
    address: string;
    family: "IPv4" | "IPv6";
    port: number;
  } | null;
  timeout(request: Request, seconds: number): void;
  /** Upgrade an incoming request to a WebSocket connection. */
  upgrade(request: Request, options?: {
    headers?: ResponseHeaders;
    data?: any;
  }): boolean;
  /** Publish a message to every client subscribed to `topic`. */
  publish(topic: string, data: string | ArrayBufferView | ArrayBuffer | SharedArrayBuffer, compress?: boolean): number;
  subscriberCount(topic: string): number;
  reload(options: any): void;
  stop(closeActiveConnections?: boolean): Promise<void>;
  ref(): void;
  unref(): void;
}
/**
 * Options forwarded to `Deno.serve()`.
 *
 * @docs https://docs.deno.com/api/deno/~/Deno.serve
 */
interface DenoServeOptions {
  port?: number;
  hostname?: string;
  reusePort?: boolean;
  signal?: AbortSignal;
  key?: string;
  cert?: string;
  passphrase?: string;
  onError?: (error: unknown) => Response | Promise<Response>;
  onListen?: (localAddr: {
    hostname: string;
    port: number;
  }) => void;
  /** Any other option supported by the running Deno version. */
  [key: string]: any;
}
/**
 * Server instance returned by `Deno.serve()` (`Deno.HttpServer`).
 */
interface DenoHttpServer {
  readonly finished: Promise<void>;
  readonly addr?: {
    hostname?: string;
    port?: number;
    transport?: string;
  };
  shutdown(): Promise<void>;
  ref(): void;
  unref(): void;
  [Symbol.asyncDispose](): PromiseLike<void>;
}
/**
 * Second argument Deno passes to the fetch handler (`Deno.ServeHandlerInfo`).
 */
interface DenoServeHandlerInfo {
  readonly remoteAddr: {
    hostname: string;
    port: number;
    transport?: string;
  };
  readonly completed?: Promise<void>;
}
/**
 * Cloudflare Workers execution context (`ExecutionContext`).
 */
interface CloudflareExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
  props?: any;
}
/**
 * Cloudflare Workers environment bindings.
 *
 * Augment this interface to type your own bindings:
 *
 * ```ts
 * declare module "srvx" {
 *   interface CloudflareEnv {
 *     MY_KV: KVNamespace;
 *   }
 * }
 * ```
 */
interface CloudflareEnv {
  [key: string]: unknown;
}
/**
 * AWS Lambda invocation context (`aws-lambda`'s `Context`).
 */
interface AWSLambdaContext {
  callbackWaitsForEmptyEventLoop: boolean;
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: string;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  identity?: any;
  clientContext?: any;
  getRemainingTimeInMillis(): number;
  done(error?: Error, result?: any): void;
  fail(error: Error | string): void;
  succeed(messageOrObject: any): void;
}
/**
 * API Gateway REST API (v1) proxy event (`APIGatewayProxyEvent`).
 */
interface AWSLambdaProxyEvent {
  httpMethod: string;
  path: string;
  resource?: string;
  headers: Record<string, string | undefined>;
  multiValueHeaders?: Record<string, string[] | undefined>;
  queryStringParameters?: Record<string, string | undefined> | null;
  multiValueQueryStringParameters?: Record<string, string[] | undefined> | null;
  pathParameters?: Record<string, string | undefined> | null;
  stageVariables?: Record<string, string | undefined> | null;
  body: string | null;
  isBase64Encoded: boolean;
  requestContext: {
    accountId?: string;
    apiId?: string;
    authorizer?: any;
    domainName?: string;
    httpMethod?: string;
    identity?: {
      sourceIp?: string;
    };
    path?: string;
    protocol?: string;
    requestId?: string;
    requestTimeEpoch?: number;
    resourcePath?: string;
    stage?: string;
  };
}
/**
 * API Gateway HTTP API (v2) proxy event (`APIGatewayProxyEventV2`).
 */
interface AWSLambdaProxyEventV2 {
  version: string;
  routeKey?: string;
  rawPath: string;
  rawQueryString: string;
  cookies?: string[];
  headers: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string | undefined>;
  pathParameters?: Record<string, string | undefined>;
  stageVariables?: Record<string, string | undefined>;
  body?: string;
  isBase64Encoded: boolean;
  requestContext: {
    accountId?: string;
    apiId?: string;
    authorizer?: any;
    domainName?: string;
    domainPrefix?: string;
    requestId?: string;
    routeKey?: string;
    stage?: string;
    time?: string;
    timeEpoch?: number;
    http?: {
      method: string;
      path?: string;
      protocol?: string;
      sourceIp?: string;
      userAgent?: string;
    };
  };
}
/**
 * API Gateway REST API (v1) proxy result (`APIGatewayProxyResult`).
 */
interface AWSLambdaProxyResult {
  statusCode: number;
  headers?: Record<string, string | number | boolean>;
  multiValueHeaders?: Record<string, Array<string | number | boolean>>;
  body: string;
  isBase64Encoded?: boolean;
}
/**
 * API Gateway HTTP API (v2) proxy result (`APIGatewayProxyResultV2`).
 */
type AWSLambdaProxyResultV2 = string | {
  statusCode?: number;
  headers?: Record<string, string | number | boolean>;
  body?: string;
  isBase64Encoded?: boolean;
  cookies?: string[];
};
/**
 * Service worker `fetch` event (`FetchEvent`).
 */
interface ServiceWorkerFetchEvent {
  readonly request: Request;
  readonly clientId?: string;
  respondWith(response: Response | Promise<Response>): void;
  waitUntil(promise: Promise<any>): void;
}
type MaybePromise<T> = T | Promise<T>;
/**
 * Faster URL constructor with lazy access to pathname and search params (For Node, Deno, and Bun).
 */
declare const FastURL: typeof globalThis.URL;
/**
 * Faster Response constructor optimized for Node.js (same as Response for other runtimes).
 */
declare const FastResponse: typeof globalThis.Response;
/**
 * Create a new server instance.
 */
declare function serve(options: ServerOptions): Server;
/**
 * Web fetch compatible request handler
 */
type ServerHandler = (request: ServerRequest) => MaybePromise<Response>;
type ServerMiddleware = (request: ServerRequest, next: () => Response | Promise<Response>) => Response | Promise<Response>;
type ServerPlugin = (server: Server) => void;
/**
 * Server options
 */
interface ServerOptions {
  /**
   * The fetch handler handles incoming requests.
   */
  fetch: ServerHandler;
  /**
   * Handle lifecycle errors.
   *
   * @note This handler will set built-in Bun and Deno error handler.
   */
  error?: ErrorHandler;
  /**
   * Server middleware handlers to run before the main fetch handler.
   */
  middleware?: ServerMiddleware[];
  /**
   * Server plugins.
   */
  plugins?: ServerPlugin[];
  /**
   * If set to `true`, server will not start listening automatically.
   */
  manual?: boolean;
  /**
   * The port server should be listening to.
   *
   * Default is read from `PORT` environment variable or will be `3000`.
   *
   * **Tip:** You can set the port to `0` to use a random port.
   */
  port?: string | number;
  /**
   * The hostname (IP or resolvable host) server listener should bound to.
   *
   * Default is read from the `HOST` environment variable. When neither is
   * provided, the server will listen to all network interfaces by default.
   *
   * **Important:** If you are running a server that is not expected to be exposed to the network, use `hostname: "localhost"`.
   */
  hostname?: string;
  /**
   * Enabling this option allows multiple processes to bind to the same port, which is useful for load balancing.
   *
   * **Note:** Despite Node.js built-in behavior that has `exclusive` flag (opposite of `reusePort`) enabled by default, srvx uses non-exclusive mode for consistency.
   */
  reusePort?: boolean;
  /**
   * The protocol to use for the server.
   *
   * Possible values are `http` and `https`.
   *
   * If `protocol` is not set, Server will use `http` as the default protocol or `https` if both `tls.cert` and `tls.key` options are provided.
   */
  protocol?: "http" | "https";
  /**
   * If set to `true`, server will not print the listening address.
   */
  silent?: boolean;
  /**
   * Graceful shutdown on SIGINT and SIGTERM signals.
   *
   * Supported for Node.js, Deno and Bun runtimes.
   *
   * @default true (disabled in test and ci environments)
   */
  gracefulShutdown?: boolean | {
    gracefulTimeout?: number;
    forceTimeout?: number;
  };
  /**
   * Maximum allowed size (in bytes) for the request body.
   *
   * As the body is read, its accumulated length is tracked and, once it exceeds
   * this limit, reading is aborted and rejects with a `413`-style error (the error
   * has `statusCode: 413`, `status: 413` and `code: "ERR_BODY_TOO_LARGE"`) so a
   * handler can map it to an HTTP 413 (Payload Too Large) response.
   *
   * The limit covers the buffered reads (`request.text()` / `request.json()`) as
   * well as the streamed body (`request.body`, and therefore `arrayBuffer()` /
   * `blob()` / `bytes()` / `formData()`).
   *
   * Runtime support:
   * - **Node**: enforced by srvx (body stream is size-limited).
   * - **Bun**: mapped to Bun's native `maxRequestBodySize` (413 before the handler).
   * - **Deno**: enforced by srvx (request body stream is size-limited).
   *
   * @default undefined (no limit)
   */
  maxRequestBodySize?: number;
  /**
   * Whether to trust `X-Forwarded-*` headers (`X-Forwarded-Proto`,
   * `X-Forwarded-Host`, `X-Forwarded-For`, and the HTTP/2 `:scheme`) when
   * deriving `request.url` and `request.ip`.
   *
   * Any client can send `X-Forwarded-Proto: https`, `X-Forwarded-Host` or
   * `X-Forwarded-For`, so trusting them lets a request masquerade as `https:`,
   * forge its host, or spoof its client IP. Only enable this when a proxy you
   * control sits in front and overwrites the headers.
   *
   * - `false` (default): ignore the headers; use the real connection protocol,
   *   the on-the-wire `Host` header and the socket peer address.
   * - `true`: always trust the headers.
   * - `"loopback"`: trust them only when the proxy connects from a loopback
   *   address (`127.0.0.0/8` or `::1`).
   * - `string[]`: trust them only when the proxy's address is in the list.
   *
   * Applies to the Node, AWS Lambda, Bun and Deno adapters.
   *
   * @default false
   */
  trustProxy?: TrustProxyOption;
  /**
   * TLS server options.
   */
  tls?: {
    /**
     * File path or inlined TLS certificate in PEM format (required).
     */
    cert?: string;
    /**
     * File path or inlined TLS private key in PEM format (required).
     */
    key?: string;
    /**
     * Passphrase for the private key (optional).
     */
    passphrase?: string;
  };
  /**
   * Node.js server options.
   */
  node?: (NodeHttp.ServerOptions | NodeHttps.ServerOptions | NodeHttp2.ServerOptions) & NodeNet.ListenOptions & {
    http2?: boolean;
  };
  /**
   * Bun server options
   *
   * @docs https://bun.sh/docs/api/http
   */
  bun?: BunServeOptions;
  /**
   * Deno server options
   *
   * @docs https://docs.deno.com/api/deno/~/Deno.serve
   */
  deno?: DenoServeOptions;
  /**
   * Service worker options
   */
  serviceWorker?: {
    /**
     * The path to the service worker file to be registered.
     */
    url?: string;
    /**
     * The scope of the service worker.
     *
     */
    scope?: string;
  };
}
interface Server<Handler = ServerHandler> {
  /**
   * Current runtime name
   */
  readonly runtime: "node" | "deno" | "bun" | "bunny" | "cloudflare" | "service-worker" | "aws-lambda" | "generic";
  /**
   * Server options
   */
  readonly options: ServerOptions & {
    middleware: ServerMiddleware[];
  };
  /**
   * Server URL address.
   */
  readonly url?: string;
  /**
   * Node.js context.
   */
  readonly node?: {
    server?: NodeHttp.Server | NodeHttp2.Http2Server;
    handler: (req: NodeServerRequest, res: NodeServerResponse) => void | Promise<void>;
  };
  /**
   * Bun context.
   */
  readonly bun?: {
    server?: BunHttpServer;
  };
  /**
   * Deno context.
   */
  readonly deno?: {
    server?: DenoHttpServer;
  };
  /**
   * Server fetch handler
   */
  readonly fetch: Handler;
  /**
   * Start listening for incoming requests.
   * When `manual` option is enabled, this method needs to be called explicitly to begin accepting connections.
   */
  serve(): void | Promise<Server<Handler>>;
  /**
   * Returns a promise that resolves when the server is ready.
   */
  ready(): Promise<Server<Handler>>;
  /**
   * Register a background task that the server should await before closing.
   *
   * Same as `request.waitUntil` but available at the server level for use outside of request handlers.
   */
  readonly waitUntil?: (promise: Promise<unknown>) => void;
  /**
   * Stop listening to prevent new connections from being accepted.
   *
   * By default, it does not cancel in-flight requests or websockets. That means it may take some time before all network activity stops.
   *
   * @param closeActiveConnections Immediately terminate in-flight requests, websockets, and stop accepting new connections.
   * @default false
   */
  close(closeActiveConnections?: boolean): Promise<void>;
}
interface ServerRuntimeContext {
  name: "node" | "deno" | "bun" | "bunny" | "cloudflare" | "aws-lambda" | (string & {});
  /**
   * Underlying Node.js server request info.
   */
  node?: {
    req: NodeServerRequest;
    res?: NodeServerResponse;
  };
  /**
   * Underlying Deno server request info.
   */
  deno?: {
    info: DenoServeHandlerInfo;
  };
  /**
   * Underlying Bun server request context.
   */
  bun?: {
    server: BunHttpServer;
  };
  /**
   * Underlying Cloudflare request context.
   */
  cloudflare?: {
    context: CloudflareExecutionContext;
    env: CloudflareEnv;
  };
  awsLambda?: {
    context: AWSLambdaContext;
    event: AWSLambdaProxyEvent | AWSLambdaProxyEventV2;
  };
  serviceWorker?: {
    event: ServiceWorkerFetchEvent;
  };
  netlify?: {
    context: any;
  };
  stormkit?: {
    event: any;
    context: any;
  };
  vercel?: {
    context: {
      waitUntil?: (promise: Promise<any>) => void;
    };
  };
}
interface ServerRequestContext {
  [key: string]: unknown;
}
interface ServerRequest extends Request {
  /**
   * The underlying web-standard `Request` backing this request.
   *
   * See https://srvx.h3.dev/guide/node#noderequest
   */
  _request?: Request;
  /**
   * Access to the parsed URL of this request.
   */
  _url?: URL;
  /**
   * Runtime specific request context.
   */
  runtime?: ServerRuntimeContext;
  /**
   * IP address of the client.
   */
  ip?: string | undefined;
  /**
   * Arbitrary context related to the request.
   */
  context?: ServerRequestContext;
  /**
   * Tell the runtime about an ongoing operation that shouldn't close until the promise resolves.
   */
  waitUntil?: (promise: Promise<unknown>) => void | Promise<void>;
}
type FetchHandler = (request: Request) => Response | Promise<Response>;
type ErrorHandler = (error: unknown) => Response | Promise<Response>;
type BunFetchHandler = (request: Request, server?: BunHttpServer) => Response | Promise<Response>;
type DenoFetchHandler = (request: Request, info?: DenoServeHandlerInfo) => Response | Promise<Response>;
type NodeServerRequest = NodeHttp.IncomingMessage | NodeHttp2.Http2ServerRequest;
type NodeServerResponse = NodeHttp.ServerResponse | NodeHttp2.Http2ServerResponse;
type NodeHttp1Handler = (req: NodeHttp.IncomingMessage, res: NodeHttp.ServerResponse) => void | Promise<void>;
type NodeHttp2Handler = (req: NodeHttp2.Http2ServerRequest, res: NodeHttp2.Http2ServerResponse) => void | Promise<void>;
type NodeHttpHandler = NodeHttp1Handler | NodeHttp2Handler;
type NodeHTTP1Middleware = (req: NodeHttp.IncomingMessage, res: NodeHttp.ServerResponse, next: (error?: Error) => void) => unknown | Promise<unknown>;
type NodeHTTP2Middleware = (req: NodeHttp2.Http2ServerRequest, res: NodeHttp2.Http2ServerResponse, next: (error?: Error) => void) => unknown | Promise<unknown>;
type NodeHTTPMiddleware = NodeHTTP1Middleware | NodeHTTP2Middleware;
type CloudflareFetchHandler = (request: Request, env: CloudflareEnv, context: CloudflareExecutionContext) => Response | Promise<Response>;
/**
 * Body accepted by the runtime `Response` constructor (`BodyInit`).
 *
 * Derived from the ambient `Response` so that it does not require `lib: ["dom"]`.
 */
type ResponseBody = NonNullable<ConstructorParameters<typeof globalThis.Response>[0]>;
export { AWSLambdaContext, AWSLambdaProxyEvent, AWSLambdaProxyEventV2, AWSLambdaProxyResult, AWSLambdaProxyResultV2, BunFetchHandler, BunHttpServer, BunServeOptions, CloudflareEnv, CloudflareExecutionContext, CloudflareFetchHandler, DenoFetchHandler, DenoHttpServer, DenoServeHandlerInfo, DenoServeOptions, ErrorHandler, FastResponse, FastURL, FetchHandler, NodeHTTP1Middleware, NodeHTTP2Middleware, NodeHTTPMiddleware, NodeHttp1Handler, NodeHttp2Handler, NodeHttpHandler, NodeServerRequest, NodeServerResponse, ResponseBody, Server, ServerHandler, ServerMiddleware, ServerOptions, ServerPlugin, ServerRequest, ServerRequestContext, ServerRuntimeContext, ServiceWorkerFetchEvent, TrustProxyOption, serve };