import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
import { AzureIdentityOptions } from "../_chunks/azure.mjs";
import { AppConfigurationClient } from "@azure/app-configuration";
interface AzureAppConfigurationOptions extends AzureIdentityOptions {
  /**
   * Optional prefix for keys. This can be used to isolate keys from different applications in the same Azure App Configuration instance. E.g. "app01" results in keys like "app01:foo" and "app01:bar".
   * @default null
   */
  prefix?: string;
  /**
   * Optional label for keys. If not provided, all keys will be created and listed without labels. This can be used to isolate keys from different environments in the same Azure App Configuration instance. E.g. "dev" results in keys like "foo" and "bar" with the label "dev".
   * @default '\0'
   */
  label?: string;
  /**
   * Optional endpoint to use when connecting to Azure App Configuration. If not provided, the appConfigName option must be provided. If both are provided, the endpoint option takes precedence.
   * @default null
   */
  endpoint?: string;
  /**
   * Optional name of the Azure App Configuration instance to connect to. If not provided, the endpoint option must be provided. If both are provided, the endpoint option takes precedence.
   * @default null
   */
  appConfigName?: string;
  /**
   * Optional connection string to use when connecting to Azure App Configuration. If not provided, the endpoint option must be provided. If both are provided, the endpoint option takes precedence.
   * @default null
   */
  connectionString?: string;
  /**
   * Optionally provide the [`@azure/app-configuration`](https://www.npmjs.com/package/@azure/app-configuration)
   * library to avoid dynamically importing it.
   */
  lib?: LibImport<typeof import("@azure/app-configuration")>;
}
declare const DRIVER_DEPENDENCIES: DriverDependencies;
declare const driver: DriverFactory<AzureAppConfigurationOptions, Promise<AppConfigurationClient>>;
export { AzureAppConfigurationOptions, DRIVER_DEPENDENCIES, driver as default };