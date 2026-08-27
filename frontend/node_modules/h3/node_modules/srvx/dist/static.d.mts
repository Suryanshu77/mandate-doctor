import { ServerMiddleware } from "./_chunks/types.mjs";
interface StaticMiddlewareOptions {
  /**
   * The directory to serve static files from.
   */
  dir: string;
  /**
   * The HTTP methods to allow for serving static files.
   */
  methods?: string[];
  /**
   * Dot segments (a path segment starting with `.`, such as `.env` or `.git`) that may be served.
   *
   * An array allow-lists segments by exact name; a path containing any other dot segment falls
   * through to `next()`. `true` serves every dot segment, `false` (or `[]`) none.
   *
   * @default [".well-known"]
   */
  dotfiles?: boolean | string[];
  /**
   * Serve precompressed variants from disk. Off by default: most deployments ship none,
   * so probing for one is a `stat` that always misses, on every compressible request.
   *
   * `true` uses `{ br: ".br", gzip: ".gz" }`; a map sets the extension per encoding (keys
   * tried in order, so list the preferred encoding first). For `/app.js` with
   * `Accept-Encoding: br`, `app.js.br` is served if it exists. A variant always wins over
   * on-the-fly `compress`, as it costs no CPU. `false` (the default) skips the lookup.
   *
   * @default false
   */
  encodings?: boolean | Record<string, string>;
  /**
   * Compress a response on the fly when no precompressed variant is served.
   *
   * Applies to compressible types only, and only to files between 1 KiB and 10 MiB —
   * precompress anything larger. Pass `false` to serve only what is already on disk (with
   * `encodings` off too, nothing is ever compressed).
   *
   * @default true
   */
  compress?: boolean;
  /**
   * Emit a `Last-Modified` header from the file's modification time, and answer an
   * `If-Modified-Since` conditional request that still matches with `304 Not Modified`.
   *
   * @default true
   */
  lastModified?: boolean;
  /**
   * Emit an `ETag` validator, and answer an `If-None-Match` conditional request that still
   * matches with `304 Not Modified`.
   *
   * The tag is weak (`W/"…"`): it is derived from the file's size and modification time
   * rather than its bytes, and folds in the `Content-Encoding`, so a brotli and a gzip
   * response under one URL never share one — which a cache keying on `Vary` relies on.
   *
   * @default true
   */
  etag?: boolean;
  /**
   * Freshness lifetime, in **seconds**, emitted as `Cache-Control: max-age=<n>`.
   *
   * Off by default: no `Cache-Control` header is sent, so a client revalidates
   * with the `ETag`/`Last-Modified` validators on every use. Set it to let a
   * client reuse a response without a request until it goes stale.
   *
   * @default undefined
   */
  maxAge?: number;
  /**
   * Add the `immutable` directive to `Cache-Control`, telling a client not to
   * revalidate a still-fresh response even on an explicit reload.
   *
   * Only takes effect alongside `maxAge`, and only makes sense for a
   * fingerprinted (content-hashed) asset, whose URL changes when its bytes do.
   *
   * @default false
   */
  immutable?: boolean;
  /**
   * Answer a single byte-range GET request with `206 Partial Content`, and
   * advertise `Accept-Ranges: bytes` on responses that could serve one.
   *
   * A range request is served the identity bytes only — content negotiation is
   * skipped — since a range over an on-the-fly (chunked) encoding is not
   * expressible, and range consumers (media seek, download resumption) target
   * already-compressed types. `false` disables it: no `206`/`416`, and the
   * header is never sent.
   *
   * @default true
   */
  ranges?: boolean;
  /**
   * A function to modify the HTML content before serving it.
   */
  renderHTML?: (ctx: {
    request: Request;
    html: string;
    filename: string;
  }) => Response | Promise<Response>;
}
declare const staticMiddleware: (options: StaticMiddlewareOptions) => ServerMiddleware;
export { StaticMiddlewareOptions, staticMiddleware };