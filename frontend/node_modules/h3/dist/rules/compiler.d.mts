import { RouteRuleConfig } from "../h3.mjs";
import { MatcherMemoizeOptions } from "../match.mjs";

declare const DEFAULT_RUNTIME_RULES: Readonly<Record<string, RuntimeRuleImport>>;
/** Module and optional named export for a generated rule-handler import. */
type RuntimeRuleImport = string | RuntimeRuleImportSpec;
interface RuntimeRuleImportSpec {
  source: string;
  /**
   * Named export within `source`; must be a valid JS identifier (becomes an
   * import binding in generated code).
   * @default the rule key
   */
  export?: string;
}
interface CompileRouteRulesOptions {
  /** Base URL prefix for all rule patterns (trailing slash trimmed). */
  baseURL?: string;
  /**
   * Identifier prefix for imported handlers in generated code (handler `name`
   * binds as `<prefix>$<name>`).
   * @default "__ruleHandlers__"
   */
  handlersImportName?: string;
  /**
   * Runtime rules keyed by rule name, merged **over** `DEFAULT_RUNTIME_RULES`
   * (list only additions/overrides). Keys bind as JS identifiers in generated
   * code.
   * @default DEFAULT_RUNTIME_RULES
   */
  runtimeRules?: Record<string, RuntimeRuleImport>;
  /**
   * Pre-merge each pattern's subsumption chain at compile time (exact, but
   * requires a **chain-clean** rule set). Unlike the runtime matcher, the
   * compiler is fail-safe: a non-chain-clean set emits a `console.warn` and
   * falls back to plain compilation instead of throwing.
   */
  preMerge?: boolean;
}
/**
 * Optional generated matcher export. A string sets its name; object form can
 * also enable memoization.
 */
type MatcherExport = boolean | string | {
  name?: string;
  memoize?: boolean | MatcherMemoizeOptions;
};
/** Options for compiling a complete route-rules module. */
interface CompileModuleOptions extends CompileRouteRulesOptions {
  /**
   * Also emit a ready-to-use matcher export. See {@link MatcherExport}.
   * @default false
   */
  matcher?: MatcherExport;
}
/** Compiled module source, also split into composable imports and body. */
interface CompiledRouteRules {
  /**
   * Handler import statements ({@link compileHandlersImport} output); empty
   * for a data-only rule set. Includes the matcher infra import when one is
   * requested.
   */
  imports: string;
  /**
   * `findRouteRules` export declaration (no imports), plus the matcher
   * declaration when requested. References bindings {@link imports} brings
   * into scope.
   */
  body: string;
  /** The complete module source — {@link imports} then {@link body}. Same as `toString()`. */
  code: string;
  /** The complete module source ({@link code}), so the result interpolates as a string. */
  toString(): string;
}
/**
 * Compile a rule set into a complete ESM module exporting `findRouteRules`
 * (and, with `matcher`, a ready-to-use matcher). Input is normalized
 * internally — pass authored config or already-normalized rules.
 */
declare function compileRouteRules(config: Record<string, RouteRuleConfig>, opts?: CompileModuleOptions): CompiledRouteRules;
/**
 * Compile a rule set into the source of a `findRouteRules(method, pathname)`
 * function expression. Entries reference handler constructors as
 * `<handlersImportName>$<name>` bindings — pair with
 * {@link compileHandlersImport} (which imports exactly those names).
 */
declare function compileFindRouteRules(config: Record<string, RouteRuleConfig>, opts?: CompileRouteRulesOptions): string;
/**
 * Import statement for exactly the handlers the rule set references (empty
 * string if none), keeping unused handlers' deps (e.g. ocache) tree-shakeable.
 * Input is normalized internally, so e.g. an `swr` shortcut counts as `cache`.
 */
declare function compileHandlersImport(config: Record<string, RouteRuleConfig>, opts?: CompileRouteRulesOptions): string;
export { type CompileModuleOptions, type CompileRouteRulesOptions, type CompiledRouteRules, DEFAULT_RUNTIME_RULES, type MatcherExport, type RuntimeRuleImport, type RuntimeRuleImportSpec, compileFindRouteRules, compileHandlersImport, compileRouteRules };