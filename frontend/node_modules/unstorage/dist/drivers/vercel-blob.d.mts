import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
import * as blob from "@vercel/blob";
interface VercelBlobOptions {
  /**
   * Whether the blob should be publicly or privately accessible.
   *
   * - `"public"`: Blobs are accessible via their URL without authentication.
   * - `"private"`: Blobs require authentication to access.
   */
  access: "public" | "private";
  /**
   * Prefix to prepend to all keys. Can be used for namespacing.
   */
  base?: string;
  /**
   * Rest API Token to use for connecting to your Vercel Blob store.
   * If not provided, it will be read from the environment variable `BLOB_READ_WRITE_TOKEN`.
   */
  token?: string;
  /**
   * Prefix to use for token environment variable name.
   * Default is `BLOB` (env name = `BLOB_READ_WRITE_TOKEN`).
   */
  envPrefix?: string;
  /**
   * Optionally provide the [`@vercel/blob`](https://www.npmjs.com/package/@vercel/blob) library
   * to avoid dynamically importing it.
   */
  lib?: LibImport<typeof import("@vercel/blob")>;
}
declare const DRIVER_DEPENDENCIES: DriverDependencies;
declare const driver: DriverFactory<VercelBlobOptions, Promise<typeof blob>>;
export { DRIVER_DEPENDENCIES, VercelBlobOptions, driver as default };