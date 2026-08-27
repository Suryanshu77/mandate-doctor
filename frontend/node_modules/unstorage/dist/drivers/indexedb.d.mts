import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
interface IDBKeyvalOptions {
  base?: string;
  dbName?: string;
  storeName?: string;
  /**
   * Optionally provide the [`idb-keyval`](https://www.npmjs.com/package/idb-keyval) library
   * to avoid dynamically importing it.
   */
  lib?: LibImport<typeof import("idb-keyval")>;
}
declare const DRIVER_DEPENDENCIES: DriverDependencies;
declare const driver: DriverFactory<IDBKeyvalOptions>;
export { DRIVER_DEPENDENCIES, IDBKeyvalOptions, driver as default };