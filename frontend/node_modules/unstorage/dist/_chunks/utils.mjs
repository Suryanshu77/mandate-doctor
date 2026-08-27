async function importLib(driver, name, lib, load) {
	if (lib) return typeof lib === "function" ? await lib() : lib;
	try {
		return await load();
	} catch (cause) {
		throw createError(driver, `Cannot import \`${name}\`. Make sure it is installed or provide it via the \`lib\` option.`, { cause });
	}
}
function normalizeKey(key, sep = ":") {
	if (!key) return "";
	return key.replace(/[:/\\]/g, sep).replace(/^[:/\\]|[:/\\]$/g, "");
}
function joinKeys(...keys) {
	return keys.map((key) => normalizeKey(key)).filter(Boolean).join(":");
}
function createError(driver, message, opts) {
	const err = new Error(`[unstorage] [${driver}] ${message}`, opts);
	if (Error.captureStackTrace) Error.captureStackTrace(err, createError);
	return err;
}
function createRequiredError(driver, name) {
	if (Array.isArray(name)) return createError(driver, `Missing some of the required options ${name.map((n) => "`" + n + "`").join(", ")}`);
	return createError(driver, `Missing required option \`${name}\`.`);
}
export { createError, createRequiredError, importLib, joinKeys, normalizeKey };
