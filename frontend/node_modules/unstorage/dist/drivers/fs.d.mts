import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
import { ChokidarOptions } from "chokidar";
interface FSStorageOptions {
  base?: string;
  ignore?: string[];
  readOnly?: boolean;
  noClear?: boolean;
  watchOptions?: ChokidarOptions;
  /**
   * Write each item to a temporary file and rename it over the destination, so that concurrent
   * readers never observe a partially written file.
   *
   * Renaming replaces the destination inode. The file mode is preserved, but ownership, ACLs and
   * extended attributes are not, symbolic links are replaced instead of written through, and hard
   * links to the destination stop tracking it. Small writes are also around twice as slow.
   *
   * @default false
   */
  atomic?: boolean;
  /**
   * Optionally provide the [`chokidar`](https://www.npmjs.com/package/chokidar) library
   * to avoid dynamically importing it.
   *
   * Only used by `watch()`.
   */
  lib?: LibImport<typeof import("chokidar")>;
}
declare const DRIVER_DEPENDENCIES: DriverDependencies;
declare const driver: DriverFactory<FSStorageOptions>;
export { DRIVER_DEPENDENCIES, FSStorageOptions, driver as default };