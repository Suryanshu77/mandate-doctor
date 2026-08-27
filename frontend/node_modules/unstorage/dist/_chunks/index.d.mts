import { Driver, DriverDependencies } from "unstorage";
type DriverFactory<OptionsT, InstanceT = never> = (opts: OptionsT) => Driver<OptionsT, InstanceT>;
/**
 * An optional library used by a driver.
 *
 * Drivers dynamically import their optional dependencies. If the bundler or runtime cannot
 * resolve them (or you simply prefer a static top-level import), the library can be provided
 * as the module namespace object itself or as a (possibly async) function returning it.
 *
 * @example
 * ```ts
 * import * as ioredis from "ioredis";
 * redisDriver({ lib: ioredis });
 * // or
 * redisDriver({ lib: () => import("ioredis") });
 * ```
 */
type LibImport<T> = T | (() => T | Promise<T>);
export { type DriverDependencies, DriverFactory, LibImport };