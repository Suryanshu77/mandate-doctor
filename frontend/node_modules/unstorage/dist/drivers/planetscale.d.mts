import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
import { Connection } from "@planetscale/database";
interface PlanetscaleDriverOptions {
  url?: string;
  table?: string;
  boostCache?: boolean;
  /**
   * Optionally provide the [`@planetscale/database`](https://www.npmjs.com/package/@planetscale/database)
   * library to avoid dynamically importing it.
   */
  lib?: LibImport<typeof import("@planetscale/database")>;
}
declare const DRIVER_DEPENDENCIES: DriverDependencies;
declare const driver: DriverFactory<PlanetscaleDriverOptions, Promise<Connection>>;
export { DRIVER_DEPENDENCIES, PlanetscaleDriverOptions, driver as default };