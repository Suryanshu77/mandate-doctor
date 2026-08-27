import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
import { Cluster, ClusterNode, ClusterOptions, Redis, RedisOptions as RedisOptions$1 } from "ioredis";
interface RedisOptions extends RedisOptions$1 {
  /**
   * Optional prefix to use for all keys. Can be used for namespacing.
   */
  base?: string;
  /**
   * Url to use for connecting to redis. Takes precedence over `host` option. Has the format `redis://<REDIS_USER>:<REDIS_PASSWORD>@<REDIS_HOST>:<REDIS_PORT>`
   */
  url?: string;
  /**
   * List of redis nodes to use for cluster mode. Takes precedence over `url` and `host` options.
   */
  cluster?: ClusterNode[];
  /**
   * Options to use for cluster mode.
   */
  clusterOptions?: ClusterOptions;
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
   * Whether to initialize the redis instance immediately.
   * Otherwise, it will be initialized on the first read/write call.
   * @default false
   */
  preConnect?: boolean;
  /**
   * Optionally provide the [`ioredis`](https://www.npmjs.com/package/ioredis) library
   * to avoid dynamically importing it.
   */
  lib?: LibImport<typeof import("ioredis")>;
}
declare const DRIVER_DEPENDENCIES: DriverDependencies;
declare const driver: DriverFactory<RedisOptions, Promise<Redis | Cluster>>;
export { DRIVER_DEPENDENCIES, RedisOptions, driver as default };