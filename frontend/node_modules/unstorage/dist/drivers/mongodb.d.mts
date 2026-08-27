import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
import { Collection, MongoClientOptions } from "mongodb";
interface MongoDbOptions {
  /**
   * The MongoDB connection string.
   */
  connectionString: string;
  /**
   * Optional configuration settings for the MongoClient instance.
   */
  clientOptions?: MongoClientOptions;
  /**
   * The name of the database to use.
   * @default "unstorage"
   */
  databaseName?: string;
  /**
   * The name of the collection to use.
   * @default "unstorage"
   */
  collectionName?: string;
  /**
   * Optionally provide the [`mongodb`](https://www.npmjs.com/package/mongodb) library
   * to avoid dynamically importing it.
   */
  lib?: LibImport<typeof import("mongodb")>;
}
declare const DRIVER_DEPENDENCIES: DriverDependencies;
declare const driver: DriverFactory<MongoDbOptions, Promise<Collection>>;
export { DRIVER_DEPENDENCIES, MongoDbOptions, driver as default };