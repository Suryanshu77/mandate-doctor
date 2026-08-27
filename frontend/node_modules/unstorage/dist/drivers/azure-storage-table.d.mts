import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
import { AzureIdentityOptions } from "../_chunks/azure.mjs";
import { TableClient } from "@azure/data-tables";
interface AzureStorageTableOptions extends AzureIdentityOptions {
  /**
   * The name of the Azure Storage account.
   */
  accountName: string;
  /**
   * The name of the table. All entities will be stored in the same table.
   * @default 'unstorage'
   */
  tableName?: string;
  /**
   * The partition key. All entities will be stored in the same partition.
   * @default 'unstorage'
   */
  partitionKey?: string;
  /**
   * The account key. If provided, the SAS key will be ignored. Only available in Node.js runtime.
   */
  accountKey?: string;
  /**
   * The SAS key. If provided, the account key will be ignored.
   */
  sasKey?: string;
  /**
   * The connection string. If provided, the account key and SAS key will be ignored. Only available in Node.js runtime.
   */
  connectionString?: string;
  /**
   * The number of entries to retrive per request. Impacts getKeys() and clear() performance. Maximum value is 1000.
   * @default 1000
   */
  pageSize?: number;
  /**
   * Optionally provide the [`@azure/data-tables`](https://www.npmjs.com/package/@azure/data-tables)
   * library to avoid dynamically importing it.
   */
  lib?: LibImport<typeof import("@azure/data-tables")>;
}
declare const DRIVER_DEPENDENCIES: DriverDependencies;
declare const driver: DriverFactory<AzureStorageTableOptions, Promise<TableClient>>;
export { AzureStorageTableOptions, DRIVER_DEPENDENCIES, driver as default };