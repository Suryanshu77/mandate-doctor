import { importLib } from "./utils.mjs";
async function createDefaultAzureCredential(driver, opts) {
	const { DefaultAzureCredential } = await importLib(driver, "@azure/identity", opts.identityLib, () => import("@azure/identity"));
	return new DefaultAzureCredential();
}
export { createDefaultAzureCredential };
