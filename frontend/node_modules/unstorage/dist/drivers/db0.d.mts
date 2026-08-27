import { DriverDependencies, DriverFactory } from "../_chunks/index.mjs";
import { Connector, Database } from "db0";
interface DB0DriverOptions {
  database: Database;
  tableName?: string;
}
declare const DRIVER_DEPENDENCIES: DriverDependencies;
declare const driver: DriverFactory<DB0DriverOptions, Database<Connector<unknown>>>;
export { DB0DriverOptions, DRIVER_DEPENDENCIES, driver as default };