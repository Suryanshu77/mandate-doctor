import { DriverFactory } from "../_chunks/index.mjs";
interface FSStorageOptions {
  base?: string;
  ignore?: (path: string) => boolean;
  readOnly?: boolean;
  noClear?: boolean;
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
}
declare const driver: DriverFactory<FSStorageOptions>;
export { FSStorageOptions, driver as default };