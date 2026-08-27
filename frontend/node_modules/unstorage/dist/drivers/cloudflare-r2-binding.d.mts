import { DriverFactory } from "../_chunks/index.mjs";
import * as CF from "@cloudflare/workers-types";
interface CloudflareR2Options {
  binding?: string | CF.R2Bucket;
  base?: string;
}
declare const driver: DriverFactory<CloudflareR2Options, CF.R2Bucket>;
export { CloudflareR2Options, driver as default };