import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
import { UTApi } from "uploadthing/server";
type UTApiOptions = Omit<Exclude<ConstructorParameters<typeof UTApi>[0], undefined>, "defaultKeyType">;
interface UploadThingOptions extends UTApiOptions {
  /** base key to add to keys */
  base?: string;
  /**
   * Optionally provide the [`uploadthing/server`](https://www.npmjs.com/package/uploadthing) library
   * to avoid dynamically importing it.
   */
  lib?: LibImport<typeof import("uploadthing/server")>;
}
declare const DRIVER_DEPENDENCIES: DriverDependencies;
declare const driver: DriverFactory<UploadThingOptions, Promise<UTApi>>;
export { DRIVER_DEPENDENCIES, UploadThingOptions, driver as default };