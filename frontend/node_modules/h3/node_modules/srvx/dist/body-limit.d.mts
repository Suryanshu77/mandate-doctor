/**
 * Returns a request whose body is size-limited to `maxRequestBodySize`.
 *
 * If the request has no body it is returned unchanged; otherwise it is wrapped
 * in a `Proxy` that routes every body read (`body` / `text` / `json` /
 * `formData` / `arrayBuffer` / `blob` / `bytes` / `bodyUsed`) through a single
 * lazily-created size-limited stream and passes everything else through to the
 * original request. Used for runtimes that have no native body-size option (e.g.
 * Deno) and exported so downstream layers can apply per-handler limits.
 *
 * srvx's `ServerRequest._request` escape hatch is served over the same limited
 * stream, so unwrapping the request (`req._request`, or `new Request(req)` under
 * `patchGlobalRequest()`, which rewrites the input to `_request`) cannot reach
 * the raw body and bypass the limit.
 *
 * Proxy-wrapping (rather than rebuilding via `new Request(request, …)`) is
 * deliberate: it preserves the exact object handed in — including srvx's
 * `ServerRequest` augmentation (`runtime`, `waitUntil`, `ip`, `context`, …) —
 * and works on the Node adapter's `ServerRequest`. The returned
 * value is the same type as the input, so `limitRequestBody(req)` on a
 * `ServerRequest` yields a `ServerRequest`.
 *
 * When the request declares a `Content-Length` that already exceeds the limit,
 * the body is rejected early: the original body is cancelled without being read
 * and the returned request's body errors immediately with the
 * {@link createBodyTooLargeError | `413`-style error}. `Content-Length` is only
 * a fast path — it may be absent (chunked transfer encoding) or understated, so
 * the streaming limit is always enforced regardless. A request that overstates
 * its `Content-Length` is rejected on the declared length (a malformed request,
 * matching how e.g. Bun and nginx enforce limits). The error still surfaces when
 * the body is consumed (`request.text()` / `.json()` / `.arrayBuffer()` /
 * `.body`), matching the streamed-limit behaviour.
 *
 * Pass {@link BodyLimitOptions.createError | `options.createError`} to throw your
 * own error on overflow (e.g. a framework's native HTTP error) instead of the
 * default {@link createBodyTooLargeError | `413`-style error}. It is used for both
 * the `Content-Length` fast path and the streaming limit, and is forwarded to
 * `clone()` so clones stay limited with the same error.
 *
 * @see https://srvx.h3.dev/guide/body-limit
 */
declare function limitRequestBody<T extends Request>(request: T, maxRequestBodySize: number, options?: BodyLimitOptions): T;
/**
 * Wraps a body `ReadableStream` so the total number of bytes read cannot exceed
 * `maxRequestBodySize`.
 *
 * The wrapper is **pull-based**: it reads from the upstream stream only when the
 * consumer pulls, so it preserves backpressure and never buffers the whole body.
 * As soon as the accumulated size passes the limit, the wrapped stream errors
 * with the {@link createBodyTooLargeError | `413`-style error} and the upstream
 * stream is cancelled with that same error (so the underlying source can stop
 * producing / release the socket). Cancelling the wrapped stream propagates to
 * the upstream stream.
 *
 * Pass {@link BodyLimitOptions.createError | `options.createError`} to error the
 * stream with your own error on overflow instead of the default
 * {@link createBodyTooLargeError | `413`-style error}.
 *
 * @see https://srvx.h3.dev/guide/body-limit
 */
declare function limitBodyStream(stream: ReadableStream<Uint8Array>, maxRequestBodySize: number, options?: BodyLimitOptions): ReadableStream<Uint8Array>;
/**
 * The canonical error thrown when a request body exceeds `maxRequestBodySize`.
 *
 * It carries a stable, documented shape so any layer can map it to an HTTP
 * `413 Payload Too Large` response without string matching.
 *
 * @see https://srvx.h3.dev/guide/body-limit
 */
interface BodyTooLargeError extends Error {
  /** Stable machine-readable code. */
  code: "ERR_BODY_TOO_LARGE";
  /** HTTP status to respond with. */
  statusCode: 413;
  /** Alias of {@link statusCode}. */
  status: 413;
}
/**
 * Factory for the error thrown when a body exceeds `maxRequestBodySize`, injectable
 * via {@link BodyLimitOptions.createError} to override the default.
 *
 * @see https://srvx.h3.dev/guide/body-limit
 */
type BodyLimitErrorFactory = (maxRequestBodySize: number) => unknown;
/**
 * Options for {@link limitRequestBody} and {@link limitBodyStream}.
 *
 * @see https://srvx.h3.dev/guide/body-limit
 */
interface BodyLimitOptions {
  /**
   * Factory for the error thrown on overflow. Defaults to {@link createBodyTooLargeError}.
   */
  createError?: BodyLimitErrorFactory;
}
/**
 * Creates the canonical {@link BodyTooLargeError | `413 Payload Too Large` error}
 * used across srvx when a request body exceeds the configured `maxRequestBodySize`.
 *
 * @see https://srvx.h3.dev/guide/body-limit
 */
declare function createBodyTooLargeError(maxRequestBodySize: number): BodyTooLargeError;
export { BodyLimitErrorFactory, BodyLimitOptions, BodyTooLargeError, createBodyTooLargeError, limitBodyStream, limitRequestBody };