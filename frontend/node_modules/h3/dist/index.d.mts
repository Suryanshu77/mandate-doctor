import { CookieSerializeOptions, DynamicEventHandler, ErrorDetails, EventHandler, EventHandlerObject, EventHandlerRequest, EventHandlerResponse, EventHandlerWithFetch, FetchableObject, H3, H3$1, H3Config, H3Event, H3EventContext, H3Plugin, H3RouteMeta, HTTPError, HTTPEvent, HTTPHandler, HTTPMethod, HTTPResponse, InferEventInput, MaybePromise as MaybePromise$1, Middleware, ProxyOptions, TypedRequest } from "./h3.mjs";
import { NodeServerRequest, NodeServerResponse, ServerRequest, ServerRequestContext } from "srvx";
import { Hooks, Hooks as WebSocketHooks, Message as WebSocketMessage, Peer, Peer as WebSocketPeer } from "crossws";

declare function isEvent(input: any): input is H3Event;
/**
 * Checks if the input is an object with `{ req: Request }` signature.
 * @param input - The input to check.
 * @returns True if the input is `{ req: Request }`
 */
declare function isHTTPEvent(input: any): input is HTTPEvent;
/**
 * Gets the context of the event, if it does not exists, initializes a new context on `req.context`.
 */
declare function getEventContext<T extends ServerRequestContext | H3EventContext>(event: HTTPEvent | H3Event): T;
declare function mockEvent(_request: string | URL | Request, options?: RequestInit & {
  h3?: H3EventContext;
}): H3Event;
/** The Standard Schema interface. */
interface StandardSchemaV1<Input = unknown, Output = Input> {
  /** The Standard Schema properties. */
  readonly "~standard": Props<Input, Output>;
}
/** The Standard Schema properties interface. */
interface Props<Input = unknown, Output = Input> {
  /** The version number of the standard. */
  readonly version: 1;
  /** The vendor name of the schema library. */
  readonly vendor: string;
  /** Validates unknown input values. */
  readonly validate: (value: unknown) => Result<Output> | Promise<Result<Output>>;
  /** Inferred types associated with the schema. */
  readonly types?: Types<Input, Output> | undefined;
}
/** The result interface of the validate function. */
type Result<Output> = SuccessResult<Output> | FailureResult;
/** The result interface if validation succeeds. */
interface SuccessResult<Output> {
  /** The typed output value. */
  readonly value: Output;
  /** The non-existent issues. */
  readonly issues?: undefined;
}
/** The result interface if validation fails. */
interface FailureResult {
  /** The issues of failed validation. */
  readonly issues: ReadonlyArray<Issue>;
}
/** The issue interface of the failure output. */
interface Issue {
  /** The error message of the issue. */
  readonly message: string;
  /** The path of the issue, if any. */
  readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
}
/** The path segment interface of the issue. */
interface PathSegment {
  /** The key representing a path segment. */
  readonly key: PropertyKey;
}
/** The Standard Schema types interface. */
interface Types<Input = unknown, Output = Input> {
  /** The input type of the schema. */
  readonly input: Input;
  /** The output type of the schema. */
  readonly output: Output;
}
/** Infers the output type of a Standard Schema. */
type InferOutput<Schema extends StandardSchemaV1> = NonNullable<Schema["~standard"]["types"]>["output"];
type ValidateResult<T> = T | true | false | void;
type OnValidateError<Source extends string = string> = (result: FailureResult & {
  _source?: Source;
}) => ErrorDetails;
declare function defineHandler<Req extends EventHandlerRequest = EventHandlerRequest, Res = EventHandlerResponse>(handler: EventHandler<Req, Res>): EventHandlerWithFetch<Req, Res>;
declare function defineHandler<Req extends EventHandlerRequest = EventHandlerRequest, Res = EventHandlerResponse>(def: EventHandlerObject<Req, Res>): EventHandlerWithFetch<Req, Res>;
type StringHeaders<T> = { [K in keyof T]: Extract<T[K], string>; };
/**
 * @experimental defineValidatedHandler is an experimental feature and API may change.
 */
declare function defineValidatedHandler<RequestBody extends StandardSchemaV1, RequestHeaders extends StandardSchemaV1, RequestQuery extends StandardSchemaV1, Res extends EventHandlerResponse = EventHandlerResponse>(def: Omit<EventHandlerObject, "handler"> & {
  validate?: {
    body?: RequestBody;
    headers?: RequestHeaders;
    query?: RequestQuery;
    onError?: OnValidateError;
  };
  handler: EventHandler<{
    body: InferOutput<RequestBody>;
    query: StringHeaders<InferOutput<RequestQuery>>;
  }, Res>;
}): EventHandlerWithFetch<TypedRequest<InferOutput<RequestBody>, InferOutput<RequestHeaders>>, Res>;
declare function dynamicEventHandler(initial?: EventHandler | FetchableObject): DynamicEventHandler;
type MaybePromise<T> = T | Promise<T>;
declare function defineLazyEventHandler(loader: () => MaybePromise<HTTPHandler>): EventHandlerWithFetch;
declare function toEventHandler(handler: HTTPHandler | undefined): EventHandler | undefined;
type NodeHandler = (req: NodeServerRequest, res: NodeServerResponse) => unknown | Promise<unknown>;
type NodeMiddleware = (req: NodeServerRequest, res: NodeServerResponse, next: (error?: Error) => void) => unknown | Promise<unknown>;
/**
 * @deprecated Since h3 v2 you can directly use `app.fetch(request, init?, context?)`
 */
declare function toWebHandler(app: H3): (request: ServerRequest, context?: H3EventContext) => Promise<Response>;
declare function fromWebHandler(handler: (request: ServerRequest, context?: H3EventContext) => Promise<Response>): EventHandler;
/**
 * Convert a Node.js handler function (req, res, next?) to an EventHandler.
 *
 * **Note:** The returned event handler requires to be executed with h3 Node.js handler.
 */
declare function fromNodeHandler(handler: NodeMiddleware): EventHandler;
declare function fromNodeHandler(handler: NodeHandler): EventHandler;
declare function defineNodeHandler(handler: NodeHandler): NodeHandler;
declare function defineNodeMiddleware(handler: NodeMiddleware): NodeMiddleware;
/**
 * Route definition options
 */
interface RouteDefinition {
  /**
   * HTTP method for the route, e.g. 'GET', 'POST', etc.
   */
  method: HTTPMethod;
  /**
   * Route pattern, e.g. '/api/users/:id'
   */
  route: string;
  /**
   * Handler function for the route.
   */
  handler: EventHandler;
  /**
   * Optional middleware to run before the handler.
   */
  middleware?: Middleware[];
  /**
   * Additional route metadata.
   */
  meta?: H3RouteMeta;
  validate?: {
    body?: StandardSchemaV1;
    headers?: StandardSchemaV1;
    query?: StandardSchemaV1;
  };
}
/**
 * Define a route as a plugin that can be registered with app.register()
 *
 * @example
 * ```js
 * import { z } from "zod";
 *
 * const userRoute = defineRoute({
 *    method: 'POST',
 *    validate: {
 *      query: z.object({ id: z.string().uuid() }),
 *      body: z.object({ name: z.string() }),
 *    },
 *    handler: (event) => {
 *      return { success: true };
 *    }
 * });
 *
 * app.register(userRoute);
 * ```
 */
declare function defineRoute(def: RouteDefinition): H3Plugin;
/**
 * Remove a route handler from the app.
 *
 * All registrations matching `method` + `route` are removed (an empty `method`
 * only matches routes registered with `app.all()`).
 *
 * @example
 * ```ts
 * import { H3, removeRoute } from "h3";
 *
 * const app = new H3();
 * app.get("/temp", () => "hello");
 *
 * removeRoute(app, "GET", "/temp"); // route removed
 * ```
 */
declare function removeRoute(app: H3$1, method: HTTPMethod | Lowercase<HTTPMethod> | "", route: string): void;
/**
 * Create a lightweight request proxy that overrides only the URL.
 *
 * Avoids cloning the original request (no `new Request()` allocation).
 */
declare function requestWithURL(req: ServerRequest, url: string): ServerRequest;
/**
 * Create a lightweight request proxy with the base path stripped from the URL pathname.
 *
 * `options.url` is the parsed request URL to strip `base` from, in place of
 * parsing `req.url`. Pass `event.url` whenever there is an event: for a
 * non-canonical path it holds the canonicalized form the parent matched `base`
 * against, while `req.url` still holds the wire form, and slicing one by an
 * offset derived from the other is how mount prefixes desync.
 */
declare function requestWithBaseURL(req: ServerRequest, base: string, options?: {
  url?: URL;
}): ServerRequest;
/**
 * Convert input into a web [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request).
 *
 * If input is a relative URL, it will be normalized into a full path based on the `host` header.
 *
 * If input is already a Request and no options are provided, it will be returned as-is.
 *
 * **Security:** The `host` header is client input. It is only used as the authority of the
 * synthesized URL (falling back to `localhost` when absent or malformed) and can never widen
 * into the path, and `x-forwarded-proto` is ignored, so the scheme is always `http`. Pass an
 * absolute URL to control the origin.
 */
declare function toRequest(input: ServerRequest | URL | string, options?: RequestInit): ServerRequest;
/**
 * Get parsed query string object from the request URL.
 *
 * @example
 * app.get("/", (event) => {
 *   const query = getQuery(event); // { key: "value", key2: ["value1", "value2"] }
 * });
 */
declare function getQuery<T, Event extends H3Event | HTTPEvent = HTTPEvent, _T = Exclude<InferEventInput<"query", Event, T>, undefined>>(event: Event): _T;
declare function getValidatedQuery<Event extends HTTPEvent, S extends StandardSchemaV1<any, any>>(event: Event, validate: S, options?: {
  onError?: (result: FailureResult) => ErrorDetails;
}): Promise<InferOutput<S>>;
declare function getValidatedQuery<Event extends HTTPEvent, OutputT, InputT = InferEventInput<"query", Event, OutputT>>(event: Event, validate: (data: InputT) => ValidateResult<OutputT> | Promise<ValidateResult<OutputT>>, options?: {
  onError?: () => ErrorDetails;
}): Promise<OutputT>;
/**
 * Get matched route params.
 *
 * By default params are returned exactly as they appeared in the URL path, still
 * percent-encoded.
 *
 * With `decode: true` each param is decoded **once** (like `decodeURIComponent`),
 * except encoded path separators (`%2f`, `%5c`, at any `%25`-nesting depth) which
 * are left in their encoded form so decoding can never reintroduce a `/` or `\`
 * the router never matched.
 *
 * A single decode is not the same as "fully decoded": `%25XX` decodes to the
 * literal text `%XX`, so the result can still contain percent-escapes — including
 * dot segments (`%252e%252e` -> `%2e%2e`) and control characters (`%2500` -> `%00`).
 * **Do not decode the result again**: a second pass turns those back into
 * traversal (`../`) and separators the routing and middleware layers never saw.
 * Treat the returned string as final and validate it as-is.
 *
 * @example
 * app.get("/", (event) => {
 *   const params = getRouterParams(event); // { key: "value" }
 * });
 *
 * @example
 * // GET /files/%252e%252e/x
 * app.get("/files/**:rest", (event) => {
 *   getRouterParams(event); // { rest: "%252e%252e/x" }
 *   getRouterParams(event, { decode: true }); // { rest: "%2e%2e/x" } — still encoded, do not decode again
 * });
 */
declare function getRouterParams(event: HTTPEvent, opts?: {
  decode?: boolean;
}): NonNullable<H3Event["context"]["params"]>;
declare function getValidatedRouterParams<Event extends HTTPEvent, S extends StandardSchemaV1>(event: Event, validate: S, options?: {
  decode?: boolean;
  onError?: (result: FailureResult) => ErrorDetails;
}): Promise<InferOutput<S>>;
declare function getValidatedRouterParams<Event extends HTTPEvent, OutputT, InputT = InferEventInput<"routerParams", Event, OutputT>>(event: Event, validate: (data: InputT) => ValidateResult<OutputT> | Promise<ValidateResult<OutputT>>, options?: {
  decode?: boolean;
  onError?: () => ErrorDetails;
}): Promise<OutputT>;
/**
 * Get a matched route param by name.
 *
 * If `decode` option is `true`, it will decode the matched route param (like
 * `decodeURIComponent`), except encoded path separators (`%2f`, `%5c`) are kept
 * encoded so decoding can never reintroduce a `/` or `\` the router never matched.
 *
 * @example
 * app.get("/", (event) => {
 *   const param = getRouterParam(event, "key");
 * });
 */
declare function getRouterParam(event: HTTPEvent, name: string, opts?: {
  decode?: boolean;
}): string | undefined;
/**
 *
 * Checks if the incoming request method is of the expected type.
 *
 * If `allowHead` is `true`, it will allow `HEAD` requests to pass if the expected method is `GET`.
 *
 * @example
 * app.get("/", (event) => {
 *   if (isMethod(event, "GET")) {
 *     // Handle GET request
 *   } else if (isMethod(event, ["POST", "PUT"])) {
 *     // Handle POST or PUT request
 *   }
 * });
 */
declare function isMethod(event: HTTPEvent, expected: HTTPMethod | HTTPMethod[], allowHead?: boolean): boolean;
/**
 * Asserts that the incoming request method is of the expected type using `isMethod`.
 *
 * If the method is not allowed, it will throw a 405 error and include an `Allow`
 * response header listing the permitted methods, as required by RFC 9110.
 *
 * If `allowHead` is `true`, it will allow `HEAD` requests to pass if the expected method is `GET`.
 *
 * @example
 * app.get("/", (event) => {
 *   assertMethod(event, "GET");
 *   // Handle GET request, otherwise throw 405 error
 * });
 */
declare function assertMethod(event: HTTPEvent, expected: HTTPMethod | HTTPMethod[], allowHead?: boolean): void;
/**
 * Get the request hostname.
 *
 * If `xForwardedHost` is `true`, it will use the `x-forwarded-host` header if it exists.
 *
 * If no host header is found, it will return an empty string.
 *
 * **Security:** The returned host reflects the client-supplied `Host` (or
 * `X-Forwarded-Host`) header and can be spoofed. Do not trust it for security
 * decisions (CSRF/origin checks, cache keys, generating absolute links sent to
 * other users) unless the `Host` value is pinned or validated upstream (e.g. an
 * allow-list of expected hosts, or a reverse proxy that overwrites it).
 *
 * @example
 * app.get("/", (event) => {
 *   const host = getRequestHost(event); // "example.com"
 * });
 */
declare function getRequestHost(event: HTTPEvent, opts?: {
  xForwardedHost?: boolean;
}): string;
/**
 * Get the request protocol.
 *
 * If `xForwardedProto` is `true`, it will use the `x-forwarded-proto` header if it exists. When the header contains a comma-separated list of protocols, the first entry is used.
 *
 * Note: This header is opt-in (default `false`) since it can be spoofed by clients. Only enable it when your application runs behind a trusted reverse proxy or CDN that sets this header. This default was changed to match `getRequestHost` (`xForwardedHost`) and `getRequestIP` (`xForwardedFor`).
 *
 * If protocol cannot be determined, it will default to "http".
 *
 * @example
 * app.get("/", (event) => {
 *   const protocol = getRequestProtocol(event); // "https"
 * });
 */
declare function getRequestProtocol(event: HTTPEvent | H3Event, opts?: {
  xForwardedProto?: boolean;
}): "http" | "https" | (string & {});
/**
 * Generated the full incoming request URL.
 *
 * If `xForwardedHost` is `true`, it will use the `x-forwarded-host` header if it exists.
 *
 * If `xForwardedProto` is `true`, it will use the `x-forwarded-proto` header if it exists.
 *
 * **Security:** The `.origin` and `.host` of the returned URL are derived from the
 * client-supplied `Host` (or `X-Forwarded-Host`) header and can be spoofed. Do not
 * trust them for security decisions (CSRF/origin checks, cache keys, generating
 * absolute links sent to other users) unless the `Host` value is pinned or
 * validated upstream (e.g. an allow-list of expected hosts, or a reverse proxy
 * that overwrites it). The `.pathname` and `.search` are not derived from the
 * spoofable host, but remain untrusted client input — validate or encode them for
 * their eventual sink (e.g. filesystem lookups, HTML output, downstream queries).
 *
 * @example
 * app.get("/", (event) => {
 *   const url = getRequestURL(event); // "https://example.com/path"
 * });
 */
declare function getRequestURL(event: HTTPEvent | H3Event, opts?: {
  xForwardedHost?: boolean;
  xForwardedProto?: boolean;
}): URL;
/**
 * Try to get the client IP address from the incoming request.
 *
 * By default the address comes from `event.req.ip`: the connection peer, or the
 * client resolved from the forwarded chain when the server is configured to
 * trust an upstream proxy (e.g. srvx's `trustProxy`).
 *
 * If `xForwardedFor` is `true`, the **first** entry of the `x-forwarded-for`
 * header is returned instead, when the header exists.
 *
 * If IP cannot be determined, it will default to `undefined`.
 *
 * **Security:** `xForwardedFor` is opt-in because that first entry is client
 * input. Proxies conventionally *append* to the chain (nginx
 * `$proxy_add_x_forwarded_for`, most CDNs, and h3's own {@link proxy} util), so
 * a value sent by the client stays at the left of the chain and is exactly what
 * this returns — letting any caller choose their own address and defeat IP
 * allow-lists, rate limiting, geo checks, and audit logs. Enabling it also
 * *overrides* `event.req.ip`, discarding an address the server already resolved
 * correctly. Prefer configuring the server to trust your proxy (srvx
 * `trustProxy` walks the chain from the right, past trusted hops) and leave this
 * option off; only enable it when an upstream you control always overwrites
 * `x-forwarded-for` on every request.
 *
 * @example
 * app.get("/", (event) => {
 *   const ip = getRequestIP(event); // "192.0.2.0"
 * });
 */
declare function getRequestIP(event: HTTPEvent, opts?: {
  /**
   * Return the first entry of the `X-Forwarded-For` HTTP header set by proxies.
   *
   * Note: only enable this when an upstream you control *overwrites* the
   * header. A proxy that appends to it (the common default) leaves a
   * client-sent value first, making the result spoofable. Prefer a trusted
   * proxy configured on the server (srvx `trustProxy`) with `event.req.ip`.
   */
  xForwardedFor?: boolean;
}): string | undefined;
type IterationSource<Val, Ret = Val> = Iterable<Val> | AsyncIterable<Val> | Iterator<Val, Ret | undefined> | AsyncIterator<Val, Ret | undefined> | (() => Iterator<Val, Ret | undefined> | AsyncIterator<Val, Ret | undefined>);
type IteratorSerializer<Value> = (value: Value) => Uint8Array | undefined;
type DisposeCallback = (reason?: unknown) => unknown;
/**
 * Register a callback that runs once the event is fully over: the response body finished streaming, the client disconnected, or the body errored — on every runtime, not just Node.js.
 *
 * The callback receives `undefined` on normal completion, or the cancel/abort reason otherwise. Callbacks run in registration order after the global `onResponse` hook; sync throws and async rejections are absorbed (reported via `console.error` unless the app is configured with `silent`), and pending async callbacks are passed to `waitUntil`.
 *
 * Registering after disposal invokes the callback immediately. Registration is only guaranteed to observe the end of the event when made during request handling (handler, middleware, or `onResponse`).
 *
 * Note: this signals _"h3 is done with this event"_, not _"the client received the response"_ — for non-streaming bodies on non-Node.js runtimes it fires when the response is handed to the runtime. To react to a client disconnect _while still producing_ the response (for example to abort an upstream fetch), use `event.req.signal` instead.
 *
 * @example
 * app.get("/sse", (event) => {
 *   const interval = setInterval(() => {}, 1000);
 *   onDispose(event, () => clearInterval(interval));
 *   // ... return a streaming response
 * });
 */
declare function onDispose(event: H3Event, cb: DisposeCallback): void;
/**
 * Respond with an empty payload.<br>
 *
 * @example
 * app.get("/", () => noContent());
 *
 * @param status status code to be send. By default, it is `204 No Content`.
 */
declare function noContent(status?: number): HTTPResponse;
/**
 * Send a redirect response to the client.
 *
 * It adds the `location` header to the response and sets the status code to 302 by default.
 *
 * In the body, it sends a simple HTML page with a meta refresh tag to redirect the client in case the headers are ignored.
 *
 * **Security:** If `location` derives from user input (query params, form fields,
 * headers, etc.), validate it against an allow-list of permitted destinations
 * before redirecting. Passing user-controlled values through unchecked creates an
 * open redirect vulnerability. Prefer `redirectBack` for "return to previous page"
 * flows, which only honors same-origin referers.
 *
 * @example
 * app.get("/", () => {
 *   return redirect("https://example.com");
 * });
 *
 * @example
 * app.get("/", () => {
 *   return redirect("https://example.com", 301); // Permanent redirect
 * });
 */
declare function redirect(location: string, status?: number, statusText?: string): HTTPResponse;
/**
 * Redirect the client back to the previous page using the `referer` header.
 *
 * If the `referer` header is missing or is a different origin, it falls back to the provided URL (default `"/"`).
 *
 * By default, only the **pathname** of the referer is used (query string and hash are stripped)
 * to prevent spoofed referers from carrying unintended parameters. Set `allowQuery: true` to preserve the query string.
 *
 * **Security:** The `fallback` value MUST be a trusted, hardcoded path — never use user input.
 * Passing user-controlled values (e.g., query params) as `fallback` creates an open redirect vulnerability.
 *
 * @example
 * app.post("/submit", (event) => {
 *   // process form...
 *   return redirectBack(event, { fallback: "/form" });
 * });
 */
declare function redirectBack(event: H3Event, opts?: {
  /** Fallback URL when referer is missing or cross-origin (default: `"/"`). **Must be a trusted, hardcoded path — never user input.** */
  fallback?: string;
  /** HTTP status code for the redirect (default: `302`). */
  status?: number;
  /** Preserve the query string from the referer URL (default: `false`). */
  allowQuery?: boolean;
}): HTTPResponse;
/**
 * Write `HTTP/1.1 103 Early Hints` to the client.
 *
 * In runtimes that don't support early hints natively, this function
 * falls back to setting response headers which can be used by CDN.
 */
declare function writeEarlyHints(event: H3Event, hints: Record<string, string | string[]>): void | Promise<void>;
/**
 * Iterate a source of chunks and send back each chunk in order.
 * Supports mixing async work together with emitting chunks.
 *
 * Each chunk must be a string or a buffer.
 *
 * For generator (yielding) functions, the returned value is treated the same as yielded values.
 *
 * The first chunk is awaited before the response is created, so status and headers staged while
 * producing it (`event.res.status`, `event.res.headers`) are still applied. Everything set after
 * the first chunk is ignored — headers are already on the wire by then. (Returning a raw
 * `ReadableStream` gives no such window: its response is created before the stream is read.)
 *
 * @param iterable - Iterator that produces chunks of the response.
 * @param serializer - Function that converts values from the iterable into stream-compatible values.
 * @template Value - Test
 *
 * @example
 * return iterable(async function* work() {
 *   // Open document body
 *   yield "<!DOCTYPE html>\n<html><body><h1>Executing...</h1><ol>\n";
 *   // Do work ...
 *   for (let i = 0; i < 1000; i++) {
 *     await delay(1000);
 *     // Report progress
 *     yield `<li>Completed job #`;
 *     yield i;
 *     yield `</li>\n`;
 *   }
 *   // Close out the report
 *   return `</ol></body></html>`;
 * });
 * async function delay(ms) {
 *   return new Promise((resolve) => setTimeout(resolve, ms));
 * }
 */
declare function iterable<Value = unknown, Return = unknown>(iterable: IterationSource<Value, Return>, options?: {
  serializer: IteratorSerializer<Value | Return>;
}): Promise<HTTPResponse>;
/**
 * Respond with HTML content.
 *
 * When used as a **tagged template**, interpolated values are automatically
 * HTML-escaped (`& < > " '`) to help prevent XSS. Wrap a value with {@link raw}
 * to opt out of escaping for trusted markup.
 *
 * When called with a **plain string**, the whole string is HTML-escaped and
 * rendered as text. If escaping changes the input, a warning is logged — use
 * the tagged template for dynamic values, or pass trusted markup with
 * {@link raw}: `html(raw(markup))`.
 *
 * Escaping protects values in element content and inside quoted attribute
 * values only. It cannot make unquoted attributes, URL attributes (e.g.
 * `href` with a `javascript:` URL) or `<script>`/`<style>` contents safe —
 * validate such values separately.
 *
 * @example
 * // Tagged template (interpolations are escaped):
 * app.get("/", () => html`<h1>Hello, ${name}!</h1>`);
 *
 * @example
 * // Trusted markup (used as-is, not escaped):
 * app.get("/", () => html(raw("<h1>Hello, World!</h1>")));
 *
 * @example
 * // Opt out of escaping for a trusted interpolation:
 * app.get("/", () => html`<div>${raw(trustedMarkup)}</div>`);
 */
declare function html(strings: TemplateStringsArray, ...values: unknown[]): HTTPResponse;
declare function html(markup: string | RawHTML): HTTPResponse;
/**
 * Mark a string as trusted, pre-escaped HTML so it is used by the
 * {@link html} util **without** being escaped.
 *
 * Only use this for markup you fully control — passing user input to `raw`
 * re-introduces XSS risk.
 *
 * @example
 * // `heading` is trusted markup; `userName` is escaped automatically.
 * app.get("/", () => html`<div>${raw(heading)}<span>${userName}</span></div>`);
 *
 * @example
 * // Send a trusted markup string as-is:
 * app.get("/", () => html(raw("<h1>Hello, World!</h1>")));
 */
declare function raw(value: string): RawHTML;
/** Trusted raw HTML wrapper produced by {@link raw}. */
interface RawHTML {
  readonly value: string;
}
/**
 * Advertise the query formats a resource accepts by setting the `Accept-Query`
 * response header (RFC 10008, HTTP `QUERY` method).
 *
 * The media types are serialized as a
 * [Structured Fields](https://www.rfc-editor.org/rfc/rfc8941) List: the base
 * media type becomes a token and any `;name=value` parameters are emitted with
 * their values as quoted strings.
 *
 * @example
 * app.query("/search", (event) => {
 *   appendAcceptQuery(event, ["application/sql;charset=UTF-8", "application/jsonpath"]);
 *   // Accept-Query: application/sql;charset="UTF-8", application/jsonpath
 *   return handleSearch(event);
 * });
 *
 * @param event The H3Event passed by the handler.
 * @param mediaTypes A media type (with optional parameters) or an array of them.
 */
declare function appendAcceptQuery(event: H3Event, mediaTypes: string | string[]): void;
/**
 * Assert that the request `Content-Type` is present and one of the accepted
 * media types, following the requirements of RFC 10008 for the HTTP `QUERY`
 * method.
 *
 * Throws:
 *
 * - `400 Bad Request` if the `Content-Type` header is missing.
 *
 * - `422 Unprocessable Content` if the `Content-Type` header is malformed.
 *
 * - `415 Unsupported Media Type` if the media type is not accepted.
 *
 * Accepted types may use wildcards: `*` / `*&#47;*` match anything and
 * `type/*` matches any subtype of `type`.
 *
 * @example
 * app.query("/search", async (event) => {
 *   requireContentType(event, ["application/sql", "application/jsonpath"]);
 *   const body = await readBody(event, { type: "text" });
 *   // ...
 * });
 *
 * @param event The HTTPEvent passed by the handler.
 * @param acceptedTypes An accepted media type or an array of them.
 * @returns The matched request media type (lower-cased, without parameters).
 */
declare function requireContentType(event: HTTPEvent, acceptedTypes: string | string[]): string;
/**
 * Define a middleware that runs on each request.
 */
declare function onRequest(hook: (event: H3Event) => MaybePromise$1<void>): Middleware;
/**
 * Define a middleware that runs after Response is generated.
 *
 * You can return a new Response from the handler to replace the original response.
 */
declare function onResponse(hook: (response: Response, event: H3Event) => unknown): Middleware;
/**
 * Define a middleware that runs when an error occurs.
 *
 * You can return a new Response from the handler to gracefully handle the error.
 */
declare function onError(hook: (error: HTTPError, event: H3Event) => unknown): Middleware;
/**
 * Define a middleware that limits the request body size to the specified limit.
 *
 * The limit is enforced as the body is read (see {@link assertBodySize}), so an
 * oversized body surfaces as a `413` Request Entity Too Large error when the
 * handler consumes it (an honest oversized `Content-Length` is still rejected
 * up-front). A body the handler never reads is not counted. If you need custom
 * handling, use `assertBodySize` directly.
 *
 * @param limit Body size limit in bytes
 * @see {assertBodySize}
 */
declare function bodyLimit(limit: number): Middleware;
interface ReadBodyOptions {
  /**
   * Force a parser instead of inferring it from the request `Content-Type`.
   *
   * - `"json"` (default): parse as JSON.
   * - `"text"`: return the raw string body.
   * - `"urlencoded"`: parse as `application/x-www-form-urlencoded`.
   * - `"formData"`: parse as `multipart/form-data` (or url-encoded) form data.
   */
  type?: "json" | "text" | "urlencoded" | "formData";
}
/**
 * Reads request body and tries to parse using JSON.parse or URLSearchParams.
 *
 * By default the body is parsed as JSON (falling back to URL-encoded parsing
 * when the `Content-Type` is `application/x-www-form-urlencoded`). Other body
 * types, such as `multipart/form-data`, must be opted into explicitly via
 * `options.type` and are never auto-detected from the request headers.
 *
 * @example
 * app.post("/", async (event) => {
 *   const body = await readBody(event);
 * });
 * @example
 * app.post("/upload", async (event) => {
 *   const body = await readBody(event, { type: "formData" });
 * });
 *
 * @param event H3 event passed by h3 handler
 * @param options Parsing options. Set `type` to force a parser instead of
 *   inferring it from the request `Content-Type`.
 *
 * @return {*} The `Object`, `Array`, `String`, `Number`, `Boolean`, or `null` value corresponding to the request body
 */
declare function readBody<T, _Event extends HTTPEvent = HTTPEvent, _T = InferEventInput<"body", _Event, T>>(event: _Event, options?: ReadBodyOptions): Promise<undefined | _T>;
declare function readValidatedBody<Event extends HTTPEvent, S extends StandardSchemaV1>(event: Event, validate: S, options?: ReadBodyOptions & {
  onError?: (result: FailureResult) => ErrorDetails;
}): Promise<InferOutput<S>>;
declare function readValidatedBody<Event extends HTTPEvent, OutputT, InputT = InferEventInput<"body", Event, OutputT>>(event: Event, validate: (data: InputT) => ValidateResult<OutputT> | Promise<ValidateResult<OutputT>>, options?: ReadBodyOptions & {
  onError?: () => ErrorDetails;
}): Promise<OutputT>;
/**
 * Asserts that the request body size is within the specified limit.
 *
 * The limit is enforced **as the body is read**, not by pre-buffering: the
 * request is wrapped by srvx's `limitRequestBody`, which counts bytes as they
 * flow and aborts with a `413` {@link HTTPError} the moment the running total
 * exceeds `limit` (the error is injected via `createError`). This preserves the
 * byte-accurate guarantee (a lying-small `Content-Length` is still caught
 * mid-stream) without holding the body in memory or blocking streaming handlers.
 *
 * An honest `Content-Length` that already exceeds the limit is rejected up-front
 * with a `413`, and a request carrying both `Content-Length` and
 * `Transfer-Encoding` is rejected with a `400` (request smuggling, RFC 7230).
 *
 * Because enforcement is tied to consumption, an overflow on a chunked /
 * unknown-length body surfaces when the handler reads the body rather than as a
 * pre-handler `413`, and a body the handler never reads is never counted.
 *
 * @example
 * app.post("/", async (event) => {
 *   assertBodySize(event, 10 * 1024 * 1024); // 10MB
 *   const data = await event.req.formData();
 * });
 *
 * @param event HTTP event
 * @param limit Body size limit in bytes
 */
declare function assertBodySize(event: HTTPEvent, limit: number): void;
/**
 * Parse the request to get HTTP Cookie header string and returning an object of all cookie name-value pairs.
 * @param event {HTTPEvent} H3 event or req passed by h3 handler
 * @returns Object of cookie name-value pairs
 * ```ts
 * const cookies = parseCookies(event)
 * ```
 */
declare function parseCookies(event: HTTPEvent): Record<string, string | undefined>;
/**
 * Get and validate all cookies using a Standard Schema or custom validator.
 *
 * @example
 * app.get("/", async (event) => {
 *   const cookies = await getValidatedCookies(event, z.object({
 *     session: z.string(),
 *     theme: z.enum(["light", "dark"]).optional(),
 *   }));
 * });
 */
declare function getValidatedCookies<Event extends HTTPEvent, S extends StandardSchemaV1<any, any>>(event: Event, validate: S, options?: {
  onError?: (result: FailureResult) => ErrorDetails;
}): Promise<InferOutput<S>>;
declare function getValidatedCookies<Event extends HTTPEvent, OutputT>(event: Event, validate: (data: Record<string, string | undefined>) => ValidateResult<OutputT> | Promise<ValidateResult<OutputT>>, options?: {
  onError?: () => ErrorDetails;
}): Promise<OutputT>;
/**
 * Get a cookie value by name.
 * @param event {HTTPEvent} H3 event or req passed by h3 handler
 * @param name Name of the cookie to get
 * @returns {*} Value of the cookie (String or undefined)
 * ```ts
 * const authorization = getCookie(request, 'Authorization')
 * ```
 */
declare function getCookie(event: HTTPEvent, name: string): string | undefined;
/**
 * Set a cookie value by name.
 * @param event {H3Event} H3 event or res passed by h3 handler
 * @param name Name of the cookie to set
 * @param value Value of the cookie to set
 * @param options {CookieSerializeOptions} Options for serializing the cookie
 * ```ts
 * setCookie(res, 'Authorization', '1234567')
 * ```
 */
declare function setCookie(event: H3Event, name: string, value: string, options?: CookieSerializeOptions): void;
/**
 * Remove a cookie by name.
 * @param event {H3Event} H3 event or res passed by h3 handler
 * @param name Name of the cookie to delete
 * @param serializeOptions {CookieSerializeOptions} Cookie options
 * ```ts
 * deleteCookie(res, 'SessionId')
 * ```
 */
declare function deleteCookie(event: H3Event, name: string, serializeOptions?: CookieSerializeOptions): void;
/**
 * Get a chunked cookie value by name. Will join chunks together.
 * @param event {HTTPEvent} { req: Request }
 * @param name Name of the cookie to get
 * @returns {*} Value of the cookie (String or undefined)
 * ```ts
 * const session = getChunkedCookie(event, 'Session')
 * ```
 */
declare function getChunkedCookie(event: HTTPEvent, name: string): string | undefined;
/**
 * Set a cookie value by name. Chunked cookies will be created as needed.
 * @param event {H3Event} H3 event or res passed by h3 handler
 * @param name Name of the cookie to set
 * @param value Value of the cookie to set
 * @param options {CookieSerializeOptions} Options for serializing the cookie
 * ```ts
 * setCookie(res, 'Session', '<session data>')
 * ```
 */
declare function setChunkedCookie(event: H3Event, name: string, value: string, options?: CookieSerializeOptions & {
  chunkMaxLength?: number;
}): void;
/**
 * Remove a set of chunked cookies by name.
 * @param event {H3Event} H3 event or res passed by h3 handler
 * @param name Name of the cookie to delete
 * @param serializeOptions {CookieSerializeOptions} Cookie options
 * ```ts
 * deleteCookie(res, 'Session')
 * ```
 */
declare function deleteChunkedCookie(event: H3Event, name: string, serializeOptions?: CookieSerializeOptions): void;
/**
 * Options for the {@link EventStream} constructor.
 *
 * Currently empty — reserved for future configuration.
 */
interface EventStreamOptions {}
/**
 * See https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#fields
 */
interface EventStreamMessage {
  id?: string;
  event?: string;
  retry?: number;
  data: string;
}
/**
 * A helper class for [server sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format)
 *
 * Extends {@link HTTPResponse} so it can be returned directly from a handler
 * (`return eventStream`) — `toResponse` already renders any `HTTPResponse` as
 * the response, streaming the readable side with the SSE headers below.
 *
 * @example
 *
 * ```ts
 * import { EventStream } from "h3";
 *
 * app.get("/sse", (event) => {
 *   const eventStream = new EventStream(event);
 *
 *   // Send a message every second
 *   const interval = setInterval(async () => {
 *     await eventStream.push("Hello world");
 *   }, 1000);
 *
 *   // cleanup the interval when the connection is terminated
 *   eventStream.onClosed(() => clearInterval(interval));
 *
 *   return eventStream;
 * });
 * ```
 */
declare class EventStream extends HTTPResponse {
  private readonly _event;
  private readonly _transformStream;
  private readonly _writer;
  private readonly _encoder;
  private readonly _closeCallbacks;
  private _writerIsClosed;
  private _paused;
  private _unsentData;
  private _disposed;
  private get _isClosed();
  constructor(event: H3Event, _opts?: EventStreamOptions);
  /**
   * Publish new event(s) for the client
   */
  push(message: string): Promise<void>;
  push(message: string[]): Promise<void>;
  push(message: EventStreamMessage): Promise<void>;
  push(message: EventStreamMessage[]): Promise<void>;
  pushComment(comment: string): Promise<void>;
  private _sendEvent;
  private _sendEvents;
  pause(): void;
  get isPaused(): boolean;
  resume(): Promise<void>;
  flush(): Promise<void>;
  /**
   * Close the stream and the connection if the stream is being sent to the client
   */
  close(): Promise<void>;
  /**
   * Triggers callback when the stream is closed, either by calling the
   * `close()` method or when the client disconnects.
   */
  onClosed(cb: () => any): void;
  /**
   * Return the readable side of the stream, staging the SSE headers on the event.
   *
   * @deprecated Return the stream itself instead (`return eventStream`) — it
   * carries the same headers via {@link HTTPResponse}. Kept for compatibility
   * with the `return eventStream.send()` pattern.
   */
  send(): Promise<BodyInit>;
}
/**
 * Append a `Server-Timing` entry to the response.
 *
 * Multiple calls append to the same header (comma-separated per spec).
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Server-Timing
 *
 * @example
 * app.get("/", (event) => {
 *   setServerTiming(event, "db", { dur: 53, desc: "Database query" });
 *   return { data: "..." };
 * });
 * // Response header: Server-Timing: db;desc="Database query";dur=53
 */
declare function setServerTiming(event: H3Event, name: string, opts?: {
  dur?: number;
  desc?: string;
}): void;
/**
 * Measure an async operation and append the timing to the `Server-Timing` header.
 *
 * Uses `performance.now()` for high-resolution timing.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Server-Timing
 *
 * @example
 * app.get("/", async (event) => {
 *   const users = await withServerTiming(event, "db", () => fetchUsers());
 *   return users;
 * });
 * // Response header: Server-Timing: db;dur=42.5
 */
declare function withServerTiming<T>(event: H3Event, name: string, fn: () => T | Promise<T>): Promise<T>;
/**
 * Make sure the status message is safe to use in a response.
 *
 * Allowed characters: horizontal tabs, spaces or visible ascii characters: https://www.rfc-editor.org/rfc/rfc7230#section-3.1.2
 */
declare function sanitizeStatusMessage(statusMessage?: string): string;
/**
 * Make sure the status code is a valid HTTP status code.
 */
declare function sanitizeStatusCode(statusCode?: string | number, defaultStatusCode?: number): number;
interface CacheConditions {
  modifiedTime?: string | Date;
  maxAge?: number;
  etag?: string;
  cacheControls?: string[];
  /**
   * `If-None-Match` to evaluate instead of the request header. A cache layer
   * that narrows the request it forwards holds the only copy of the validator.
   */
  ifNoneMatch?: string;
  /** `If-Modified-Since` to evaluate instead of the request header. */
  ifModifiedSince?: string;
}
/**
 * Check request caching headers (`If-None-Match`, `If-Modified-Since`) and add caching headers (Last-Modified, ETag, Cache-Control).
 *
 * Note: `public` is added by default, but never alongside a caller-supplied `private`/`no-store` directive, so passing `cacheControls: ["private"]` no longer produces a contradictory `public, private`.
 * @returns `true` when cache headers are matching. When `true` is returned, no response should be sent anymore
 */
declare function handleCacheHeaders(event: H3Event, opts: CacheConditions): boolean;
interface ResolveDotSegmentsOptions {
  /**
   * Also decode percent-encoded path separators (`%2f`, `%5c`) into real `/`
   * segment boundaries before resolving `.`/`..`.
   *
   * `event.url.pathname` never decodes `%2f`, because doing so would change how
   * many segments a path has and therefore which route matches — a correctness
   * concern for dispatch, not just a security one
   * (e.g. `/files/:id` may rely on `%2F` to keep an id with a literal slash
   * as one opaque segment). So never use the result for routing/dispatch.
   *
   * Enable this for any out-of-band scope/security check whose result is
   * later handed to something that collapses `%2f` back to `/` on its own —
   * which is the common case, not an exotic one: an ordinary reverse proxy
   * (e.g. nginx with a trailing-slash `proxy_pass`) decodes `%2f`→`/` on every
   * request, so an encoded separator that dodges a narrower rule at match time
   * then escapes it downstream. If a scope check feeds a proxy or redirect
   * target, you almost certainly want this on.
   *
   * Decoding is pessimistic but bounded: it collapses a separator nested as
   * repeated whole `%25` prefixes (`%252f`, `%25252f`, ...) at any depth, so a
   * downstream that keeps `%25`-re-encoding and decoding cannot smuggle one
   * past. It does NOT catch a separator whose own hex digits are themselves
   * percent-encoded (`%25%32%66` → `%2f` → `/` after two decodes) — though that
   * exact spelling reaches a handler already canonicalized to `%252f`, which is
   * collapsed.
   * Treat this as covering the common `%25`-nesting case, not as an absolute
   * guarantee against every multi-decode chain. Other escapes (e.g. `%20`) are
   * never decoded.
   *
   * @default false
   */
  decodeSlashes?: boolean;
  /**
   * Collapse runs of consecutive path separators (interior empty `//` segments)
   * instead of preserving them, producing the *maximal-traversal* canonical
   * form — the path a slash-merging downstream (nginx `merge_slashes`, or any
   * backend that decodes then normalizes) actually resolves. It operates on the
   * separator set that is active after the normalizations above: a literal `/`,
   * a `\` normalized to `/`, and — with {@link decodeSlashes} — a decoded
   * `%2f`/`%5c` (so the same bounded `%25`-nesting boundary is inherited, and a
   * hex-of-hex form like `%25%32%66` is no more collapsed here than it is
   * decoded there).
   *
   * This is the reading in which a `..` next to an empty segment is no longer
   * shielded by it: `/a//..` resolves to `/`, not `/a`. The two readings diverge
   * exactly there, so a scope check that only looks at the empty-preserving form
   * can pass a path that still escapes downstream. Enable this for a fail-closed
   * scope/security check that must also hold against a slash-merging downstream
   * — but note a `/`-splitting router (rou3) does not merge slashes, so this
   * form is one of two readings such a check has to consider, not a replacement
   * for the other. Never use the result for routing/dispatch.
   *
   * Only *runs* collapse: a single trailing slash is preserved (`/a/` stays
   * `/a/`, `/a//` becomes `/a/`), as with nginx.
   *
   * @default false
   */
  mergeSlashes?: boolean;
}
/**
 * Resolve `.` and `..` segments in a path, without ever escaping above the
 * root `/`. The result is always an absolute path with a single leading `/`,
 * so it can never be protocol-relative (`//host`).
 *
 * Also decodes percent-encoded dot segments at any `%25`-nesting depth
 * (`%2e`, `%252e`, ...) and normalizes `\` to `/`, so encoded or
 * backslash-based traversal (e.g. `%2e%2e/`, `..\..\`) is caught the same
 * way as a literal `../`.
 *
 * `%2f`/`%5c` (encoded path separators) are left untouched by default — see
 * {@link ResolveDotSegmentsOptions.decodeSlashes}.
 *
 * Only `.`/`..` resolution and the decodes above alter the string; every other
 * percent-encoding (`%20`, non-ASCII, `%3A`, and any `%2e` not forming a whole
 * segment) is left intact, so the result stays in the same representation as
 * `event.url.pathname` and matches routes/rules consistently.
 * A trailing `.`/`..` resolves to a directory and keeps its trailing slash
 * (`/a/b/..` -> `/a/`, `/a/.` -> `/a/`), per RFC 3986 §5.2.4 and matching what a
 * WHATWG/nginx downstream resolves — so a scope check sees the directory form,
 * not its file-form sibling.
 * Interior empty segments are preserved (`/a//b` stays `/a//b`) — like WHATWG,
 * this never merges slashes, so empty segments survive rather than collapsing.
 * The one exception is a *leading* run: it is always clamped to a single `/`
 * (WHATWG would keep `//host`), so only the leading slash is guaranteed single
 * and a consumer doing exact prefix matching should normalize its allowlist the
 * same way. To collapse interior runs too (the reading a slash-merging
 * downstream resolves), see {@link ResolveDotSegmentsOptions.mergeSlashes}.
 */
declare function resolveDotSegments(path: string, opts?: ResolveDotSegmentsOptions): string;
/**
 * Whether `path` is already canonical under `opts` — i.e. {@link resolveDotSegments}
 * would return it unchanged. Exact in both directions: `true` if and only if
 * `resolveDotSegments(path, opts) === path`.
 *
 * This is the resolver's own fast-path guard, exported so a caller that
 * canonicalizes on a hot path (per-request scope or rule matching) can skip the
 * call — and any work derived from it — without keeping its own copy of what the
 * resolver decodes. Such a copy goes stale silently, and a missed
 * canonicalization in a scope check is a bypass, not a perf bug.
 *
 * Pass the same options as the later {@link resolveDotSegments} call, or stricter
 * ones: `decodeSlashes`/`mergeSlashes` only add triggers, so `true` with both
 * enabled implies `true` in every mode. Checking one mode and resolving in
 * another voids the guarantee.
 *
 * Takes a bare pathname. Like the resolver, it has no notion of a query or hash
 * and scans one as if it were path, so `/a?next=/../b` is reported non-canonical
 * (and would resolve to `/b`).
 */
declare function isCanonicalPath(path: string, opts?: ResolveDotSegmentsOptions): boolean;
interface StaticAssetMeta {
  type?: string;
  etag?: string;
  mtime?: number | string | Date;
  size?: number;
  encoding?: string;
}
interface ServeStaticOptions {
  /**
   * This function should resolve asset meta.
   *
   * **Security:** The `id` keeps encoded separators (`%2f`, `%5c`)
   * percent-encoded. Decoding them here re-introduces separators and defeats
   * the traversal normalization done by `serveStatic`. See {@link serveStatic}.
   */
  getMeta: (id: string) => StaticAssetMeta | undefined | Promise<StaticAssetMeta | undefined>;
  /**
   * This function should resolve asset content.
   *
   * **Security:** As with `getMeta`, the `id` must not be decoded before
   * resolving the asset. See {@link serveStatic}.
   */
  getContents: (id: string) => BodyInit | null | undefined | Promise<BodyInit | null | undefined>;
  /**
   * Headers to set on the response
   */
  headers?: HeadersInit;
  /**
   * Map of supported encodings (compressions) and their file extensions.
   *
   * Each extension will be appended to the asset path to find the compressed version of the asset.
   *
   * @example { gzip: ".gz", br: ".br" }
   */
  encodings?: Record<string, string>;
  /**
   * Default index file to serve when the path is a directory
   *
   * @default ["/index.html"]
   */
  indexNames?: string[];
  /**
   * When set to true, the function will not throw 404 error when the asset meta is not found or meta validation failed
   */
  fallthrough?: boolean;
  /**
   * Custom MIME type resolver function
   * @param ext - File extension including dot (e.g., ".css", ".js")
   */
  getType?: (ext: string) => string | undefined;
}
/**
 * Dynamically serve static assets based on the request path.
 *
 * **Security — path traversal:** `serveStatic` resolves `.`/`..` segments but
 * deliberately keeps encoded separators (`%2f`, `%5c`) percent-encoded in the
 * `id` it passes to `getMeta`/`getContents`, exactly as `event.url.pathname`
 * does. The `id` therefore has the same segment structure the router and
 * pathname-scoped `use()` guards matched on: `/private%5cx` stays one opaque
 * segment and cannot be served as `/private/x` past a `use("/private/**")`
 * guard. Resolve the `id` against your asset root as an opaque string — a
 * backend that decodes it re-introduces separators and re-opens the hole.
 *
 * A **non-canonical pathname is not served** (404, or falls through when
 * `fallthrough` is set): more than one leading separator (`//private/x`,
 * `/\\private/x`) or a dot segment that survived URL canonicalization, which
 * means one spelled with `%25`-nested escapes (`/pub/%252e%252e/private/x`).
 * Both dispatch to a catch-all route while missing a narrower
 * `use("/private/**")` guard, and the only `id` `serveStatic` could build from
 * them resolves back into the guarded path. Assets are reachable under their
 * canonical spelling — the one routing and `use()` guards match on — only.
 *
 * Everything else is decoded once for the on-disk lookup, so a file's real name
 * reaches the backend: `/50%25.png` → `/50%.png`, `/a%20b` → `/a b`, and one
 * `%25` level is peeled off a nested separator (`/a%252fb` → `/a%2fb`, still a
 * literal `%2f`, never a boundary). RFC 3986's reserved set stays encoded, so an
 * `id` can never grow a `?` or `#` that would truncate it in a URL.
 *
 * Two things `serveStatic` cannot enforce for filesystem-backed assets:
 * **case-insensitive filesystems** (macOS, Windows) need both sides of any
 * allow/deny check case-folded (otherwise `/SECRET.env` slips past a check for
 * `/secret.env`), and **symlinks** need the resolved path re-asserted against
 * the asset root after following links (e.g. `realpath(target)`).
 */
declare function serveStatic(event: H3Event, options: ServeStaticOptions): Promise<HTTPResponse | undefined>;
/**
 * Returns a new event handler that removes the base url of the event before calling the original handler.
 *
 * @example
 * const api = new H3()
 *  .get("/", () => "Hello API!");
 * const app = new H3();
 *  .use("/api/**", withBase("/api", api.handler));
 *
 * @param base The base path to prefix.
 * @param handler The event handler to use with the adapted path.
 */
declare function withBase(base: string, input: HTTPHandler): EventHandler;
type _BasicAuthOptions = {
  /**
   * Validate username for basic auth.
   */
  username: string;
  /***
   * Simple password for basic auth.
   */
  password: string;
  /**
   * Custom validation function for basic auth.
   *
   * When provided, the built-in non-empty check is skipped and this function
   * receives the decoded `username`/`password` as-is, including empty strings
   * (RFC 7617 permits an empty user-id and/or password). It must return `false`
   * to reject empty or otherwise invalid credentials.
   */
  validate: (username: string, password: string) => boolean | Promise<boolean>;
  /**
   * Realm for the basic auth challenge.
   *
   * Defaults to "auth".
   */
  realm: string;
};
type BasicAuthOptions = Partial<_BasicAuthOptions> & ({
  validate: _BasicAuthOptions["validate"];
} | {
  password: _BasicAuthOptions["password"];
});
/**
 * Apply basic authentication for current request.
 *
 * @example
 * import { defineHandler, requireBasicAuth } from "h3";
 * export default defineHandler(async (event) => {
 *   await requireBasicAuth(event, { password: "test" });
 *   return `Hello, ${event.context.basicAuth.username}!`;
 * });
 */
declare function requireBasicAuth(event: HTTPEvent, opts: BasicAuthOptions): Promise<true>;
/**
 * Create a basic authentication middleware.
 *
 * @example
 * import { H3, serve, basicAuth } from "h3";
 * const auth = basicAuth({ password: "test" });
 * app.get("/", (event) => `Hello ${event.context.basicAuth?.username}!`, [auth]);
 * serve(app, { port: 3000 });
 */
declare function basicAuth(opts: BasicAuthOptions): Middleware;
interface RequestFingerprintOptions {
  /** @default SHA-256 */
  hash?: false | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
  /** @default `true` */
  ip?: boolean;
  /** @default `false` */
  xForwardedFor?: boolean;
  /** @default `false` */
  method?: boolean;
  /** @default `false` */
  url?: boolean;
  /** @default `false` */
  userAgent?: boolean;
}
/**
 *
 * Get a unique fingerprint for the incoming request.
 *
 * @experimental Behavior of this utility might change in the future versions
 */
declare function getRequestFingerprint(event: HTTPEvent, opts?: RequestFingerprintOptions): Promise<string | null>;
/**
 * The `426 Upgrade Required` response returned by `defineWebSocketHandler()`
 * for WebSocket upgrade requests, with the resolved hooks attached as `crossws`.
 *
 * Convenience only: hooks are handed to adapters on the *request*
 * (`Symbol.for("crossws.hooks")`), because a `Response` is rebuilt whenever
 * anything stages a response header on the way out and a rebuild carries none of
 * the original's own properties. Read `crossws` off a response only when nothing
 * in the app can have touched it; `getWebSocketHooks(request)` from crossws is
 * the reliable read.
 *
 * `crossws` is always the resolved hooks object: when the handler is defined
 * with an async hooks factory, `defineWebSocketHandler()` awaits it before
 * attaching it.
 */
type WebSocketResponse = Response & {
  crossws?: Partial<Hooks>;
};
/**
 * Define WebSocket hooks.
 *
 * @example
 * const hooks = defineWebSocket({
 *   open: (peer) => peer.send("Welcome!"),
 *   message: (peer, message) => peer.send(message.text()),
 *   close: (peer) => console.log("closed", peer),
 * });
 *
 * @see https://h3.dev/guide/websocket
 */
declare function defineWebSocket(hooks: Partial<Hooks>): Partial<Hooks>;
declare function defineWebSocketHandler(hooks: Partial<Hooks>): EventHandler<EventHandlerRequest, WebSocketResponse>;
declare function defineWebSocketHandler(hooks: (event: H3Event) => Partial<Hooks> | Promise<Partial<Hooks>>): EventHandler<EventHandlerRequest, EventHandlerResponse<WebSocketResponse>>;
declare function defineWebSocketHandler<Http extends EventHandler>(hooks: Partial<Hooks>, http: Http): EventHandler<EventHandlerRequest, WebSocketResponse | ReturnType<Http>>;
declare function defineWebSocketHandler<Http extends EventHandler>(hooks: (event: H3Event) => Partial<Hooks> | Promise<Partial<Hooks>>, http: Http): EventHandler<EventHandlerRequest, EventHandlerResponse<WebSocketResponse> | ReturnType<Http>>;
/**
 * JSON-RPC 2.0 Interfaces based on the specification.
 * https://www.jsonrpc.org/specification
 */
/**
 * JSON-RPC 2.0 params.
 */
type JsonRpcParams = Record<string, unknown> | unknown[];
/**
 * JSON-RPC 2.0 Request object.
 */
interface JsonRpcRequest<I extends JsonRpcParams | undefined = JsonRpcParams | undefined> {
  jsonrpc: "2.0";
  method: string;
  params?: I;
  id?: string | number | null;
}
/**
 * JSON-RPC 2.0 Error object.
 */
interface JsonRpcError {
  code: number;
  message: string;
  data?: any;
}
/**
 * JSON-RPC 2.0 Response object.
 */
type JsonRpcResponse<O = unknown> = {
  jsonrpc: "2.0";
  id: string | number | null;
  result: O;
} | {
  jsonrpc: "2.0";
  id: string | number | null;
  error: JsonRpcError;
};
/**
 * A function that handles a JSON-RPC method call.
 * It receives the parameters from the request and the original H3Event.
 */
type JsonRpcMethod<O = unknown, I extends JsonRpcParams | undefined = JsonRpcParams | undefined> = (data: JsonRpcRequest<I>, event: H3Event) => O | Promise<O>;
/**
 * A function that handles a JSON-RPC method call over WebSocket.
 * It receives the parameters from the request and the WebSocket peer.
 */
type JsonRpcWebSocketMethod<O = unknown, I extends JsonRpcParams | undefined = JsonRpcParams | undefined> = (data: JsonRpcRequest<I>, peer: Peer) => O | Promise<O>;
/**
 * Creates an H3 event handler that implements the JSON-RPC 2.0 specification.
 *
 * **Security defaults:** requests must have a JSON `Content-Type` (CSRF, see
 * `validateContentType`), cross-origin requests are rejected (CSRF and DNS
 * rebinding, see `allowedOrigins`), and batches are capped at 50 requests
 * (fan-out amplification, see `maxBatchSize`).
 *
 * @param methods A map of RPC method names to their handler functions.
 * @param middleware Optional middleware to apply to the handler.
 * @returns An H3 EventHandler.
 *
 * @example
 * app.post(
 *   "/rpc",
 *   defineJsonRpcHandler({
 *     methods: {
 *       echo: ({ params }, event) => {
 *         return `Received \`${params}\` on path \`${event.url.pathname}\``;
 *       },
 *       sum: ({ params }, event) => {
 *         return params.a + params.b;
 *       },
 *     },
 *   }),
 * );
 */
declare function defineJsonRpcHandler<RequestT extends EventHandlerRequest = EventHandlerRequest>(opts?: Omit<EventHandlerObject<RequestT>, "handler" | "fetch"> & {
  methods: Record<string, JsonRpcMethod>;
  /**
   * Maximum number of requests allowed in a single batch.
   *
   * Every batch item is dispatched concurrently, so an unbounded batch turns
   * one HTTP request into an arbitrary number of method invocations
   * (per-request rate limiters and quotas count it once) and fans out to
   * upstreams and database pools. Batches larger than this are rejected with
   * an `Invalid Request` (`-32600`) error.
   *
   * Set to `Infinity` to disable the limit.
   *
   * @default 50
   */
  maxBatchSize?: number;
  /**
   * Require a JSON `Content-Type` (`application/json`, `application/json-rpc`
   * or any `+json` media type) and reject anything else with a `415`.
   *
   * This is a CSRF defense: without it, an HTML form (or a typeless `fetch`
   * body) from an attacker page qualifies as a CORS "simple request" and is
   * delivered with the victim's cookies without any preflight. Requiring a
   * JSON content type forces a preflight for cross-origin callers.
   *
   * @default true
   */
  validateContentType?: boolean;
  /**
   * Origins allowed to call this endpoint.
   *
   * By default only same-origin requests are accepted: a request carrying an
   * `Origin` header that does not match the request's own origin is rejected
   * with a `403`. Requests without an `Origin` header (CLI clients,
   * server-to-server, MCP stdio bridges) are always allowed.
   *
   * Pass an explicit allowlist to accept specific cross-origin callers, or
   * `"*"` to disable the check entirely. An allowlist **replaces** the
   * same-origin default rather than extending it, so include this endpoint's
   * own origin as well when browsers served from it call it too.
   *
   * **Behind a proxy:** the same-origin default compares against
   * `event.url.origin`, derived from the request's own protocol and `Host`.
   * A TLS-terminating proxy leaves that `http:` while the browser sends an
   * `https:` `Origin`, so same-origin requests are rejected. Start the server
   * with srvx `trustProxy` when a proxy you control rewrites `X-Forwarded-*`,
   * or pass an explicit allowlist.
   *
   * **Security:** the MCP Streamable HTTP transport requires servers to
   * validate `Origin` to prevent DNS-rebinding attacks. The same-origin
   * default does not stop rebinding on its own (the rebound name is both the
   * `Origin` and the `Host`); locally bound servers should pass an explicit
   * allowlist of the origins they expect (e.g. `["http://localhost:3000"]`).
   *
   * Regular expressions are tested **unanchored** — always anchor them
   * (`/^https:\/\/app\.example\.com$/`).
   */
  allowedOrigins?: "*" | string | (string | RegExp)[] | ((origin: string) => boolean);
}): EventHandler<RequestT>;
/**
 * Creates an H3 event handler that implements JSON-RPC 2.0 over WebSocket.
 *
 * This is an opt-in feature that allows JSON-RPC communication over WebSocket
 * connections for bi-directional messaging. Each incoming WebSocket text message
 * is processed as a JSON-RPC request, and responses are sent back to the peer.
 *
 * **Security:** unlike `defineJsonRpcHandler()`, this does not check the request
 * `Origin`. WebSocket upgrades are not subject to CORS, so a page on any origin
 * can open a connection carrying the visitor's cookies (cross-site WebSocket
 * hijacking). Validate `Origin` in the `upgrade` hook and throw a `Response` to
 * abort the connection.
 *
 * @param opts Options including methods map and optional WebSocket hooks.
 * @returns An H3 EventHandler that upgrades to a WebSocket connection.
 *
 * @example
 * app.get(
 *   "/rpc/ws",
 *   defineJsonRpcWebSocketHandler({
 *     methods: {
 *       echo: ({ params }) => {
 *         return `Received: ${Array.isArray(params) ? params[0] : params?.message}`;
 *       },
 *       sum: ({ params }) => {
 *         return params.a + params.b;
 *       },
 *     },
 *   }),
 * );
 *
 * @example
 * // With additional WebSocket hooks
 * app.get(
 *   "/rpc/ws",
 *   defineJsonRpcWebSocketHandler({
 *     methods: {
 *       greet: ({ params }) => `Hello, ${params.name}!`,
 *     },
 *     hooks: {
 *       open(peer) {
 *         console.log(`Peer connected: ${peer.id}`);
 *       },
 *       close(peer, details) {
 *         console.log(`Peer disconnected: ${peer.id}`, details);
 *       },
 *     },
 *   }),
 * );
 */
declare function defineJsonRpcWebSocketHandler(opts: {
  methods: Record<string, JsonRpcWebSocketMethod>;
  /**
   * Maximum number of requests allowed in a single batch message.
   *
   * Batch items are dispatched concurrently, so an unbounded batch lets a
   * single message fan out to an arbitrary number of method invocations.
   * Larger batches are rejected with an `Invalid Request` (`-32600`) error.
   *
   * Set to `Infinity` to disable the limit.
   *
   * @default 50
   */
  maxBatchSize?: number;
  hooks?: Partial<Omit<Hooks, "message">>;
}): EventHandler;
/** @deprecated Use `HTTPError` */
type H3Error = HTTPError;
/** @deprecated Use `HTTPError` */
declare const H3Error: typeof HTTPError;
/** @deprecated Use new HTTPError() */
declare function createError(message: number, details?: ErrorDetails): HTTPError;
/** @deprecated Use new HTTPError() */
declare function createError(details: ErrorDetails): HTTPError;
/**
 * @deprecated Use `HTTPError.isError`
 */
declare function isError(input: any): input is HTTPError;
/** @deprecated Please use `event.url` */
declare const getRequestPath: (event: H3Event) => string;
/** @deprecated Please use `event.req.headers.get(name)` */
declare function getRequestHeader(event: H3Event, name: string): string | undefined;
/** @deprecated Please use `event.req.headers.get(name)` */
declare const getHeader: (event: H3Event, name: string) => string | undefined;
/** @deprecated Please use `Object.fromEntries(event.req.headers.entries())` */
declare function getRequestHeaders(event: H3Event): Record<string, string>;
/** @deprecated Please use `Object.fromEntries(event.req.headers.entries())` */
declare const getHeaders: (event: H3Event) => Record<string, string>;
/** @deprecated Please use `event.req.method` */
declare function getMethod(event: H3Event, defaultMethod?: string): string;
/** @deprecated Please use `event.req.text()` or `event.req.arrayBuffer()` */
declare function readRawBody<E extends "utf8" | false = "utf8">(event: H3Event, encoding?: E): E extends false ? Promise<Uint8Array | undefined> : Promise<string | undefined>;
/** @deprecated Please use `event.req.formData()` */
declare function readFormDataBody(event: H3Event): Promise<FormData>;
/** @deprecated Please use `event.req.formData()` */
declare const readFormData: (event: H3Event) => Promise<FormData>;
/** @deprecated Please use `event.req.formData()` */
declare function readMultipartFormData(event: H3Event): Promise<Array<{
  data: Uint8Array;
  name?: string;
  filename?: string;
  type?: string;
}>>;
/** @deprecated Please use `event.req.body` */
declare function getBodyStream(event: H3Event): ReadableStream<Uint8Array> | undefined;
/** @deprecated Please use `event.req.body` */
declare const getRequestWebStream: (event: H3Event) => ReadableStream | undefined;
/** @deprecated Please directly return stream */
declare function sendStream(_event: H3Event, value: ReadableStream): ReadableStream;
/** @deprecated Please use `return noContent(event)` */
declare const sendNoContent: (event: H3Event, code?: number) => HTTPResponse;
/** @deprecated Please use `return redirect(event, code)` */
declare const sendRedirect: (event: H3Event, location: string, code?: number) => HTTPResponse;
/** @deprecated Please directly return response */
declare const sendWebResponse: (response: Response) => Response;
/** @deprecated Please use `return proxy(event)` */
declare const sendProxy: (event: H3Event, target: string, opts?: ProxyOptions) => Promise<HTTPResponse>;
/** @deprecated Please use `new EventStream(event)` */
declare function createEventStream(event: H3Event, opts?: EventStreamOptions): EventStream;
/** @deprecated Please use `return iterable(event, value)` */
declare const sendIterable: <Value = unknown, Return = unknown>(_event: H3Event, val: IterationSource<Value, Return>, options?: {
  serializer: IteratorSerializer<Value | Return>;
}) => Promise<HTTPResponse>;
/** @deprecated Please use `event.res.statusText` */
declare function getResponseStatusText(event: H3Event): string;
/** @deprecated Please use `event.res.headers.append(name, value)` */
declare function appendResponseHeader(event: H3Event, name: string, value: string | string[]): void;
/** @deprecated Please use `event.res.headers.append(name, value)` */
declare const appendHeader: (event: H3Event, name: string, value: string | string[]) => void;
/** @deprecated Please use `event.res.headers.set(name, value)` */
declare function setResponseHeader(event: H3Event, name: string, value: string | string[]): void;
/** @deprecated Please use `event.res.headers.set(name, value)` */
declare const setHeader: (event: H3Event, name: string, value: string | string[]) => void;
/** @deprecated Please use `event.res.headers.set(name, value)` */
declare function setResponseHeaders(event: H3Event, headers: Record<string, string>): void;
/** @deprecated Please use `event.res.headers.set(name, value)` */
declare const setHeaders: (event: H3Event, headers: Record<string, string>) => void;
/** @deprecated Please use `event.res.status` */
declare function getResponseStatus(event: H3Event): number;
/** @deprecated Please directly set `event.res.status` and `event.res.statusText` */
declare function setResponseStatus(event: H3Event, code?: number, text?: string): void;
/** @deprecated Please use `event.res.headers.set("content-type", type)` */
declare function defaultContentType(event: H3Event, type?: string): void;
/** @deprecated Please use `Object.fromEntries(event.res.headers.entries())` */
declare function getResponseHeaders(event: H3Event): Record<string, string>;
/** @deprecated Please use `event.res.headers.get(name)` */
declare function getResponseHeader(event: H3Event, name: string): string | undefined;
/** @deprecated Please use `event.res.headers.delete(name)` instead. */
declare function removeResponseHeader(event: H3Event, name: string): void;
/** @deprecated Please use `event.res.headers.append(name, value)` */
declare function appendResponseHeaders(event: H3Event, headers: Record<string, string>): void;
/** @deprecated Please use `event.res.headers.append(name, value)` */
declare const appendHeaders: (event: H3Event, headers: Record<string, string>) => void;
/** @deprecated Please use `event.res.headers.delete` */
declare function clearResponseHeaders(event: H3Event, headerNames?: string[]): void;
declare const defineEventHandler: typeof defineHandler;
declare const eventHandler: typeof defineHandler;
declare const lazyEventHandler: typeof defineLazyEventHandler;
/** @deprecated Please use `defineNodeHandler` */
declare const defineNodeListener: typeof defineNodeHandler;
/** @deprecated Please use `defineNodeHandler` */
declare const fromNodeMiddleware: (handler: NodeHandler | NodeMiddleware) => EventHandler;
/**
 * @deprecated please use `toNodeHandler` from `h3/node`.
 */
declare function toNodeHandler(app: H3): NodeHandler;
/** @deprecated Please use `toNodeHandler` */
declare const toNodeListener: (app: H3) => NodeHandler;
/** @deprecated Please use `new H3()` */
declare const createApp: (config?: H3Config) => H3;
/** @deprecated Please use `new H3()` */
declare const createRouter: (config?: H3Config) => H3;
/** @deprecated Please use `withBase()` */
declare const useBase: (base: string, input: EventHandler | H3) => EventHandler;
export { BasicAuthOptions, CacheConditions, DisposeCallback, EventStream, EventStreamMessage, EventStreamOptions, H3Error, JsonRpcError, JsonRpcMethod, JsonRpcParams, JsonRpcRequest, JsonRpcResponse, JsonRpcWebSocketMethod, NodeHandler, NodeMiddleware, RawHTML, ReadBodyOptions, RequestFingerprintOptions, ResolveDotSegmentsOptions, RouteDefinition, ServeStaticOptions, StaticAssetMeta, type WebSocketHooks, type WebSocketMessage, type WebSocketPeer, WebSocketResponse, appendAcceptQuery, appendHeader, appendHeaders, appendResponseHeader, appendResponseHeaders, assertBodySize, assertMethod, basicAuth, bodyLimit, clearResponseHeaders, createApp, createError, createEventStream, createRouter, defaultContentType, defineEventHandler, defineHandler, defineJsonRpcHandler, defineJsonRpcWebSocketHandler, defineLazyEventHandler, defineNodeHandler, defineNodeListener, defineNodeMiddleware, defineRoute, defineValidatedHandler, defineWebSocket, defineWebSocketHandler, deleteChunkedCookie, deleteCookie, dynamicEventHandler, eventHandler, fromNodeHandler, fromNodeMiddleware, fromWebHandler, getBodyStream, getChunkedCookie, getCookie, getEventContext, getHeader, getHeaders, getMethod, getQuery, getRequestFingerprint, getRequestHeader, getRequestHeaders, getRequestHost, getRequestIP, getRequestPath, getRequestProtocol, getRequestURL, getRequestWebStream, getResponseHeader, getResponseHeaders, getResponseStatus, getResponseStatusText, getRouterParam, getRouterParams, getValidatedCookies, getValidatedQuery, getValidatedRouterParams, handleCacheHeaders, html, isCanonicalPath, isError, isEvent, isHTTPEvent, isMethod, iterable, lazyEventHandler, mockEvent, noContent, onDispose, onError, onRequest, onResponse, parseCookies, raw, readBody, readFormData, readFormDataBody, readMultipartFormData, readRawBody, readValidatedBody, redirect, redirectBack, removeResponseHeader, removeRoute, requestWithBaseURL, requestWithURL, requireBasicAuth, requireContentType, resolveDotSegments, sanitizeStatusCode, sanitizeStatusMessage, sendIterable, sendNoContent, sendProxy, sendRedirect, sendStream, sendWebResponse, serveStatic, setChunkedCookie, setCookie, setHeader, setHeaders, setResponseHeader, setResponseHeaders, setResponseStatus, setServerTiming, toEventHandler, toNodeHandler, toNodeListener, toRequest, toWebHandler, useBase, withBase, withServerTiming, writeEarlyHints };