import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
import { RuntimeCache } from "@vercel/functions";
interface VercelCacheOptions {
  /**
   * Optional prefix to use for all keys. Can be used for namespacing.
   */
  base?: string;
  /**
   * Default TTL for all items in seconds.
   */
  ttl?: number;
  /**
   * Default tags to apply to all cache entries.
   */
  tags?: string[];
  /**
   * Optionally provide the [`@vercel/functions`](https://www.npmjs.com/package/@vercel/functions)
   * library to avoid dynamically importing it.
   *
   * Only used as a fallback when the runtime cache is not exposed via the Vercel request context.
   */
  lib?: LibImport<typeof import("@vercel/functions")>;
}
declare const DRIVER_DEPENDENCIES: DriverDependencies;
declare const driver: DriverFactory<VercelCacheOptions, Promise<RuntimeCache>>;
export { DRIVER_DEPENDENCIES, VercelCacheOptions, driver as default };