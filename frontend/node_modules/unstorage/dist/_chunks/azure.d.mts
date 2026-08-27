import { LibImport } from "./index.mjs";
interface AzureIdentityOptions {
  /**
   * Optionally provide the [`@azure/identity`](https://www.npmjs.com/package/@azure/identity)
   * library to avoid dynamically importing it.
   *
   * Only used when no explicit credentials (account key, SAS key or connection string) are provided.
   */
  identityLib?: LibImport<typeof import("@azure/identity")>;
}
export { AzureIdentityOptions };