import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
import { Redis, RedisConfigNodejs } from "@upstash/redis";
interface UpstashOptions extends Partial<RedisConfigNodejs> {
  /**
   * Optional prefix to use for all keys. Can be used for namespacing.
   */
  base?: string;
  /**
   * Default TTL for all items in seconds.
   */
  ttl?: number;
  /**
   * How many keys to scan at once.
   *
   * [redis documentation](https://redis.io/docs/latest/commands/scan/#the-count-option)
   */
  scanCount?: number;
  /**
   * Optionally provide the [`@upstash/redis`](https://www.npmjs.com/package/@upstash/redis) library
   * to avoid dynamically importing it.
   */
  lib?: LibImport<typeof import("@upstash/redis")>;
}
declare const DRIVER_DEPENDENCIES: DriverDependencies;
declare const driver: DriverFactory<UpstashOptions, Promise<Redis>>;
export { DRIVER_DEPENDENCIES, UpstashOptions, driver as default };