interface RouterContext<T = unknown> {
  root: Node<T>;
  static: Record<string, Node<T> | undefined>;
}
type ParamsIndexMap = Array<[Index: number, name: string | RegExp, optional: boolean]>;
type MethodData<T = unknown> = {
  data: T;
  paramsMap?: ParamsIndexMap;
  paramsRegexp: RegExp[];
};
interface Node<T = unknown> {
  key: string;
  static?: Record<string, Node<T>>;
  param?: Node<T>;
  wildcard?: Node<T>;
  hasRegexParam?: boolean;
  methods?: Record<string, MethodData<T>[] | undefined>;
}
type MatchedRoute<T = unknown> = {
  data: T;
  params?: Record<string, string>;
};
type ExtractWildcards<TPath extends string, Count extends readonly unknown[] = []> = TPath extends `${string}**:${infer Rest}` ? Rest extends `${infer Param}/${infer Tail}` ? Param | ExtractWildcards<Tail, Count> : Rest : TPath extends `${string}*${infer Rest}` ? Rest extends `*` ? `_` : `${Count["length"]}` | ExtractWildcards<Rest, [...Count, unknown]> : TPath extends `${string}/${infer Rest}` ? ExtractWildcards<Rest, Count> : never;
type ExtractNamedParams<TPath extends string> = TPath extends `${infer _Start}:${infer Rest}` ? Rest extends `${infer Param}/${infer Tail}` ? Param | ExtractNamedParams<`/${Tail}`> : Rest extends `${infer Param}*${infer Tail}` ? Param | ExtractNamedParams<`/${Tail}`> : Rest : TPath extends `/${infer Rest}` ? ExtractNamedParams<Rest> : never;
type InferRouteParams<TPath extends string> = { [K in ExtractNamedParams<TPath> | ExtractWildcards<TPath>]: string };
/**
* Create a new router context.
*/
declare function createRouter<T = unknown>(): RouterContext<T>;
/**
* Add a route to the router context.
*/
declare function addRoute<T>(ctx: RouterContext<T>, method: string | undefined, path: string, data?: T): void;
/**
* Find a route by path.
*/
declare function findRoute<T = unknown>(ctx: RouterContext<T>, method: string | undefined, path: string, opts?: {
  params?: boolean;
  normalize?: boolean;
}): MatchedRoute<T> | undefined;
/**
* Remove a route from the router context.
*/
declare function removeRoute<T>(ctx: RouterContext<T>, method: string | undefined, path: string): void;
/**
* Find all route patterns that match the given path.
*/
declare function findAllRoutes<T>(ctx: RouterContext<T>, method: string | undefined, path: string, opts?: {
  params?: boolean;
  normalize?: boolean;
}): MatchedRoute<T>[];
/**
* How the match-sets of two route patterns relate. See {@link compareRoutes}.
*/
type RouteComparison = "disjoint" | "equal" | "superset" | "subset" | "partial";
/**
* Whether two route patterns can match a common concrete path (their match-sets
* intersect). Pure and router-free.
*
* Overlap means "there exists a concrete path matched by both patterns" — it is
* *not* subset containment. Patterns are expanded through rou3's own pipeline,
* so groups (`{s}?`), optional/repeat modifiers (`:x?`/`:x+`/`:x*`), escaping,
* and wildcard segment-count rules match `findRoute`/`findAllRoutes` exactly.
*
* Segment-count rules: bare `**` matches zero-or-more segments, `**:name` one-
* or-more, a trailing bare `*` zero-or-one, and mid-pattern `*` / `:name`
* exactly one.
*
* Regex-constrained segments are handled precisely against static literals
* (`/user/:id(\d+)` vs `/user/42`), but two dynamic segments where at least one
* is constrained are over-approximated to "overlaps" (the safe conservative
* default; exact regex intersection is undecidable).
*
* @example
* routesOverlap("/**", "/protected/feed/**"); // true
* routesOverlap("/a/**", "/b/**"); // false
* routesOverlap("/a/**", "/a"); // true (`**` matches zero segments)
*/
declare function routesOverlap(patternA: string, patternB: string): boolean;
/**
* Compare two route patterns by the sets of concrete paths they match. Pure
* and router-free, like {@link routesOverlap}, but answers containment as well
* as intersection:
*
* - `"disjoint"` — no concrete path matches both (proven).
* - `"equal"` — both match exactly the same paths (proven; param *names*
*   don't matter: `/a/:x` equals `/a/:y`, `/u/:id(\d+)` equals `/u/:x(\d+)`).
* - `"superset"` — `patternA` provably matches every path `patternB` matches,
*   and the reverse could not be proven (strict unless equality is
*   undecidable).
* - `"subset"` — the mirror image (`patternA` ⊆ `patternB`).
* - `"partial"` — neither containment could be proven and the match-sets
*   *may* intersect.
*
* Every verdict's containment claims are proofs; what is *not* guaranteed is
* exhaustiveness of the undecidable directions, which always degrade toward a
* weaker verdict, never a wrong claim:
*
* - Two regex-constrained segments are only proven equal by source equality
*   (modulo param names), and a regex only proven to cover a literal via
*   `test()` — so `/u/:id(\d+)` vs `/u/:id([0-9]+)` reports `"partial"` even
*   though the sets are equal.
* - Strictness of `"superset"`/`"subset"` is best-effort: when a pair is
*   actually equal but equality is only provable in one direction, the proven
*   containment is reported — `/u/:id(42)` vs `/u/42` is `"superset"`, not
*   `"equal"`.
* - `"partial"`'s intersection half is over-approximated (like
*   {@link routesOverlap}): a `"partial"` pair of disjoint regex constraints,
*   e.g. `/u/:a(\d+)` vs `/u/:b([a-z]+)`, may in fact share no path.
* - Containment of one multi-shape pattern (optional groups/modifiers) in
*   another is proven shape-by-shape, so a subset split across several of the
*   other pattern's alternatives may also degrade to `"partial"`.
*
* Patterns are expanded through rou3's own `addRoute` pipeline (groups,
* modifiers, escaping), so the verdict is consistent with
* `findRoute`/`findAllRoutes` by construction — e.g. `/a/:x?` is `"equal"` to
* `/a/*` (both match `/a` and `/a/seg`).
*
* @example
* compareRoutes("/api/**", "/api/admin/**"); // "superset"
* compareRoutes("/a/:x/c", "/a/b/*"); // "partial" (ambiguous specificity)
* compareRoutes("/a/**", "/b/**"); // "disjoint"
*/
declare function compareRoutes(patternA: string, patternB: string): RouteComparison;
/**
* Find every registered route whose match-set intersects the given pattern
* (scope). Like {@link findAllRoutes}, but the query is a *pattern* instead of a
* concrete path.
*
* Results are ordered least- to most-specific (same traversal order as
* `findAllRoutes`) and method handling mirrors it (`method`, falling back to the
* method-agnostic `""` bucket). Overlap semantics are identical to
* {@link routesOverlap}.
*
* Returned matches carry only `data` — a pattern describes a whole scope rather
* than one concrete path, so no `params` can be resolved. A route registered
* with optional/group syntax expands into several tree entries that share one
* `data` reference; those are collapsed to a single match. Distinct routes are
* always reported separately, even when they carry an equal primitive `data`
* value (or none — `addRoute` stores `null` when no data is given).
*/
declare function findOverlappingRoutes<T>(ctx: RouterContext<T>, method: string | undefined, pattern: string): MatchedRoute<T>[];
/**
* The radix-tree node keys a route pattern registers on.
*
* rou3 buckets registrations by **tree node**, not by pattern text: every route
* ending on one node shares that node's `methods[]` buckets, and lookup resolves
* a node with `methods[method] || methods[""]`. Two textually distinct patterns
* that land on the same node therefore compete for one bucket — a method-scoped
* registration on that node hides the method-agnostic (`""`) one. Consumers that
* key their own per-route metadata by pattern text cannot see this and silently
* drop entries (see the README for the auth-gate shape this produces).
*
* The returned keys make node identity observable:
*
* > `routeNodeKeys(a)` and `routeNodeKeys(b)` intersect **iff** `a` and `b`
* > share a radix node (hence one `methods[]` bucket).
*
* Sound in both directions *as a statement about nodes*. It is deliberately
* **not** a statement about match-sets — the key erases regex constraints and
* widens `**:name` to `**`, so `/u/:id(\d+)` and `/u/:slug([a-z]+)` share the
* key `/u/*` while matching disjoint paths. Use {@link compareRoutes} for
* match-set relations; the two properties are independent (node identity is
* syntactic, match-set containment is semantic).
*
* Over-merging is the fail-closed direction here: a shared key means "these may
* collide, keep them in one bucket", which is the safe default for the metadata
* bucketing this is meant for.
*
* A pattern with optional syntax (`:x?`, `:x*`, `{...}?`) registers on several
* nodes, so the result is a deduplicated **array**, ordered outermost-first.
* Keys are themselves valid route patterns reaching exactly the node they name
* (`routeNodeKeys(k)` is `[k]`), so they can be used directly as bucket ids.
*
* Invalid patterns throw exactly as `addRoute` does.
*
* @example
* routeNodeKeys("/users/:id"); // ["/users/*"]
* routeNodeKeys("/users/*"); // ["/users/*"]  (same node -> same bucket)
* routeNodeKeys("/admin/**:rest"); // ["/admin/**"]
* routeNodeKeys("/a/:x?"); // ["/a", "/a/*"]
*/
declare function routeNodeKeys(pattern: string): string[];
/**
* Convert a rou3 route pattern into an anchored {@link RegExp}.
*
* The generated source targets a **PCRE-compatible** flavor: named groups use
* the `(?<name>...)` form and no JS-only constructs are emitted, so the output
* also compiles in PCRE2 engines (`grep -P`, `rg -P`, `pcre2grep`, PHP `preg_*`)
* and Perl. Trailing optional groups (`{...}?`, `:name?`) are compiled inline as
* `(?:...)?` rather than an alternation, so a param is never emitted as a
* duplicate named group — which PCRE2 rejects unless `PCRE2_DUPNAMES` is set.
*
* Note: multi-group or mid-route optionals that cannot be inlined still fall
* back to alternation and may contain duplicate named groups (valid in JS/Perl,
* but requiring `PCRE2_DUPNAMES` for strict PCRE2 engines).
*
* @example
* routeToRegExp("/users/:id(\\d+)"); // /^\/users\/(?<id>\d+)\/?$/
* routeToRegExp("/blog/:id(\\d+){-:title}?"); // /^\/blog\/(?<id>\d+)(?:-(?<title>[^/]+))?\/?$/
*/
declare function routeToRegExp(route?: string): RegExp;
/**
* Convert an anchored {@link RegExp} (or its source string) produced by
* {@link routeToRegExp} back into a rou3 route pattern.
*
* @example
* regExpToRoute(/^\/users\/(?<id>\d+)\/?$/); // "/users/:id(\\d+)"
* regExpToRoute(/^\/path\/(?<param>[^/]+)\/?$/); // "/path/:param"
* regExpToRoute(/^\/base\/?(?<path>.+)\/?$/); // "/base/**:path"
*/
declare function regExpToRoute(regexp: RegExp | string): string;
declare const NullProtoObj: {
  new (): any;
};
export { type InferRouteParams, type MatchedRoute, NullProtoObj, type RouteComparison, type RouterContext, addRoute, compareRoutes, createRouter, findAllRoutes, findOverlappingRoutes, findRoute, regExpToRoute, removeRoute, routeNodeKeys, routeToRegExp, routesOverlap };