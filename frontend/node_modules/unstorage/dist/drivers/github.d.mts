import { DriverFactory } from "../_chunks/index.mjs";
interface GithubOptions {
  /**
   * The name of the repository. (e.g. `username/my-repo`)
   * Required
   */
  repo: string;
  /**
   * The branch to fetch. (e.g. `dev`)
   * @default "main"
   */
  branch?: string;
  /**
   * @default ""
   */
  dir?: string;
  /**
   * @default 600
   */
  ttl?: number;
  /**
   * Github API token (recommended)
   */
  token?: string;
  /**
   * @default "https://api.github.com"
   */
  apiURL?: string;
  /**
   * @default "https://raw.githubusercontent.com"
   */
  cdnURL?: string;
}
declare const driver: DriverFactory<GithubOptions>;
export { GithubOptions, driver as default };