import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
import { AzureIdentityOptions } from "../_chunks/azure.mjs";
import { Container } from "@azure/cosmos";
interface AzureCosmosOptions extends AzureIdentityOptions {
  /**
   * CosmosDB endpoint in the format of https://<account>.documents.azure.com:443/.
   */
  endpoint: string;
  /**
   * CosmosDB account key. If not provided, the driver will use the DefaultAzureCredential (recommended).
   */
  accountKey?: string;
  /**
   * The name of the database to use. Defaults to `unstorage`.
   * @default "unstorage"
   */
  databaseName?: string;
  /**
   * The name of the container to use. Defaults to `unstorage`.
   * @default "unstorage"
   */
  containerName?: string;
  /**
   * Optionally provide the [`@azure/cosmos`](https://www.npmjs.com/package/@azure/cosmos) library
   * to avoid dynamically importing it.
   */
  lib?: LibImport<typeof import("@azure/cosmos")>;
}
declare const DRIVER_DEPENDENCIES: DriverDependencies;
interface AzureCosmosItem {
  /**
   * The unstorage key as id of the item.
   */
  id: string;
  /**
   * The unstorage value of the item.
   */
  value: string;
  /**
   * The unstorage mtime metadata of the item.
   */
  modified: string | Date;
}
declare const driver: DriverFactory<AzureCosmosOptions, Promise<Container>>;
export { AzureCosmosItem, AzureCosmosOptions, DRIVER_DEPENDENCIES, driver as default };