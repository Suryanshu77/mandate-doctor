import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
import { AzureIdentityOptions } from "../_chunks/azure.mjs";
import { SecretClient, SecretClientOptions } from "@azure/keyvault-secrets";
interface AzureKeyVaultOptions extends AzureIdentityOptions {
  /**
   * The name of the key vault to use.
   */
  vaultName: string;
  /**
   * Version of the Azure Key Vault service to use. Defaults to 7.3.
   * @default '7.3'
   */
  serviceVersion?: SecretClientOptions["serviceVersion"];
  /**
   * The number of entries to retrieve per request. Impacts getKeys() and clear() performance. Maximum value is 25.
   * @default 25
   */
  pageSize?: number;
  /**
   * Optionally provide the [`@azure/keyvault-secrets`](https://www.npmjs.com/package/@azure/keyvault-secrets)
   * library to avoid dynamically importing it.
   */
  lib?: LibImport<typeof import("@azure/keyvault-secrets")>;
}
declare const DRIVER_DEPENDENCIES: DriverDependencies;
declare const driver: DriverFactory<AzureKeyVaultOptions, Promise<SecretClient>>;
export { AzureKeyVaultOptions, DRIVER_DEPENDENCIES, driver as default };