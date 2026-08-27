import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
import { Kv, openKv } from "@deno/kv";
interface DenoKvNodeOptions {
  base?: string;
  path?: string;
  openKvOptions?: Parameters<typeof openKv>[1];
  /**
   * Optionally provide the [`@deno/kv`](https://www.npmjs.com/package/@deno/kv) library
   * to avoid dynamically importing it.
   */
  lib?: LibImport<typeof import("@deno/kv")>;
}
declare const DRIVER_DEPENDENCIES: DriverDependencies;
declare const driver: DriverFactory<DenoKvNodeOptions, Promise<Kv>>;
export { DRIVER_DEPENDENCIES, DenoKvNodeOptions, driver as default };