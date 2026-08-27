import { DriverFactory } from "../_chunks/index.mjs";
import * as DenoKV from "@deno/kv";
interface DenoKvOptions {
  base?: string;
  path?: string;
  openKv?: () => Promise<DenoKV.Kv>;
  /**
   * Default TTL for all items in seconds.
   */
  ttl?: number;
}
declare const driver: DriverFactory<DenoKvOptions, Promise<DenoKV.Kv>>;
export { DenoKvOptions, driver as default };