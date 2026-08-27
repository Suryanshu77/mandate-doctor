import { DriverFactory } from "../_chunks/index.mjs";
import { Driver } from "unstorage";
interface OverlayStorageOptions {
  layers: Driver[];
}
declare const driver: DriverFactory<OverlayStorageOptions>;
export { OverlayStorageOptions, driver as default };