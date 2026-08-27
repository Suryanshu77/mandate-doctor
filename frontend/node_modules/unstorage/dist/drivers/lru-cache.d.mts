import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
import { LRUCache } from "lru-cache";
type LRUCacheOptions = LRUCache.OptionsBase<string, any, any> & Partial<LRUCache.OptionsMaxLimit<string, any, any>> & Partial<LRUCache.OptionsSizeLimit<string, any, any>> & Partial<LRUCache.OptionsTTLLimit<string, any, any>>;
interface LRUDriverOptions extends LRUCacheOptions {
  /**
   * Optionally provide the [`lru-cache`](https://www.npmjs.com/package/lru-cache) library
   * to avoid dynamically importing it.
   */
  lib?: LibImport<typeof import("lru-cache")>;
}
declare const DRIVER_DEPENDENCIES: DriverDependencies;
declare const driver: DriverFactory<LRUDriverOptions, Promise<LRUCache<string, any, any>>>;
export { DRIVER_DEPENDENCIES, LRUDriverOptions, driver as default };