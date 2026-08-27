import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
import { Preferences } from "@capacitor/preferences";
declare const DRIVER_DEPENDENCIES: DriverDependencies;
interface CapacitorPreferencesOptions {
  base?: string;
  /**
   * Optionally provide the [`@capacitor/preferences`](https://www.npmjs.com/package/@capacitor/preferences)
   * library to avoid dynamically importing it.
   */
  lib?: LibImport<typeof import("@capacitor/preferences")>;
}
declare const driver: DriverFactory<CapacitorPreferencesOptions, Promise<typeof Preferences>>;
export { CapacitorPreferencesOptions, DRIVER_DEPENDENCIES, driver as default };