import { DriverFactory } from "../_chunks/index.mjs";
import { LocalStorageOptions } from "./localstorage.mjs";
interface SessionStorageOptions extends LocalStorageOptions {}
declare const driver: DriverFactory<SessionStorageOptions, Storage>;
export { SessionStorageOptions, driver as default };