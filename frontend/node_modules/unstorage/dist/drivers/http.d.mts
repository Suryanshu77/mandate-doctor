import { DriverFactory } from "../_chunks/index.mjs";
interface HTTPOptions {
  base: string;
  headers?: Record<string, string>;
}
declare const driver: DriverFactory<HTTPOptions>;
export { HTTPOptions, driver as default };