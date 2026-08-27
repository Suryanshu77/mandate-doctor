import { RuleHandler } from "../h3.mjs";
import { CachedEventHandlerOptions, StorageOption } from "ocache";

interface OcacheRuleHandlerOptions {
  /**
   * ocache storage instance, or a factory resolved on first use. Shared by every
   * cache rule this handler serves. Defaults to one lazily created memory store.
   */
  storage?: StorageOption;
  /** Default ocache options. Rule options take precedence. */
  defaults?: CachedEventHandlerOptions;
  /** Stable cache-key scope. Set this when sharing persistent storage across processes. */
  id?: string;
}
/**
 * Create an ocache-backed `cache` rule handler.
 *
 * Every rule this handler serves shares one storage instance: the supplied
 * `storage`, or a memory store shared by every handler with the same `id`.
 */
declare function createOcacheRuleHandler(opts?: OcacheRuleHandlerOptions): RuleHandler<"cache">;
/** Shared default handler imported by compiled matchers and registered explicitly at runtime. */
declare const cache: RuleHandler<"cache">;
export { OcacheRuleHandlerOptions, cache, createOcacheRuleHandler };