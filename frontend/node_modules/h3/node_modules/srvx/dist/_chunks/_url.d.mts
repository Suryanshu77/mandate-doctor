type URLInit = {
  protocol: string;
  host: string;
  pathname: string;
  search: string;
};
/**
 * URL wrapper with fast paths to access to the following props:
 *
 *  - `url.pathname`
 *  - `url.search`
 *  - `url.searchParams`
 *  - `url.protocol`
 *
 * **NOTES:**
 *
 * - It is assumed that the input URL is **already encoded** and formatted from an HTTP request. A fragment (`#`), while not valid in an origin-form request target, is handled via full URL parsing.
 * - Triggering the setters or getters on other props will deoptimize to full URL parsing.
 * - Mutating `searchParams` deoptimizes to full URL parsing; changes are reflected in `search`/`href` and the same `searchParams` object is kept across deopts (native `URL` semantics).
 */
declare const FastURL: {
  new (url: string | URLInit): URL & {
    _url: URL;
  };
};
export { FastURL };