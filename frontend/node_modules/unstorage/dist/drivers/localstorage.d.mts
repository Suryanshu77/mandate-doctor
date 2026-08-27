import { DriverFactory } from "../_chunks/index.mjs";
interface LocalStorageOptions {
  base?: string;
  window?: typeof window;
  windowKey?: "localStorage" | "sessionStorage";
  storage?: typeof window.localStorage | typeof window.sessionStorage;
  /** @deprecated use `storage` option */
  sessionStorage?: typeof window.sessionStorage;
  /** @deprecated use `storage` option */
  localStorage?: typeof window.localStorage;
}
declare const driver: DriverFactory<LocalStorageOptions, Storage>;
export { LocalStorageOptions, driver as default };