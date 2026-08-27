import { DriverDependencies, DriverFactory, LibImport } from "../_chunks/index.mjs";
import { GetDeployStoreOptions, GetStoreOptions, Store } from "@netlify/blobs";
declare const DRIVER_DEPENDENCIES: DriverDependencies;
type NetlifyStoreOptions = NetlifyDeployStoreLegacyOptions | NetlifyDeployStoreOptions | NetlifyNamedStoreOptions;
interface ExtraOptions {
  /** If set to `true`, the store is scoped to the deploy. This means that it is only available from that deploy, and will be deleted or rolled-back alongside it. */
  deployScoped?: boolean;
  /**
   * Optionally provide the [`@netlify/blobs`](https://www.npmjs.com/package/@netlify/blobs) library
   * to avoid dynamically importing it.
   */
  lib?: LibImport<typeof import("@netlify/blobs")>;
}
interface NetlifyDeployStoreOptions extends GetDeployStoreOptions, ExtraOptions {
  name?: never;
  deployScoped: true;
}
interface NetlifyDeployStoreLegacyOptions extends NetlifyDeployStoreOptions {
  region?: never;
}
interface NetlifyNamedStoreOptions extends GetStoreOptions, ExtraOptions {
  name: string;
  deployScoped?: false;
}
declare const driver: DriverFactory<NetlifyStoreOptions, Promise<Store>>;
export { DRIVER_DEPENDENCIES, ExtraOptions, NetlifyDeployStoreLegacyOptions, NetlifyDeployStoreOptions, NetlifyNamedStoreOptions, NetlifyStoreOptions, driver as default };